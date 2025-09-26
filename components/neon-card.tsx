import * as React from "react"
import { cn } from "@/lib/utils"

export function NeonCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border-2",
        "border-[var(--primary)] bg-black/50 backdrop-blur-xl",
        "shadow-[var(--neon-shadow-soft)]",
        "before:content-[''] before:absolute before:inset-[-2px] before:rounded-[inherit] before:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(109,0,255,0.35),transparent_70%)] before:opacity-70 before:-z-10",
        className
      )}
    >
      {children}
    </div>
  )
}
