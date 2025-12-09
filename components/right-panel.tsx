"use client"

import { ConfluencePanel } from "./confluence-panel"
import { StrategyControlPanel } from "./strategy-control-panel"

export function RightPanel() {
  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      <div className="flex-1 min-h-0">
        <ConfluencePanel />
      </div>

      <div className="flex-shrink-0">
        <StrategyControlPanel />
      </div>
    </div>
  )
}
