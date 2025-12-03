"use client"

import type { ReactNode } from "react"

interface CRTScreenProps {
  children: ReactNode
}

export function CRTScreen({ children }: CRTScreenProps) {
  return (
    <div className="crt-screen relative w-full h-full overflow-hidden">
      {/* VHS tracking lines effect */}
      <div className="absolute inset-0 pointer-events-none z-[99] opacity-[0.03]">
        <div className="absolute w-full h-[2px] bg-white animate-pulse" style={{ top: "20%" }} />
        <div
          className="absolute w-full h-[1px] bg-white animate-pulse"
          style={{ top: "45%", animationDelay: "0.5s" }}
        />
        <div className="absolute w-full h-[2px] bg-white animate-pulse" style={{ top: "78%", animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
