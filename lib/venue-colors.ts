export const VENUE_COLORS = {
  HYPERLIQUID: { primary: "#00ffff", glow: "0 0 8px #00ffff" },
  HL: { primary: "#00ffff", glow: "0 0 8px #00ffff" },
  ASTER: { primary: "#ff00ff", glow: "0 0 8px #ff00ff" },
  AST: { primary: "#ff00ff", glow: "0 0 8px #ff00ff" },
  NADO: { primary: "#facc15", glow: "0 0 8px #facc15" },
  NAD: { primary: "#facc15", glow: "0 0 8px #facc15" },
  ORDERLY: { primary: "#22c55e", glow: "0 0 8px #22c55e" },
  ORD: { primary: "#22c55e", glow: "0 0 8px #22c55e" },
} as const

export type VenueKey = keyof typeof VENUE_COLORS

export function getVenueColor(venue: string): { primary: string; glow: string } {
  const key = venue.toUpperCase() as VenueKey
  return VENUE_COLORS[key] || { primary: "#00ffff", glow: "0 0 8px #00ffff" }
}
