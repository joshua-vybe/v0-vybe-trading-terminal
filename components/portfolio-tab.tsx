"use client"

import { useState, useEffect, useMemo } from "react"
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { getVenueColor } from "@/lib/venue-colors"

interface Position {
  venue: string
  pair: string
  side: "LONG" | "SHORT"
  size: number
  entry: number
  current: number
  pnl: number
  pnlPercent: number
  leverage: number
  liquidation: number
  margin: number
}

const mockPositions: Position[] = [
  {
    venue: "HYPERLIQUID",
    pair: "BTC-USD",
    side: "LONG",
    size: 0.5,
    entry: 43100.0,
    current: 43293.51,
    pnl: 96.76,
    pnlPercent: 0.45,
    leverage: 10,
    liquidation: 38790,
    margin: 2155,
  },
  {
    venue: "HYPERLIQUID",
    pair: "ETH-USD",
    side: "LONG",
    size: 2.5,
    entry: 2580.0,
    current: 2612.4,
    pnl: 81.0,
    pnlPercent: 1.25,
    leverage: 5,
    liquidation: 2064,
    margin: 1290,
  },
  {
    venue: "ASTER",
    pair: "BTC-USD",
    side: "SHORT",
    size: 0.25,
    entry: 43450.0,
    current: 43293.51,
    pnl: 39.12,
    pnlPercent: 0.36,
    leverage: 20,
    liquidation: 45622,
    margin: 543,
  },
  {
    venue: "NADO",
    pair: "SOL-USD",
    side: "LONG",
    size: 50,
    entry: 98.5,
    current: 102.3,
    pnl: 190.0,
    pnlPercent: 3.86,
    leverage: 3,
    liquidation: 65.67,
    margin: 1641,
  },
  {
    venue: "ORDERLY",
    pair: "BTC-USD",
    side: "LONG",
    size: 0.15,
    entry: 43050.0,
    current: 43293.51,
    pnl: 36.53,
    pnlPercent: 0.57,
    leverage: 15,
    liquidation: 40147,
    margin: 430,
  },
  {
    venue: "ORDERLY",
    pair: "ARB-USD",
    side: "SHORT",
    size: 1000,
    entry: 1.12,
    current: 1.08,
    pnl: 40.0,
    pnlPercent: 3.57,
    leverage: 10,
    liquidation: 1.23,
    margin: 112,
  },
]

