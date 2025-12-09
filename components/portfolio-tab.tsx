"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ComposedChart,
  ReferenceLine,
} from "recharts"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Position {
  id: string
  strategy: string
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
  openTime: number
  funding: number
}

interface HistoricalTrade {
  id: string
  pair: string
  side: "LONG" | "SHORT"
  entry: number
  exit: number
  size: number
  pnl: number
  pnlPercent: number
  duration: string
  strategy: string
  timestamp: number
}

interface DuneOnChainData {
  whaleNetFlow: number
  exchangeReserves: number
  reserveChange: number
  fundingRate: number
  openInterest: number
  oiChange: number
  longShortRatio: number
  liquidations24h: number
  fearGreedIndex: number
  dexVolume: number
  gasPrice: number
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generatePositions = (): Position[] => [
  {
    id: "p1",
    strategy: "MOMENTUM_BREAKOUT",
    venue: "ORDERLY",
    pair: "BTC-PERP",
    side: "LONG",
    size: 0.5,
    entry: 43100.0,
    current: 43293.51,
    pnl: 96.76,
    pnlPercent: 0.45,
    leverage: 10,
    liquidation: 38790,
    margin: 2155,
    openTime: Date.now() - 3600000 * 4,
    funding: -2.34,
  },
  {
    id: "p2",
    strategy: "MOMENTUM_BREAKOUT",
    venue: "ORDERLY",
    pair: "ETH-PERP",
    side: "LONG",
    size: 2.5,
    entry: 2580.0,
    current: 2612.4,
    pnl: 81.0,
    pnlPercent: 1.25,
    leverage: 5,
    liquidation: 2064,
    margin: 1290,
    openTime: Date.now() - 3600000 * 8,
    funding: -1.12,
  },
  {
    id: "p3",
    strategy: "MEAN_REVERSION",
    venue: "ORDERLY",
    pair: "BTC-PERP",
    side: "SHORT",
    size: 0.25,
    entry: 43450.0,
    current: 43293.51,
    pnl: 39.12,
    pnlPercent: 0.36,
    leverage: 20,
    liquidation: 45622,
    margin: 543,
    openTime: Date.now() - 3600000 * 2,
    funding: 0.87,
  },
  {
    id: "p4",
    strategy: "TREND_FOLLOW",
    venue: "ORDERLY",
    pair: "SOL-PERP",
    side: "LONG",
    size: 50,
    entry: 98.5,
    current: 102.3,
    pnl: 190.0,
    pnlPercent: 3.86,
    leverage: 3,
    liquidation: 65.67,
    margin: 1641,
    openTime: Date.now() - 3600000 * 24,
    funding: -4.21,
  },
  {
    id: "p5",
    strategy: "STAT_ARB",
    venue: "ORDERLY",
    pair: "ARB-PERP",
    side: "SHORT",
    size: 1000,
    entry: 1.12,
    current: 1.08,
    pnl: 40.0,
    pnlPercent: 3.57,
    leverage: 10,
    liquidation: 1.23,
    margin: 112,
    openTime: Date.now() - 3600000 * 6,
    funding: 0.23,
  },
]

const generateHistoricalTrades = (): HistoricalTrade[] => [
  {
    id: "t1",
    pair: "BTC-PERP",
    side: "LONG",
    entry: 42800,
    exit: 43200,
    size: 0.3,
    pnl: 120,
    pnlPercent: 0.93,
    duration: "2h 34m",
    strategy: "MOMENTUM",
    timestamp: Date.now() - 86400000,
  },
  {
    id: "t2",
    pair: "ETH-PERP",
    side: "SHORT",
    entry: 2650,
    exit: 2580,
    size: 2.0,
    pnl: 140,
    pnlPercent: 2.64,
    duration: "5h 12m",
    strategy: "MEAN_REV",
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: "t3",
    pair: "SOL-PERP",
    side: "LONG",
    entry: 95.5,
    exit: 102.3,
    size: 30,
    pnl: 204,
    pnlPercent: 7.12,
    duration: "18h 45m",
    strategy: "TREND",
    timestamp: Date.now() - 86400000 * 3,
  },
  {
    id: "t4",
    pair: "BTC-PERP",
    side: "SHORT",
    entry: 44100,
    exit: 43800,
    size: 0.2,
    pnl: 60,
    pnlPercent: 0.68,
    duration: "1h 23m",
    strategy: "SCALP",
    timestamp: Date.now() - 86400000 * 4,
  },
  {
    id: "t5",
    pair: "ARB-PERP",
    side: "LONG",
    entry: 1.05,
    exit: 1.02,
    size: 500,
    pnl: -15,
    pnlPercent: -2.86,
    duration: "4h 56m",
    strategy: "STAT_ARB",
    timestamp: Date.now() - 86400000 * 5,
  },
  {
    id: "t6",
    pair: "ETH-PERP",
    side: "LONG",
    entry: 2520,
    exit: 2590,
    size: 1.5,
    pnl: 105,
    pnlPercent: 2.78,
    duration: "8h 12m",
    strategy: "MOMENTUM",
    timestamp: Date.now() - 86400000 * 6,
  },
  {
    id: "t7",
    pair: "BTC-PERP",
    side: "LONG",
    entry: 41500,
    exit: 42300,
    size: 0.4,
    pnl: 320,
    pnlPercent: 1.93,
    duration: "12h 30m",
    strategy: "TREND",
    timestamp: Date.now() - 86400000 * 7,
  },
  {
    id: "t8",
    pair: "SOL-PERP",
    side: "SHORT",
    entry: 105.2,
    exit: 108.5,
    size: 25,
    pnl: -82.5,
    pnlPercent: -3.14,
    duration: "3h 45m",
    strategy: "MEAN_REV",
    timestamp: Date.now() - 86400000 * 8,
  },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PortfolioTab() {
  const [positions, setPositions] = useState<Position[]>(generatePositions())
  const [historicalTrades] = useState<HistoricalTrade[]>(generateHistoricalTrades())
  const [activeTab, setActiveTab] = useState<"overview" | "positions" | "analytics" | "onchain" | "history">("overview")
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d" | "1y" | "all">("30d")

  // Dune on-chain data
  const [duneData, setDuneData] = useState<DuneOnChainData>({
    whaleNetFlow: -12500000,
    exchangeReserves: 2340000,
    reserveChange: -2.3,
    fundingRate: 0.0045,
    openInterest: 18500000000,
    oiChange: 4.2,
    longShortRatio: 1.15,
    liquidations24h: 89000000,
    fearGreedIndex: 72,
    dexVolume: 4200000000,
    gasPrice: 25,
  })

  // Equity curve data
  const [equityCurve, setEquityCurve] = useState<
    { date: string; equity: number; drawdown: number; benchmark: number }[]
  >([])

  // Monthly returns
  const [monthlyReturns, setMonthlyReturns] = useState<{ month: string; return: number }[]>([])

  // Initialize data
  useEffect(() => {
    // Generate equity curve
    const curve = []
    let equity = 50000
    let peak = equity
    let benchmark = 50000
    for (let i = 90; i >= 0; i--) {
      const dailyReturn = (Math.random() - 0.45) * 0.03
      const benchmarkReturn = (Math.random() - 0.48) * 0.025
      equity *= 1 + dailyReturn
      benchmark *= 1 + benchmarkReturn
      peak = Math.max(peak, equity)
      const drawdown = ((equity - peak) / peak) * 100
      curve.push({
        date: new Date(Date.now() - i * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        equity: Math.round(equity),
        drawdown: Math.round(drawdown * 100) / 100,
        benchmark: Math.round(benchmark),
      })
    }
    setEquityCurve(curve)

    // Generate monthly returns
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const returns = months.map((month) => ({
      month,
      return: (Math.random() - 0.4) * 20,
    }))
    setMonthlyReturns(returns)

    // Live position updates
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((p) => ({
          ...p,
          current: p.current + (Math.random() - 0.5) * (p.current * 0.001),
          pnl: p.pnl + (Math.random() - 0.5) * 5,
          pnlPercent: p.pnlPercent + (Math.random() - 0.5) * 0.1,
        })),
      )

      // Update Dune data
      setDuneData((prev) => ({
        ...prev,
        whaleNetFlow: prev.whaleNetFlow + (Math.random() - 0.5) * 500000,
        fundingRate: prev.fundingRate + (Math.random() - 0.5) * 0.0005,
        fearGreedIndex: Math.max(0, Math.min(100, prev.fearGreedIndex + (Math.random() - 0.5) * 2)),
        openInterest: prev.openInterest * (1 + (Math.random() - 0.5) * 0.001),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Computed metrics
  const metrics = useMemo(() => {
    const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0)
    const totalValue = positions.reduce((sum, p) => sum + p.size * p.current, 0)
    const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0)
    const totalFunding = positions.reduce((sum, p) => sum + p.funding, 0)

    const wins = historicalTrades.filter((t) => t.pnl > 0)
    const losses = historicalTrades.filter((t) => t.pnl <= 0)
    const winRate = (wins.length / historicalTrades.length) * 100
    const avgWin = wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length || 0
    const avgLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) || 1
    const profitFactor =
      wins.reduce((sum, t) => sum + t.pnl, 0) / Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0)) || 0
    const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss

    const returns = equityCurve.map((d, i) =>
      i === 0 ? 0 : (d.equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity,
    )
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
    const sharpeRatio = stdDev > 0 ? (avgReturn * 365 - 0.05) / (stdDev * Math.sqrt(365)) : 0
    const negReturns = returns.filter((r) => r < 0)
    const downDev = Math.sqrt(negReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negReturns.length)
    const sortinoRatio = downDev > 0 ? (avgReturn * 365 - 0.05) / (downDev * Math.sqrt(365)) : 0

    const maxDrawdown = Math.min(...equityCurve.map((d) => d.drawdown))
    const calmarRatio = maxDrawdown !== 0 ? (avgReturn * 365 * 100) / Math.abs(maxDrawdown) : 0

    return {
      totalPnl,
      totalValue,
      totalMargin,
      totalFunding,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      expectancy,
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      maxDrawdown,
      totalTrades: historicalTrades.length,
      currentEquity: equityCurve[equityCurve.length - 1]?.equity || 50000,
    }
  }, [positions, historicalTrades, equityCurve])

  // Allocation breakdown
  const allocations = useMemo(() => {
    const byAsset: Record<string, number> = {}
    const byStrategy: Record<string, number> = {}
    const bySide: Record<string, number> = { LONG: 0, SHORT: 0 }

    positions.forEach((p) => {
      const value = p.size * p.current
      byAsset[p.pair] = (byAsset[p.pair] || 0) + value
      byStrategy[p.strategy] = (byStrategy[p.strategy] || 0) + value
      bySide[p.side] += value
    })

    return { byAsset, byStrategy, bySide }
  }, [positions])

  // Risk metrics for radar chart
  const riskMetrics = [
    { metric: "Sharpe", value: Math.min(100, metrics.sharpeRatio * 30), fullMark: 100 },
    { metric: "Win Rate", value: metrics.winRate, fullMark: 100 },
    { metric: "Profit Factor", value: Math.min(100, metrics.profitFactor * 25), fullMark: 100 },
    { metric: "Sortino", value: Math.min(100, metrics.sortinoRatio * 25), fullMark: 100 },
    { metric: "Calmar", value: Math.min(100, metrics.calmarRatio * 20), fullMark: 100 },
    { metric: "Expectancy", value: Math.min(100, Math.max(0, metrics.expectancy + 50)), fullMark: 100 },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with Portfolio Value and Time Range */}
      <div className="flex items-center justify-between p-2 border-b border-cyan-900/30">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[9px] text-cyan-600 tracking-wider">PORTFOLIO VALUE</div>
            <div className="text-2xl font-bold glow-cyan font-mono">${metrics.currentEquity.toLocaleString()}</div>
          </div>
          <div className="h-10 w-px bg-cyan-900/30" />
          <div>
            <div className="text-[9px] text-cyan-600 tracking-wider">UNREALIZED P&L</div>
            <div className={`text-lg font-bold font-mono ${metrics.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
              {metrics.totalPnl >= 0 ? "+" : ""}${metrics.totalPnl.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-cyan-600 tracking-wider">TODAY</div>
            <div className="text-lg font-bold text-green-400 font-mono">+2.34%</div>
          </div>
          <div>
            <div className="text-[9px] text-cyan-600 tracking-wider">MARGIN</div>
            <div className="text-lg font-bold text-yellow-400 font-mono">${metrics.totalMargin.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Dune Data Badge */}
          <div className="flex items-center gap-2 px-2 py-1 border border-purple-500/30 bg-purple-500/10 rounded">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[9px] text-purple-400 tracking-wider">DUNE LIVE</span>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-1">
            {(["24h", "7d", "30d", "90d", "1y", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-0.5 text-[9px] font-mono border transition-all ${
                  timeRange === range
                    ? "border-cyan-400 text-cyan-400 bg-cyan-400/10"
                    : "border-cyan-800/50 text-cyan-700 hover:border-cyan-600"
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-2 border-b border-cyan-900/30">
        {[
          { id: "overview", label: "OVERVIEW" },
          { id: "positions", label: "POSITIONS" },
          { id: "analytics", label: "ANALYTICS" },
          { id: "onchain", label: "ON-CHAIN" },
          { id: "history", label: "HISTORY" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 py-1 text-[10px] font-mono tracking-wider transition-all ${
              activeTab === tab.id ? "border-b-2 border-cyan-400 text-cyan-400" : "text-cyan-700 hover:text-cyan-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-2">
        {activeTab === "overview" && (
          <div className="grid grid-cols-12 gap-2 h-full">
            {/* Equity Curve */}
            <div className="col-span-8 neon-border glass-panel p-2 flex flex-col">
              <div className="text-[9px] text-cyan-600 tracking-wider mb-1">EQUITY CURVE</div>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={equityCurve}>
                    <defs>
                      <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00ffff" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00ffff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#0e7490" }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 8, fill: "#0e7490" }}
                      tickLine={false}
                      axisLine={false}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0a1929", border: "1px solid #0e7490", fontSize: 10 }}
                      labelStyle={{ color: "#00ffff" }}
                    />
                    <Area type="monotone" dataKey="equity" stroke="#00ffff" fill="url(#equityGrad)" strokeWidth={2} />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="#666"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Radar */}
            <div className="col-span-4 neon-border glass-panel p-2 flex flex-col">
              <div className="text-[9px] text-cyan-600 tracking-wider mb-1">RISK METRICS</div>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={riskMetrics}>
                    <PolarGrid stroke="#164e63" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8, fill: "#0e7490" }} />
                    <Radar dataKey="value" stroke="#00ffff" fill="#00ffff" fillOpacity={0.3} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="col-span-6 grid grid-cols-4 gap-2">
              {[
                { label: "SHARPE", value: metrics.sharpeRatio.toFixed(2), color: "cyan" },
                { label: "SORTINO", value: metrics.sortinoRatio.toFixed(2), color: "cyan" },
                { label: "CALMAR", value: metrics.calmarRatio.toFixed(2), color: "cyan" },
                { label: "MAX DD", value: `${metrics.maxDrawdown.toFixed(1)}%`, color: "red" },
                { label: "WIN RATE", value: `${metrics.winRate.toFixed(1)}%`, color: "green" },
                { label: "PROFIT FACTOR", value: metrics.profitFactor.toFixed(2), color: "green" },
                { label: "EXPECTANCY", value: `$${metrics.expectancy.toFixed(0)}`, color: "cyan" },
                { label: "TOTAL TRADES", value: metrics.totalTrades.toString(), color: "cyan" },
              ].map((stat, i) => (
                <div key={i} className="neon-border glass-panel p-2 text-center">
                  <div className="text-[8px] text-cyan-600/60 tracking-wider">{stat.label}</div>
                  <div
                    className={`text-sm font-bold font-mono ${
                      stat.color === "green" ? "text-green-400" : stat.color === "red" ? "text-red-400" : "glow-cyan"
                    }`}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Allocation Charts */}
            <div className="col-span-3 neon-border glass-panel p-2">
              <div className="text-[9px] text-cyan-600 tracking-wider mb-1">BY ASSET</div>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(allocations.byAsset).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={40}
                      dataKey="value"
                      stroke="none"
                    >
                      {Object.keys(allocations.byAsset).map((_, i) => (
                        <Cell key={i} fill={["#00ffff", "#ff00ff", "#22c55e", "#facc15", "#f97316"][i % 5]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-0.5 mt-1">
                {Object.entries(allocations.byAsset).map(([name, value], i) => (
                  <div key={name} className="flex items-center justify-between text-[8px]">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: ["#00ffff", "#ff00ff", "#22c55e", "#facc15", "#f97316"][i % 5] }}
                      />
                      <span className="text-cyan-500">{name.replace("-PERP", "")}</span>
                    </div>
                    <span className="text-cyan-400">{((value / metrics.totalValue) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Returns */}
            <div className="col-span-3 neon-border glass-panel p-2">
              <div className="text-[9px] text-cyan-600 tracking-wider mb-1">MONTHLY RETURNS</div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyReturns}>
                    <XAxis dataKey="month" tick={{ fontSize: 7, fill: "#0e7490" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 7, fill: "#0e7490" }} tickLine={false} axisLine={false} />
                    <ReferenceLine y={0} stroke="#164e63" />
                    <Bar dataKey="return">
                      {monthlyReturns.map((entry, i) => (
                        <Cell key={i} fill={entry.return >= 0 ? "#22c55e" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "positions" && (
          <div className="space-y-2">
            {/* Positions Table */}
            <div className="neon-border glass-panel p-2">
              <div className="text-[9px] text-cyan-600 tracking-wider mb-2">ACTIVE POSITIONS ({positions.length})</div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-cyan-600/60 border-b border-cyan-900/30">
                      <th className="text-left py-1 px-2">STRATEGY</th>
                      <th className="text-left py-1 px-2">PAIR</th>
                      <th className="text-left py-1 px-2">SIDE</th>
                      <th className="text-right py-1 px-2">SIZE</th>
                      <th className="text-right py-1 px-2">ENTRY</th>
                      <th className="text-right py-1 px-2">CURRENT</th>
                      <th className="text-right py-1 px-2">P&L</th>
                      <th className="text-right py-1 px-2">P&L %</th>
                      <th className="text-right py-1 px-2">LEV</th>
                      <th className="text-right py-1 px-2">LIQ</th>
                      <th className="text-right py-1 px-2">FUNDING</th>
                      <th className="text-center py-1 px-2">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos) => (
                      <tr key={pos.id} className="border-b border-cyan-900/20 hover:bg-cyan-900/10">
                        <td className="py-1.5 px-2 text-purple-400">{pos.strategy}</td>
                        <td className="py-1.5 px-2 text-cyan-400">{pos.pair}</td>
                        <td className={`py-1.5 px-2 ${pos.side === "LONG" ? "text-green-400" : "text-red-400"}`}>
                          {pos.side}
                        </td>
                        <td className="py-1.5 px-2 text-right text-cyan-300">{pos.size}</td>
                        <td className="py-1.5 px-2 text-right text-cyan-500">${pos.entry.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-right text-cyan-300">${pos.current.toFixed(2)}</td>
                        <td
                          className={`py-1.5 px-2 text-right font-mono ${pos.pnl >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}
                        </td>
                        <td
                          className={`py-1.5 px-2 text-right font-mono ${pos.pnlPercent >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {pos.pnlPercent >= 0 ? "+" : ""}
                          {pos.pnlPercent.toFixed(2)}%
                        </td>
                        <td className="py-1.5 px-2 text-right text-yellow-400">{pos.leverage}x</td>
                        <td className="py-1.5 px-2 text-right text-red-400/70">${pos.liquidation.toLocaleString()}</td>
                        <td
                          className={`py-1.5 px-2 text-right ${pos.funding >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {pos.funding >= 0 ? "+" : ""}${pos.funding.toFixed(2)}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <button className="text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-0.5 text-[9px]">
                            CLOSE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-12 gap-2">
            {/* Drawdown Chart */}
            <div className="col-span-6 neon-border glass-panel p-2">
              <div className="text-[9px] text-cyan-600 tracking-wider mb-1">DRAWDOWN</div>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityCurve}>
                    <defs>
                      <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#0e7490" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: "#0e7490" }} tickLine={false} axisLine={false} />
                    <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="url(#ddGrad)" strokeWidth={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Win/Loss Distribution */}
            <div className="col-span-6 neon-border glass-panel p-2">
              <div className="text-[9px] text-cyan-600 tracking-wider mb-1">TRADE DISTRIBUTION</div>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalTrades.map((t) => ({ pnl: t.pnl }))}>
                    <XAxis tick={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: "#0e7490" }} tickLine={false} axisLine={false} />
                    <ReferenceLine y={0} stroke="#164e63" />
                    <Bar dataKey="pnl">
                      {historicalTrades.map((t, i) => (
                        <Cell key={i} fill={t.pnl >= 0 ? "#22c55e" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Advanced Metrics */}
            <div className="col-span-12 grid grid-cols-6 gap-2">
              {[
                { label: "AVG WIN", value: `$${metrics.avgWin.toFixed(2)}`, sub: "per trade" },
                { label: "AVG LOSS", value: `$${metrics.avgLoss.toFixed(2)}`, sub: "per trade" },
                { label: "LARGEST WIN", value: "$320.00", sub: "BTC-PERP" },
                { label: "LARGEST LOSS", value: "-$82.50", sub: "SOL-PERP" },
                { label: "AVG HOLD TIME", value: "6h 24m", sub: "all trades" },
                { label: "BEST STRATEGY", value: "TREND", sub: "+$524" },
              ].map((stat, i) => (
                <div key={i} className="neon-border glass-panel p-2">
                  <div className="text-[8px] text-cyan-600/60 tracking-wider">{stat.label}</div>
                  <div className="text-sm font-bold font-mono glow-cyan">{stat.value}</div>
                  <div className="text-[8px] text-cyan-700">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "onchain" && (
          <div className="grid grid-cols-12 gap-2">
            {/* Dune Analytics Header */}
            <div className="col-span-12 flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] text-purple-400 tracking-wider">DUNE ANALYTICS INTEGRATION</span>
              <span className="text-[9px] text-cyan-600">Real-time on-chain intelligence</span>
            </div>

            {/* Whale Activity */}
            <div className="col-span-4 neon-border glass-panel p-2" style={{ borderColor: "#a855f7" }}>
              <div className="text-[9px] text-purple-400 tracking-wider mb-2">WHALE ACTIVITY</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[9px] text-cyan-600">Net Flow (24h)</span>
                  <span
                    className={`text-[11px] font-mono ${duneData.whaleNetFlow >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {duneData.whaleNetFlow >= 0 ? "+" : ""}
                    {(duneData.whaleNetFlow / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-cyan-600">Exchange Reserves</span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {(duneData.exchangeReserves / 1000).toFixed(0)}K BTC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-cyan-600">Reserve Change</span>
                  <span
                    className={`text-[11px] font-mono ${duneData.reserveChange >= 0 ? "text-red-400" : "text-green-400"}`}
                  >
                    {duneData.reserveChange >= 0 ? "+" : ""}
                    {duneData.reserveChange.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Derivatives Data */}
            <div className="col-span-4 neon-border glass-panel p-2" style={{ borderColor: "#a855f7" }}>
              <div className="text-[9px] text-purple-400 tracking-wider mb-2">DERIVATIVES</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[9px] text-cyan-600">Funding Rate</span>
                  <span
                    className={`text-[11px] font-mono ${duneData.fundingRate >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {(duneData.fundingRate * 100).toFixed(4)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-cyan-600">Open Interest</span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    ${(duneData.openInterest / 1000000000).toFixed(2)}B
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-cyan-600">OI Change (24h)</span>
                  <span
                    className={`text-[11px] font-mono ${duneData.oiChange >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {duneData.oiChange >= 0 ? "+" : ""}
                    {duneData.oiChange.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-cyan-600">Long/Short Ratio</span>
                  <span className="text-[11px] font-mono text-cyan-400">{duneData.longShortRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-cyan-600">Liquidations (24h)</span>
                  <span className="text-[11px] font-mono text-red-400">
                    ${(duneData.liquidations24h / 1000000).toFixed(0)}M
                  </span>
                </div>
              </div>
            </div>

            {/* Market Sentiment */}
            <div className="col-span-4 neon-border glass-panel p-2" style={{ borderColor: "#a855f7" }}>
              <div className="text-[9px] text-purple-400 tracking-wider mb-2">SENTIMENT</div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] text-cyan-600">Fear & Greed Index</span>
                    <span
                      className={`text-[11px] font-mono ${
                        duneData.fearGreedIndex >= 70
                          ? "text-green-400"
                          : duneData.fearGreedIndex >= 30
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {duneData.fearGreedIndex.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${duneData.fearGreedIndex}%`,
                        background: `linear-gradient(90deg, #ef4444, #facc15, #22c55e)`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-cyan-600">DEX Volume (24h)</span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    ${(duneData.dexVolume / 1000000000).toFixed(2)}B
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-cyan-600">Gas Price</span>
                  <span className="text-[11px] font-mono text-cyan-400">{duneData.gasPrice} gwei</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="neon-border glass-panel p-2">
            <div className="text-[9px] text-cyan-600 tracking-wider mb-2">TRADE HISTORY</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-cyan-600/60 border-b border-cyan-900/30">
                    <th className="text-left py-1 px-2">DATE</th>
                    <th className="text-left py-1 px-2">PAIR</th>
                    <th className="text-left py-1 px-2">SIDE</th>
                    <th className="text-right py-1 px-2">ENTRY</th>
                    <th className="text-right py-1 px-2">EXIT</th>
                    <th className="text-right py-1 px-2">SIZE</th>
                    <th className="text-right py-1 px-2">P&L</th>
                    <th className="text-right py-1 px-2">P&L %</th>
                    <th className="text-right py-1 px-2">DURATION</th>
                    <th className="text-left py-1 px-2">STRATEGY</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-cyan-900/20 hover:bg-cyan-900/10">
                      <td className="py-1.5 px-2 text-cyan-500">{new Date(trade.timestamp).toLocaleDateString()}</td>
                      <td className="py-1.5 px-2 text-cyan-400">{trade.pair}</td>
                      <td className={`py-1.5 px-2 ${trade.side === "LONG" ? "text-green-400" : "text-red-400"}`}>
                        {trade.side}
                      </td>
                      <td className="py-1.5 px-2 text-right text-cyan-500">${trade.entry.toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-right text-cyan-300">${trade.exit.toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-right text-cyan-300">{trade.size}</td>
                      <td
                        className={`py-1.5 px-2 text-right font-mono ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                      </td>
                      <td
                        className={`py-1.5 px-2 text-right font-mono ${trade.pnlPercent >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {trade.pnlPercent >= 0 ? "+" : ""}
                        {trade.pnlPercent.toFixed(2)}%
                      </td>
                      <td className="py-1.5 px-2 text-right text-cyan-500">{trade.duration}</td>
                      <td className="py-1.5 px-2 text-purple-400">{trade.strategy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
