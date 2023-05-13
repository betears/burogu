import { cn } from "@/lib/utils"

export default function MarkdownWrapper({
	className,
	children,
}: {
	className?: string
	children: React.ReactNode
}) {
	return (
		<article
			className={cn(
				"flex flex-col gap-4 relative",
				"prose prose-neutral dark:prose-invert",
				"prose-h1:my-0 prose-h2:my-0 prose-h3:my-0 prose-h4:my-0 prose-h5:my-0 prose-h6:my-0",
				"prose-ul:my-0 prose-ol:my-0 prose-p:my-0",
				"prose-a:no-underline prose-a:border-dotted prose-a:border-b-2 prose-a:pb-[3px] hover:prose-a:border-solid",
				className
			)}
		>
			{children}
		</article>
	)
}
