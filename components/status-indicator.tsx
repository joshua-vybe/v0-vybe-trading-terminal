"use client"

import { useEffect, useState } from "react"

interface StatusIndicatorProps {
  status: "online" | "syncing" | "warning" | "offline" | string
  label?: string
  showPulse?: boolean
}

export function StatusIndicator({ status, label, showPulse = true }: StatusIndicatorProps) {
  const [dataPackets, setDataPackets] = useState(0)

  useEffect(() => {
    if (status === "online" || status === "syncing") {
      const interval = setInterval(() => {
        setDataPackets((prev) => prev + Math.floor(Math.random() * 10))
      }, 100)
      return () => clearInterval(interval)
    }
  }, [status])

  const colors: Record<string, { bg: string; glow: string; text: string }> = {
    online: { bg: "bg-green-500", glow: "shadow-green-500/50", text: "text-green-400" },
    syncing: { bg: "bg-cyan-500", glow: "shadow-cyan-500/50", text: "text-cyan-400" },
    warning: { bg: "bg-yellow-500", glow: "shadow-yellow-500/50", text: "text-yellow-400" },
    offline: { bg: "bg-red-500", glow: "shadow-red-500/50", text: "text-red-400" },
  }

  const { bg, glow, text } = colors[status] || colors.online

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${bg} ${showPulse ? "animate-pulse" : ""}`} />
        {showPulse && status !== "offline" && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${bg} animate-ping opacity-75`} />
        )}
      </div>
      {label && (
        <span className={`text-[10px] uppercase tracking-wider ${text}`}>
          {label}
          {status === "syncing" && <span className="ml-1 opacity-60">[{dataPackets.toLocaleString()}]</span>}
        </span>
      )}
    </div>
  )
}
