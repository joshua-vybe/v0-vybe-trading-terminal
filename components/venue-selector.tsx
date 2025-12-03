"use client"

import { getVenueColor } from "@/lib/venue-colors"

interface VenueSelectorProps {
  selected: string
  onChange: (venue: string) => void
}

const venues = [
  { id: "HYPERLIQUID", short: "HL" },
  { id: "ASTER", short: "AST" },
  { id: "NADO", short: "NAD" },
  { id: "ORDERLY", short: "ORD" },
]

export function VenueSelector({ selected, onChange }: VenueSelectorProps) {
  return (
    <div className="neon-border glass-panel p-3">
      <div className="text-[10px] text-[#00ffff60] mb-2">SELECT VENUE</div>
      <div className="grid grid-cols-2 gap-2">
        {venues.map((venue) => {
          const isSelected = selected === venue.id
          const { primary, glow } = getVenueColor(venue.id)

          return (
            <button
              key={venue.id}
              onClick={() => onChange(venue.id)}
              className="p-2 text-[10px] font-bold border transition-all"
              style={{
                borderColor: isSelected ? primary : `${primary}30`,
                color: isSelected ? primary : `${primary}60`,
                backgroundColor: isSelected ? `${primary}10` : "transparent",
                boxShadow: isSelected ? glow : "none",
              }}
            >
              <pre className="leading-tight">
                {isSelected
                  ? `┌${"─".repeat(venue.id.length + 2)}┐
│ ${venue.id} │
└${"─".repeat(venue.id.length + 2)}┘`
                  : `[${venue.id}]`}
              </pre>
            </button>
          )
        })}
      </div>
    </div>
  )
}
