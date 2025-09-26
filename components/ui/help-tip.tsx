"use client"

import * as React from "react"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

type HelpTipProps = {
  content: React.ReactNode
  ariaLabel?: string
  className?: string
}

export function HelpTip({ content, ariaLabel = "Más información", className }: HelpTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={
            "inline-flex items-center justify-center size-7 sm:size-6 rounded-md text-[var(--primary)] " +
            "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring outline-none " +
            "transition-colors hover:text-[var(--primary)]/90 touch-manipulation " +
            (className ? ` ${className}` : "")
          }
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  )
}
