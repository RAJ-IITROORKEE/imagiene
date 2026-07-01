"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

function TooltipProvider({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="tooltip-provider" {...props}>{children}</div>
}

function Tooltip({
  children,
  ...props
}: React.ComponentProps<"span">) {
  return <span data-slot="tooltip" {...props}>{children}</span>
}

function TooltipTrigger({
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

  return <Comp data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  children,
  hidden,
  side,
  align,
  sideOffset,
  ...props
}: React.ComponentProps<"span"> & {
  side?: string
  align?: string
  sideOffset?: number
}) {
  if (hidden) {
    return null
  }

  return (
    <span
      data-slot="tooltip-content"
      data-side={side}
      data-align={align}
      data-side-offset={sideOffset}
      role="tooltip"
      className={cn(
        "pointer-events-none fixed z-50 hidden w-fit max-w-xs rounded-md bg-foreground px-3 py-1.5 text-xs text-background group-data-[state=collapsed]/sidebar-wrapper:inline-flex",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
