"use client"

import { useState } from "react"
import { ConfluencePanel } from "./confluence-panel"
import { StrategyControlPanel } from "./strategy-control-panel"
import { FundingRateMonitor } from "./funding-rate-monitor"

export function RightPanel() {
  const [activeView, setActiveView] = useState<"confluence" | "funding">("confluence")

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      <div className="flex gap-1">
        <button
          onClick={() => setActiveView("confluence")}
          className={`flex-1 py-1 text-[9px] font-bold border transition-all ${
            activeView === "confluence"
              ? "border-[#00ffff] bg-[#00ffff15] text-[#00ffff]"
              : "border-[#ffffff20] text-[#ffffff40] hover:border-[#ffffff40]"
          }`}
        >
          CONFLUENCE
        </button>
        <button
          onClick={() => setActiveView("funding")}
          className={`flex-1 py-1 text-[9px] font-bold border transition-all ${
            activeView === "funding"
              ? "border-[#facc15] bg-[#facc1515] text-[#facc15]"
              : "border-[#ffffff20] text-[#ffffff40] hover:border-[#ffffff40]"
          }`}
        >
          FUNDING
        </button>
      </div>

      <div className="flex-1 min-h-0">{activeView === "confluence" ? <ConfluencePanel /> : <FundingRateMonitor />}</div>

      <div className="flex-shrink-0">
        <StrategyControlPanel />
      </div>
    </div>
  )
}