export function PortfolioTab() {
  const [positions, setPositions] = useState<Position[]>(mockPositions)
  const [pnlHistory, setPnlHistory] = useState<{ time: string; pnl: number }[]>([])

  useEffect(() => {
    // Initialize PnL history
    const history = []
    let cumPnl = 0
    for (let i = 24; i >= 0; i--) {
      cumPnl += (Math.random() - 0.4) * 50
      history.push({ time: `${i}h`, pnl: cumPnl })
    }
    setPnlHistory(history.reverse())

    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((p) => ({
          ...p,
          current: p.current + (Math.random() - 0.5) * (p.current * 0.001),
          pnl: p.pnl + (Math.random() - 0.5) * 5,
          pnlPercent: p.pnlPercent + (Math.random() - 0.5) * 0.1,
        })),
      )
      setPnlHistory((prev) => {
        const newHistory = [...prev.slice(1)]
        const lastPnl = prev[prev.length - 1]?.pnl || 0
        newHistory.push({ time: "now", pnl: lastPnl + (Math.random() - 0.45) * 20 })
        return newHistory
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0)
  const totalValue = positions.reduce((sum, p) => sum + p.size * p.current, 0)
  const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0)
  const avgLeverage = positions.reduce((sum, p) => sum + p.leverage, 0) / positions.length

  // Venue breakdown for pie chart
  const venueBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {}
    positions.forEach((p) => {
      const value = p.size * p.current
      breakdown[p.venue] = (breakdown[p.venue] || 0) + value
    })
    return Object.entries(breakdown).map(([venue, value]) => ({
      name: venue,
      value,
      color: getVenueColor(venue).primary,
    }))
  }, [positions])

  // Risk metrics
  const maxDrawdown = -4.2
  const sharpeRatio = 1.87
  const winRate = 72.4

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden p-1">
      {/* Top Stats Row */}
      <div className="grid grid-cols-8 gap-2">
        {[
          {
            label: "TOTAL VALUE",
            value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            color: "glow-cyan",
          },
          {
            label: "UNREALIZED PNL",
            value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`,
            color: totalPnl >= 0 ? "glow-green" : "glow-crimson",
          },
          { label: "MARGIN USED", value: `$${totalMargin.toLocaleString()}`, color: "glow-magenta" },
          { label: "AVG LEVERAGE", value: `${avgLeverage.toFixed(1)}x`, color: "text-yellow-400" },
          { label: "POSITIONS", value: positions.length.toString(), color: "glow-cyan" },
          { label: "WIN RATE", value: `${winRate}%`, color: "glow-green" },
          { label: "SHARPE", value: sharpeRatio.toFixed(2), color: "glow-cyan" },
          { label: "MAX DD", value: `${maxDrawdown}%`, color: "glow-crimson" },
        ].map((stat, i) => (
          <div key={i} className="neon-border glass-panel p-2 text-center">
            <div className="text-[8px] text-[#00ffff60] tracking-wider">{stat.label}</div>
            <div className={`text-[12px] font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content - Charts and Table */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        {/* Left: PnL Chart */}
        <div className="col-span-4 neon-border glass-panel p-2 flex flex-col">
          <div className="text-[9px] text-[#00ffff60] mb-1">24H PNL CURVE</div>
          <div className="flex-1" style={{ minHeight: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlHistory}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ffff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00ffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="pnl" stroke="#00ffff" fill="url(#pnlGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Center: Positions Table */}
        <div className="col-span-6 neon-border glass-panel p-2 flex flex-col overflow-hidden">
          <div className="text-[9px] text-[#00ffff60] mb-1">ACTIVE POSITIONS</div>
          {/* Table Header */}
          <div className="grid grid-cols-[80px_70px_50px_70px_80px_80px_70px_50px_50px] gap-1 text-[8px] text-[#00ffff60] border-b border-[#00ffff30] pb-1 mb-1">
            <div>VENUE</div>
            <div>PAIR</div>
            <div>SIDE</div>
            <div className="text-right">SIZE</div>
            <div className="text-right">ENTRY</div>
            <div className="text-right">CURRENT</div>
            <div className="text-right">PNL</div>
            <div className="text-right">LEV</div>
            <div></div>
          </div>
          {/* Table Body */}
          <div className="flex-1 overflow-auto space-y-0.5">
            {positions.map((pos, i) => (
              <div
                key={i}
                className="grid grid-cols-[80px_70px_50px_70px_80px_80px_70px_50px_50px] gap-1 text-[9px] items-center hover:bg-[#00ffff10] py-0.5"
              >
                <div style={{ color: getVenueColor(pos.venue).primary }}>{pos.venue}</div>
                <div className="text-[#00ffff]">{pos.pair}</div>
                <div className={pos.side === "LONG" ? "text-cyan-400" : "text-fuchsia-400"}>{pos.side}</div>
                <div className="text-right text-[#00ffff]">{pos.size.toFixed(4)}</div>
                <div className="text-right text-[#00ffff60]">{pos.entry.toFixed(2)}</div>
                <div className="text-right text-cyan-400">{pos.current.toFixed(2)}</div>
                <div className={`text-right ${pos.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {pos.pnl >= 0 ? "+" : ""}
                  {pos.pnl.toFixed(2)}
                </div>
                <div className="text-right text-yellow-400">{pos.leverage}x</div>
                <div className="text-red-400 cursor-pointer hover:text-red-300 text-[8px]">[X]</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Venue Breakdown */}
        <div className="col-span-2 neon-border glass-panel p-2 flex flex-col">
          <div className="text-[9px] text-[#00ffff60] mb-1">VENUE ALLOCATION</div>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={venueBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  dataKey="value"
                  stroke="none"
                >
                  {venueBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-0.5">
            {venueBreakdown.map((v, i) => (
              <div key={i} className="flex items-center justify-between text-[8px]">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
                  <span className="text-[#00ffff80]">{v.name}</span>
                </div>
                <span style={{ color: v.color }}>{((v.value / totalValue) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Risk Metrics */}
      <div className="grid grid-cols-6 gap-2">
        {positions.slice(0, 6).map((pos, i) => (
          <div key={i} className="neon-border glass-panel p-1.5">
            <div className="flex items-center justify-between text-[8px]">
              <span style={{ color: getVenueColor(pos.venue).primary }}>{pos.pair}</span>
              <span className={pos.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                {pos.pnlPercent >= 0 ? "+" : ""}
                {pos.pnlPercent.toFixed(2)}%
              </span>
            </div>
            <div className="h-6 mt-1" style={{ minHeight: 24 }}>
              <ResponsiveContainer width="100%" height={24}>
                <LineChart
                  data={Array.from({ length: 20 }, (_, i) => ({ v: Math.sin(i * 0.5 + pos.entry) * 10 + pos.pnl }))}
                >
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={pos.pnl >= 0 ? "#22c55e" : "#ef4444"}
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[7px] text-[#00ffff40] mt-0.5">LIQ: ${pos.liquidation.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
