"use client"

import { cn } from "@/lib/utils"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { VariantProps, cva } from "class-variance-authority"
import * as React from "react"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const portalVariants = cva("fixed inset-0 z-50 flex", {
	variants: {
		position: {
			top: "items-start",
			bottom: "items-end",
			left: "justify-start",
			right: "justify-end",
		},
	},
	defaultVariants: { position: "right" },
})

interface SheetPortalProps
	extends SheetPrimitive.DialogPortalProps,
		VariantProps<typeof portalVariants> {}

const SheetPortal = ({
	position,
	className,
	children,
	...props
}: SheetPortalProps) => (
	<SheetPrimitive.Portal className={cn(className)} {...props}>
		<div className={portalVariants({ position })}>{children}</div>
	</SheetPrimitive.Portal>
)
SheetPortal.displayName = SheetPrimitive.Portal.displayName

const SheetOverlay = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, children, ...props }, ref) => (
	<SheetPrimitive.Overlay
		className={cn(
			"data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-100",
			className
		)}
		{...props}
		ref={ref}
	/>
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
	"fixed z-50 scale-100 gap-4 bg-white p-6 opacity-100 dark:bg-neutral-900",
	{
		variants: {
			position: {
				top: "animate-in slide-in-from-top w-full duration-300",
				bottom: "animate-in slide-in-from-bottom w-full duration-300",
				left: "animate-in slide-in-from-left h-full duration-300",
				right: "animate-in slide-in-from-right h-full duration-300",
			},
			size: {
				content: "",
				default: "",
				sm: "",
				lg: "",
				xl: "",
				full: "",
			},
		},
		compoundVariants: [
			{
				position: ["top", "bottom"],
				size: "content",
				class: "max-h-screen",
			},
			{
				position: ["top", "bottom"],
				size: "default",
				class: "h-1/3",
			},
			{
				position: ["top", "bottom"],
				size: "sm",
				class: "h-1/4",
			},
			{
				position: ["top", "bottom"],
				size: "lg",
				class: "h-1/2",
			},
			{
				position: ["top", "bottom"],
				size: "xl",
				class: "h-5/6",
			},
			{
				position: ["top", "bottom"],
				size: "full",
				class: "h-screen",
			},
			{
				position: ["right", "left"],
				size: "content",
				class: "max-w-screen",
			},
			{
				position: ["right", "left"],
				size: "default",
				class: "w-1/3",
			},
			{
				position: ["right", "left"],
				size: "sm",
				class: "w-1/4",
			},
			{
				position: ["right", "left"],
				size: "lg",
				class: "w-1/2",
			},
			{
				position: ["right", "left"],
				size: "xl",
				class: "w-5/6",
			},
			{
				position: ["right", "left"],
				size: "full",
				class: "w-screen",
			},
		],
		defaultVariants: {
			position: "right",
			size: "default",
		},
	}
)

export interface DialogContentProps
	extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
		VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Content>,
	DialogContentProps
>(({ position, size, className, children, ...props }, ref) => (
	<SheetPortal position={position}>
		<SheetOverlay />
		<SheetPrimitive.Content
			ref={ref}
			className={cn(sheetVariants({ position, size }), className)}
			{...props}
		>
			{children}
			<SheetPrimitive.Close className="h-6 w-6 absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-neutral-100 dark:focus:ring-neutral-400 dark:focus:ring-offset-neutral-900 dark:data-[state=open]:bg-neutral-800">
				<span className="i-carbon-close h-6 w-6" />
				<span className="sr-only">Close</span>
			</SheetPrimitive.Close>
		</SheetPrimitive.Content>
	</SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

export { Sheet, SheetTrigger, SheetContent }
