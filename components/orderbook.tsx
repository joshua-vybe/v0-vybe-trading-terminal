"use client"

import { useState, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface OrderbookProps {
  venue: string
}

interface DepthPoint {
  price: number
  bidDepth: number | null
  askDepth: number | null
}

export function Orderbook({ venue }: OrderbookProps) {
  const [depthData, setDepthData] = useState<DepthPoint[]>([])
  const [stats, setStats] = useState({ spread: 0.52, vol24h: 1.24, funding: 0.0021 })

  useEffect(() => {
    const generateDepthData = () => {
      const mid = 43293
      const points: DepthPoint[] = []
      const range = 100
      const levels = 15

      // Generate bid side (left) - cumulative from outside in, then reverse for display
      const bidLevels: { price: number; cumulative: number }[] = []
      let bidTotal = 0
      for (let i = levels; i >= 1; i--) {
        const price = mid - (i * range) / levels
        const size = 50 + Math.random() * 100 + (levels - i) * 30
        bidTotal += size
        bidLevels.push({ price, cumulative: bidTotal })
      }
      // Bids go from low price (high cumulative) to mid price (low cumulative)
      bidLevels.reverse()
      for (const level of bidLevels) {
        points.push({
          price: Math.round(level.price * 100) / 100,
          bidDepth: level.cumulative,
          askDepth: null,
        })
      }

      // Add mid point
      points.push({ price: mid, bidDepth: null, askDepth: null })

      // Generate ask side (right) - cumulative from mid outward
      let askTotal = 0
      for (let i = 1; i <= levels; i++) {
        const price = mid + (i * range) / levels
        const size = 50 + Math.random() * 100 + i * 25
        askTotal += size
        points.push({
          price: Math.round(price * 100) / 100,
          bidDepth: null,
          askDepth: askTotal,
        })
      }

      setDepthData(points)

      setStats({
        spread: 0.4 + Math.random() * 0.3,
        vol24h: 1.2 + Math.random() * 0.2,
        funding: 0.001 + Math.random() * 0.003,
      })
    }

    generateDepthData()
    const interval = setInterval(generateDepthData, 2000)
    return () => clearInterval(interval)
  }, [venue])

  return (
    <div className="h-full neon-border glass-panel p-2 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-[#00ffff60]">DEPTH</span>
        <span className="text-[10px] text-[#00ffff]">{venue}</span>
      </div>

      {/* Depth Chart */}
      <div className="flex-1 min-h-0" style={{ filter: "drop-shadow(0 0 4px rgba(0, 255, 255, 0.3))", minHeight: 100 }}>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={depthData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bidFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ffff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#00ffff" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="askFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff00ff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#ff00ff" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="price"
              tick={{ fontSize: 8, fill: "#00ffff60" }}
              axisLine={{ stroke: "#00ffff30" }}
              tickLine={{ stroke: "#00ffff30" }}
              tickFormatter={(v) => (v / 1000).toFixed(1) + "k"}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 8, fill: "#00ffff60" }}
              axisLine={{ stroke: "#00ffff30" }}
              tickLine={{ stroke: "#00ffff30" }}
              width={30}
              tickFormatter={(v) => v.toFixed(0)}
            />
            <Area
              type="stepBefore"
              dataKey="bidDepth"
              stroke="#00ffff"
              strokeWidth={1}
              fill="url(#bidFill)"
              isAnimationActive={false}
              connectNulls={false}
            />
            <Area
              type="stepAfter"
              dataKey="askDepth"
              stroke="#ff00ff"
              strokeWidth={1}
              fill="url(#askFill)"
              isAnimationActive={false}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Row */}
      <div className="flex justify-between text-[9px] mt-1 pt-1 border-t border-[#00ffff20]">
        <div>
          <span className="text-[#00ffff60]">SPD </span>
          <span className="text-[#ffff00]">${stats.spread.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[#00ffff60]">VOL </span>
          <span className="text-[#00ffff]">${stats.vol24h.toFixed(2)}B</span>
        </div>
        <div>
          <span className="text-[#00ffff60]">FND </span>
          <span className="text-[#22c55e]">+{(stats.funding * 100).toFixed(3)}%</span>
        </div>
      </div>
    </div>
  )
}
