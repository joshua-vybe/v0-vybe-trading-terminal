"use client"

import { useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts"
import { StrategyCreatorModal } from "./strategy-creator-modal"

interface Strategy {
  id: string
  name: string
  type: string
  status: "ACTIVE" | "PAUSED" | "STOPPED"
  pnl: number
  trades: number
  winRate: number
  venue: string
  created: string
  avgTrade: number
  maxDrawdown: number
  sharpe: number
  pnlHistory: number[]
}

const mockStrategies: Strategy[] = [
  {
    id: "STR-001",
    name: "MOMENTUM_SCALPER",
    type: "SCALP",
    status: "ACTIVE",
    pnl: 1245.5,
    trades: 147,
    winRate: 68.4,
    venue: "HYPERLIQUID",
    created: "2024-01-15",
    avgTrade: 8.47,
    maxDrawdown: -3.2,
    sharpe: 2.1,
    pnlHistory: [0, 120, 180, 340, 520, 680, 890, 1100, 1245],
  },
  {
    id: "STR-002",
    name: "MEAN_REVERSION",
    type: "SWING",
    status: "ACTIVE",
    pnl: 892.3,
    trades: 52,
    winRate: 71.2,
    venue: "ASTER",
    created: "2024-01-18",
    avgTrade: 17.16,
    maxDrawdown: -5.1,
    sharpe: 1.8,
    pnlHistory: [0, 50, 180, 290, 410, 520, 680, 780, 892],
  },
  {
    id: "STR-003",
    name: "BREAKOUT_HUNTER",
    type: "BREAKOUT",
    status: "PAUSED",
    pnl: -156.8,
    trades: 23,
    winRate: 43.5,
    venue: "NADO",
    created: "2024-01-20",
    avgTrade: -6.82,
    maxDrawdown: -12.4,
    sharpe: -0.4,
    pnlHistory: [0, 20, -30, -80, -120, -100, -140, -156, -156],
  },
  {
    id: "STR-004",
    name: "GRID_BOT_V2",
    type: "GRID",
    status: "ACTIVE",
    pnl: 567.9,
    trades: 312,
    winRate: 62.8,
    venue: "ORDERLY",
    created: "2024-01-22",
    avgTrade: 1.82,
    maxDrawdown: -2.1,
    sharpe: 1.5,
    pnlHistory: [0, 80, 150, 220, 310, 380, 450, 510, 567],
  },
  {
    id: "STR-005",
    name: "ARB_SCANNER",
    type: "ARB",
    status: "STOPPED",
    pnl: 2341.0,
    trades: 89,
    winRate: 94.4,
    venue: "MULTI",
    created: "2024-01-10",
    avgTrade: 26.3,
    maxDrawdown: -1.2,
    sharpe: 3.2,
    pnlHistory: [0, 280, 520, 890, 1200, 1580, 1890, 2100, 2341],
  },
]

const typeColors: Record<string, string> = {
  SCALP: "#00ffff",
  SWING: "#ff00ff",
  BREAKOUT: "#facc15",
  GRID: "#22c55e",
  ARB: "#00ff88",
}

export function StrategiesTab() {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(mockStrategies[0])
  const [showCreator, setShowCreator] = useState(false)

  const handleNewStrategy = () => {
    console.log("[v0] NEW STRATEGY button clicked, setting showCreator to true")
    setShowCreator(true)
  }

  const toggleStatus = (id: string) => {
    setStrategies((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStatus = s.status === "ACTIVE" ? "PAUSED" : s.status === "PAUSED" ? "ACTIVE" : s.status
          return { ...s, status: newStatus }
        }
        return s
      }),
    )
  }

  const totalPnl = strategies.reduce((sum, s) => sum + s.pnl, 0)
  const activeCount = strategies.filter((s) => s.status === "ACTIVE").length
  const totalTrades = strategies.reduce((sum, s) => sum + s.trades, 0)
  const avgWinRate = strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length

  // Type distribution for pie chart
  const typeDistribution = strategies.reduce(
    (acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type,
    value: count,
    color: typeColors[type] || "#00ffff",
  }))

  // Performance radar data
  const radarData = selectedStrategy
    ? [
        { metric: "Win Rate", value: selectedStrategy.winRate, fullMark: 100 },
        { metric: "Sharpe", value: Math.max(0, selectedStrategy.sharpe * 25), fullMark: 100 },
        { metric: "Trades", value: Math.min(100, selectedStrategy.trades / 3), fullMark: 100 },
        { metric: "Stability", value: Math.max(0, 100 + selectedStrategy.maxDrawdown * 5), fullMark: 100 },
        { metric: "Avg Trade", value: Math.min(100, Math.max(0, selectedStrategy.avgTrade * 3)), fullMark: 100 },
      ]
    : []

  const handleDeployStrategy = (newStrategy: any) => {
    const strategy: Strategy = {
      id: `STR-${String(strategies.length + 1).padStart(3, "0")}`,
      name: newStrategy.name,
      type: newStrategy.type,
      status: "ACTIVE",
      pnl: 0,
      trades: 0,
      winRate: 0,
      venue: newStrategy.venue,
      created: new Date().toISOString().split("T")[0],
      avgTrade: 0,
      maxDrawdown: 0,
      sharpe: 0,
      pnlHistory: [0],
    }
    setStrategies([strategy, ...strategies])
    setSelectedStrategy(strategy)
  }

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden p-1">
      {/* Top Stats Row */}
      <div className="grid grid-cols-8 gap-2">
        {[
          { label: "STRATEGIES", value: strategies.length.toString(), color: "glow-cyan" },
          { label: "ACTIVE", value: activeCount.toString(), color: "glow-green" },
          {
            label: "PAUSED",
            value: strategies.filter((s) => s.status === "PAUSED").length.toString(),
            color: "text-yellow-400",
          },
          {
            label: "TOTAL PNL",
            value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(0)}`,
            color: totalPnl >= 0 ? "glow-green" : "glow-crimson",
          },
          { label: "TOTAL TRADES", value: totalTrades.toLocaleString(), color: "glow-magenta" },
          { label: "AVG WIN RATE", value: `${avgWinRate.toFixed(1)}%`, color: "glow-cyan" },
          { label: "BEST STRAT", value: "+$2341", color: "glow-green" },
          { label: "TODAY", value: "+$127.40", color: "glow-green" },
        ].map((stat, i) => (
          <div key={i} className="neon-border glass-panel p-2 text-center">
            <div className="text-[8px] text-[#00ffff60] tracking-wider">{stat.label}</div>
            <div className={`text-[12px] font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        {/* Left: Strategy List */}
        <div className="col-span-5 neon-border glass-panel p-2 flex flex-col overflow-hidden">
          <div className="text-[9px] text-[#00ffff60] mb-1">STRATEGY LIST</div>
          {/* Table Header */}
          <div className="grid grid-cols-[60px_1fr_55px_55px_70px_50px_55px_50px] gap-1 text-[8px] text-[#00ffff60] border-b border-[#00ffff30] pb-1 mb-1">
            <div>ID</div>
            <div>NAME</div>
            <div>TYPE</div>
            <div>STATUS</div>
            <div className="text-right">PNL</div>
            <div className="text-right">TRADES</div>
            <div className="text-right">WIN%</div>
            <div></div>
          </div>
          {/* Table Body */}
          <div className="flex-1 overflow-auto space-y-0.5">
            {strategies.map((strat) => (
              <div
                key={strat.id}
                className={`grid grid-cols-[60px_1fr_55px_55px_70px_50px_55px_50px] gap-1 text-[9px] items-center py-1 cursor-pointer hover:bg-[#00ffff10] ${selectedStrategy?.id === strat.id ? "bg-[#00ffff15] border-l-2 border-cyan-400" : ""}`}
                onClick={() => setSelectedStrategy(strat)}
              >
                <div className="text-[#00ffff60]">{strat.id}</div>
                <div className="text-cyan-400 truncate">{strat.name}</div>
                <div style={{ color: typeColors[strat.type] }}>{strat.type}</div>
                <div
                  className={
                    strat.status === "ACTIVE"
                      ? "text-green-400"
                      : strat.status === "PAUSED"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }
                >
                  {strat.status}
                </div>
                <div className={`text-right ${strat.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {strat.pnl >= 0 ? "+" : ""}${strat.pnl.toFixed(0)}
                </div>
                <div className="text-right text-[#00ffff]">{strat.trades}</div>
                <div
                  className={`text-right ${strat.winRate >= 60 ? "text-green-400" : strat.winRate >= 50 ? "text-yellow-400" : "text-red-400"}`}
                >
                  {strat.winRate.toFixed(1)}%
                </div>
                <div
                  className={`text-[8px] cursor-pointer ${strat.status === "ACTIVE" ? "text-yellow-400" : "text-green-400"}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleStatus(strat.id)
                  }}
                >
                  {strat.status === "ACTIVE" ? "[||]" : "[▶]"}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowCreator(true)}
            className="mt-2 py-1.5 neon-border glass-panel text-[9px] glow-cyan hover:bg-[#00ffff20] transition-all relative z-10"
          >
            [ + NEW STRATEGY ]
          </button>
        </div>

        {/* Center: Selected Strategy Details */}
        <div className="col-span-4 flex flex-col gap-2">
          {selectedStrategy && (
            <>
              {/* PnL Chart */}
              <div className="flex-1 neon-border glass-panel p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[9px] text-[#00ffff60]">{selectedStrategy.name} - PNL CURVE</div>
                  <div className={`text-[11px] ${selectedStrategy.pnl >= 0 ? "glow-green" : "glow-crimson"}`}>
                    {selectedStrategy.pnl >= 0 ? "+" : ""}${selectedStrategy.pnl.toFixed(2)}
                  </div>
                </div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height={96}>
                    <AreaChart data={selectedStrategy.pnlHistory.map((v, i) => ({ i, v }))}>
                      <defs>
                        <linearGradient id="stratPnlGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={selectedStrategy.pnl >= 0 ? "#22c55e" : "#ef4444"}
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="100%"
                            stopColor={selectedStrategy.pnl >= 0 ? "#22c55e" : "#ef4444"}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={selectedStrategy.pnl >= 0 ? "#22c55e" : "#ef4444"}
                        fill="url(#stratPnlGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: "AVG TRADE", value: `$${selectedStrategy.avgTrade.toFixed(2)}` },
                  { label: "MAX DD", value: `${selectedStrategy.maxDrawdown}%` },
                  { label: "SHARPE", value: selectedStrategy.sharpe.toFixed(2) },
                  { label: "VENUE", value: selectedStrategy.venue },
                ].map((s, i) => (
                  <div key={i} className="neon-border glass-panel p-1.5 text-center">
                    <div className="text-[7px] text-[#00ffff60]">{s.label}</div>
                    <div className="text-[10px] glow-cyan">{s.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Charts */}
        <div className="col-span-3 flex flex-col gap-2">
          {/* Type Distribution */}
          <div className="neon-border glass-panel p-2 flex-1">
            <div className="text-[9px] text-[#00ffff60] mb-1">TYPE DISTRIBUTION</div>
            <div className="h-20 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={80}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={20} outerRadius={35} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 justify-center">
              {pieData.map((p, i) => (
                <div key={i} className="flex items-center gap-1 text-[7px]">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[#00ffff80]">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Radar */}
          {selectedStrategy && (
            <div className="neon-border glass-panel p-2 flex-1">
              <div className="text-[9px] text-[#00ffff60] mb-1">PERFORMANCE RADAR</div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height={96}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#00ffff30" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#00ffff60", fontSize: 7 }} />
                    <Radar dataKey="value" stroke="#00ffff" fill="#00ffff" fillOpacity={0.3} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Strategy Mini Cards */}
      <div className="grid grid-cols-5 gap-2">
        {strategies.map((strat) => (
          <div
            key={strat.id}
            className={`neon-border glass-panel p-1.5 cursor-pointer hover:bg-[#00ffff10] ${selectedStrategy?.id === strat.id ? "border-cyan-400" : ""}`}
            onClick={() => setSelectedStrategy(strat)}
          >
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-cyan-400 truncate">{strat.name.slice(0, 12)}</span>
              <span
                className={`text-[8px] ${strat.status === "ACTIVE" ? "text-green-400" : strat.status === "PAUSED" ? "text-yellow-400" : "text-red-400"}`}
              >
                ●
              </span>
            </div>
            <div className="h-5 mt-0.5">
              <ResponsiveContainer width="100%" height={20}>
                <LineChart data={strat.pnlHistory.map((v, i) => ({ v }))}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={strat.pnl >= 0 ? "#22c55e" : "#ef4444"}
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`text-[9px] text-right ${strat.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
              {strat.pnl >= 0 ? "+" : ""}${strat.pnl.toFixed(0)}
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Creator Modal */}
      {showCreator && (
        <StrategyCreatorModal isOpen={true} onClose={() => setShowCreator(false)} onDeploy={handleDeployStrategy} />
      )}
    </div>
  )
}
