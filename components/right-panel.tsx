"use client"

import { ConfluencePanel } from "./confluence-panel"
import { OrderEntry } from "./order-entry"

export function RightPanel() {
  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      <div className="flex-1 min-h-0">
        <ConfluencePanel />
      </div>

      {/* Order Entry - fixed height, no shrink */}
      <div className="flex-shrink-0">
        <OrderEntry />
      </div>
    </div>
  )
}
