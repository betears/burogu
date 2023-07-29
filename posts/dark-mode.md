---
cover: ""
publish: true
date: 2023/1/13 10:28:25
updated: 2023/1/13 10:28:25
tags:
  - dark-mode
  - jotai
---

# 如何优雅的支持深色模式

## 适配深色模式的网站示例

[VueUse（双选）](https://vueuse.org/)

[Tailwind CSS（三选）](https://tailwindcss.com/)

## CSR Only

如果只是客户端渲染的网页的话，事情还是很简单的。基本思路如下：

首先使用 jotai 定义一份用户偏好的全局设置，持久化到存储中。

```ts
const themeOptions = ["system", "light", "dark"] as const
export type Theme = (typeof themeOptions)[number]

const appearanceAtom = atomWithStorage<Theme>("use-dark", "system")
```

基于 jotai 的 atom 来实现自定义 hook `useDark`。
综合用户和系统的选择来判断网页是否是深色，同时同步状态到 html 节点的 class 属性中。
值得一提的是，当用户偏好和系统偏好保持一致时，我们需要更新用户偏好，以让网页恢复跟随系统偏好。

```tsx
export function useDark() {
  const [setting, setSetting] = useAtom(appearanceAtom)
  const isDark = useMedia("(prefers-color-scheme: dark)")

  useEffect(() => {
    const isDarkMode = setting === "dark" || (isDark && setting !== "light")
    if (isDarkMode) {
      document.documentElement.classList.toggle("dark", true)
    } else {
      document.documentElement.classList.toggle("dark", false)
    }
    if ((setting === "dark" && isDark) || (setting === "light" && !isDark)) {
      setSetting("system")
    }
  }, [setting, isDark, setSetting])

  const toggleDark = () => {
    if (setting === "system") {
      setSetting(isDark ? "light" : "dark")
    } else {
      setSetting("system")
    }
  }

  return [
    setting === "dark" || (isDark && setting !== "light"),
    toggleDark,
  ] as const
}
```

应用自定义 hook 到主题切换的按钮和需要对接深色模式状态的组件上即可。

可以看到，一切都很自然，客户端渲染的特性让我们不会看到还不完整的界面。
在渲染组件时触发的 `useEffect` 会正确同步 dark 信息到 html 的 class 标签上，界面不会有深浅模式切换的闪烁。

> 对于 Vue.js 的开发者，可以直接使用 vueuse 中包含的 [useDark](https://vueuse.org/core/usedark/#usedark) 函数。
> 需要指出，这个函数返回的状态并非全局状态。

### 支持 Electron

要支持 Electron，在有可调用的 API 的情况下，我们需要同步软件主题偏好。

```tsx
if (window.electron) {
  window.electron.setTheme(
    setting === "system" ? (isDark ? "light" : "dark") : "system",
  )
}
```

移除重置主题的操作

```tsx
if (!window.electron) {
  if ((setting === "dark" && isDark) || (setting === "light" && !isDark)) {
    setSetting("system")
  }
}
```

不过，更推荐的是隐藏掉系统标题栏，手动绘制，这样不必特地适配。
查看 [Electron 深色模式支持](https://www.notion.so/Electron-86cfd32d9fe24f0dbd1c367a20ca5b50?pvs=21)

## 考虑 SSR

如果我们将上面的逻辑直接迁移到 Next.js 的话，就会出现闪烁的问题。

原因在于 Next.js 返回的首屏网页是完整内容的 html，浏览器已经可以直接加载出界面。
然而在服务端，我们无法提前知道用户浏览器的外观偏好设置。
当浏览器的偏好和返回的 html 设定不一致的时候，触发状态的同步就会导致浏览器界面闪烁。

### 如何解决

1. 使用第三方库 [next-themes](https://github.com/pacocoursey/next-themes) 直接解决
2. 在网站返回的 html 实际内容注入脚本，在页面加载之前执行来确保网页显示的主题正确

### 支持 Next.js 13?

在 Next.js 13 版本中，app 目录下的组件默认为服务端组件，next-themes 的 provider 或是我们自己的脚本，都需要为客户端组件。

> 参考 [Rendering third-party context providers in Server Components](https://nextjs.org/docs/getting-started/react-essentials#rendering-third-party-context-providers-in-server-components) 了解更多

```tsx
"use client"

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        id="change-theme"
        dangerouslySetInnerHTML={{
          __html: `!function(){var e=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches,t=localStorage.getItem("use-dark")||"system";('"dark"'===t||e&&'"light"'!==t)&&document.documentElement.classList.toggle("dark",!0)}()`,
        }}
      ></script>
      {children}
    </>
  )
}
```

顺便一提，jotai 在将字符串存储到 storage 里面时，会加上 “”。
因此，上面的脚本中，当我们手动取值时，实际取出的内容需要补上它。

此外，由于脚本会修改 html 标签上的 class 属性，导致客户端的网页和浏览器的网页内容不一致。
我们需要为 html 标签加上 `suppressHydrationWarning` 属性来告诉 Next.js 在激活时忽略它。

## 一点点动画

首先我们可以给整个网站在深浅色切换时的颜色过渡加上一点点 transition。`transition-colors duration-500`

然后就是切换主题的按钮，深浅色图标切换时加上一点旋转的动画。

```tsx
export default function AppearanceSwitch() {
  const [, toggleDark] = useDark()

  return (
    <button onClick={toggleDark} className="text-2xl flex">
      <div className="i-carbon-sun rotate-0 scale-100 transition-transform duration-500 dark:-rotate-90 dark:scale-0" />
      <div className="i-carbon-moon absolute rotate-90 scale-0 transition-transform duration-500 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
```

## 📖  阅读更多

1. [你好黑暗，我的老朋友 —— 为网站添加用户友好的深色模式支持](https://blog.skk.moe/post/hello-darkmode-my-old-friend)
2. [为网站添加用户友好的深色模式支持](https://blog.skk.moe/post/use-nextjs-and-hexo-to-rebuild-my-blog/#Wei-Wang-Zhan-Tian-Jia-Yong-Hu-You-Hao-De-Shen-Se-Mo-Shi-Zhi-Chi)
3. [next-themes 关于 nextjs 13 支持的讨论](https://github.com/pacocoursey/next-themes/issues/152)
4. [使用 suppressHydrationWarning 来处理报错](https://github.com/pacocoursey/next-themes/issues/152#issuecomment-1364280564)
