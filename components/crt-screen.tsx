"use client"

import type { ReactNode } from "react"

interface CRTScreenProps {
  children: ReactNode
}

export function CRTScreen({ children }: CRTScreenProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Ambient corner glows - Blade Runner style */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-fuchsia-500/5 blur-3xl pointer-events-none" />

      {/* Subtle horizontal scan line - very slow */}
      <div
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none z-[99]"
        style={{
          animation: "slow-scan 8s linear infinite",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>

      <style jsx>{`
        @keyframes slow-scan {
          0% { top: -1px; opacity: 0; }
          5% { opacity: 0.5; }
          95% { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
