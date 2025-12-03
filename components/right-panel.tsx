"use client"
import { VenueSelector } from "./venue-selector"
import { Orderbook } from "./orderbook"
import { OrderEntry } from "./order-entry"

interface RightPanelProps {
  selectedVenue: string
  onVenueChange: (venue: string) => void
}

export function RightPanel({ selectedVenue, onVenueChange }: RightPanelProps) {
  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* Venue Selector */}
      <VenueSelector selected={selectedVenue} onChange={onVenueChange} />

      {/* Orderbook - takes remaining space with scroll */}
      <div className="flex-1 min-h-0 overflow-auto">
        <Orderbook venue={selectedVenue} />
      </div>

      {/* Order Entry - fixed height, no shrink */}
      <div className="flex-shrink-0">
        <OrderEntry venue={selectedVenue} />
      </div>
    </div>
  )
}
