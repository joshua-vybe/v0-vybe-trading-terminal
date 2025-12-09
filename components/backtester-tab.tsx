"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts"
import { strategyStore } from "@/lib/strategy-store"

interface BacktestResult {
  date: string
  equity: number
  drawdown: number
  returns: number
}

interface MonthlyReturn {
  month: string
  return: number
}

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"]
const PERIODS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "180D", days: 180 },
  { label: "1Y", days: 365 },
  { label: "2Y", days: 730 },
  { label: "ALL", days: 1095 },
]

export function BacktesterTab() {
  const strategies = useSyncExternalStore(
    strategyStore.subscribe,
    strategyStore.getStrategies,
    strategyStore.getStrategies,
  )

  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("")
  const [selectedTimeframe, setSelectedTimeframe] = useState("1H")
  const [selectedPeriod, setSelectedPeriod] = useState("90D")
  const [capital, setCapital] = useState("10000")

  const [strategyDropdownOpen, setStrategyDropdownOpen] = useState(false)
  const [tfDropdownOpen, setTfDropdownOpen] = useState(false)
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false)

  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BacktestResult[]>([])
  const [monthlyReturns, setMonthlyReturns] = useState<MonthlyReturn[]>([])
  const [showResults, setShowResults] = useState(false)

  // Set default strategy on mount
  useEffect(() => {
    if (strategies.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(strategies[0].id)
    }
  }, [strategies, selectedStrategyId])

  const selectedStrategy = strategies.find((s) => s.id === selectedStrategyId)

  const runBacktest = () => {
    if (!selectedStrategy) return

    setIsRunning(true)
    setProgress(0)
    setShowResults(false)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          setShowResults(true)
          generateResults()
          return 100
        }
        return prev + 2
      })
    }, 50)
  }

  const generateResults = () => {
    const startingCapital = Number.parseFloat(capital) || 10000
    const periodDays = PERIODS.find((p) => p.label === selectedPeriod)?.days || 90

    const data: BacktestResult[] = []
    let equity = startingCapital
    let peak = startingCapital

    for (let i = 0; i < periodDays; i++) {
      const change = (Math.random() - 0.45) * (startingCapital * 0.02)
      const prevEquity = equity
      equity = Math.max(equity + change, startingCapital * 0.8)
      peak = Math.max(peak, equity)
      const drawdown = ((peak - equity) / peak) * 100
      const dailyReturn = ((equity - prevEquity) / prevEquity) * 100
      data.push({
        date: `Day ${i + 1}`,
        equity,
        drawdown,
        returns: dailyReturn,
      })
    }
    setResults(data)

    // Generate monthly returns based on period
    const numMonths = Math.ceil(periodDays / 30)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthly = Array.from({ length: Math.min(numMonths, 12) }, (_, i) => ({
      month: monthNames[i % 12],
      return: (Math.random() - 0.3) * 8,
    }))
    setMonthlyReturns(monthly)

    // Update strategy store with backtest results
    if (selectedStrategy) {
      const finalEquity = data[data.length - 1].equity
      const totalReturn = ((finalEquity - startingCapital) / startingCapital) * 100
      const maxDD = Math.max(...data.map((r) => r.drawdown))
      strategyStore.updateBacktestResults(selectedStrategy.id, {
        return: totalReturn,
        sharpe: 1.5 + Math.random(),
        maxDD,
        winRate: 55 + Math.random() * 20,
      })
    }
  }

  // Calculate tear sheet metrics
  const startingCapital = Number.parseFloat(capital) || 10000
  const finalEquity = results.length > 0 ? results[results.length - 1].equity : startingCapital
  const totalReturn = ((finalEquity - startingCapital) / startingCapital) * 100
  const maxDrawdown = results.length > 0 ? Math.max(...results.map((r) => r.drawdown)) : 0
  const avgDrawdown = results.length > 0 ? results.reduce((a, b) => a + b.drawdown, 0) / results.length : 0
  const dailyReturns = results.map((r) => r.returns)
  const avgDailyReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0
  const stdDev =
    dailyReturns.length > 0
      ? Math.sqrt(dailyReturns.reduce((a, b) => a + Math.pow(b - avgDailyReturn, 2), 0) / dailyReturns.length)
      : 0
  const sharpeRatio = stdDev > 0 ? (avgDailyReturn / stdDev) * Math.sqrt(252) : 0
  const sortinoRatio = sharpeRatio * 1.25
  const calmarRatio = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0

  // Simulated metrics
  const winRate = 68.4
  const profitFactor = 2.14
  const totalTrades = 247
  const avgWin = 0.72
  const avgLoss = -0.38
  const largestWin = 3.24
  const largestLoss = -1.87
  const consecutiveWins = 8
  const consecutiveLosses = 3
  const avgHoldTime = "4.2h"
  const expectancy = (winRate / 100) * avgWin + ((100 - winRate) / 100) * avgLoss
  const recoveryFactor = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0
  const payoffRatio = Math.abs(avgWin / avgLoss)
  const ulcerIndex = avgDrawdown * 0.8
  const tailRatio = 1.32
  const commonSenseRatio = profitFactor * (winRate / 100)
  const kellyPct = winRate / 100 - (100 - winRate) / 100 / payoffRatio

  const Metric = ({ label, value, color = "cyan" }: { label: string; value: string | number; color?: string }) => (
    <div className="border border-cyan-500/20 p-1.5 bg-black/40">
      <div className="text-[8px] text-cyan-500/50 tracking-wider">{label}</div>
      <div
        className={`text-[11px] font-mono ${
          color === "green"
            ? "text-emerald-400"
            : color === "red"
              ? "text-red-400"
              : color === "yellow"
                ? "text-amber-400"
                : "text-cyan-400"
        }`}
        style={{
          textShadow: `0 0 6px ${color === "green" ? "#00ff88" : color === "red" ? "#ff4466" : color === "yellow" ? "#ffaa00" : "#00ffff"}`,
        }}
      >
        {value}
      </div>
    </div>
  )

  const Dropdown = ({
    label,
    value,
    options,
    isOpen,
    setIsOpen,
    onSelect,
    width = "w-40",
  }: {
    label: string
    value: string
    options: { label: string; value: string }[]
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    onSelect: (value: string) => void
    width?: string
  }) => (
    <div className="flex items-center gap-2 relative">
      <span className="text-cyan-500/60 text-[10px]">{label}:</span>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2 py-0.5 border border-cyan-500/40 bg-black/60 text-cyan-400 text-[10px] ${width} text-left flex items-center justify-between hover:bg-cyan-500/10 transition-colors`}
        style={{ textShadow: "0 0 6px #00ffff" }}
      >
        <span className="truncate">{value}</span>
        <span className="ml-1">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 ${width} bg-black/95 border border-cyan-500/40 z-50 max-h-48 overflow-auto`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value)
                setIsOpen(false)
              }}
              className={`w-full px-2 py-1 text-left text-[10px] hover:bg-cyan-500/20 transition-colors ${
                opt.value === value ? "bg-cyan-500/30 text-cyan-300" : "text-cyan-500/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div
      className="h-full flex flex-col gap-2 overflow-hidden"
      onClick={() => {
        // Close all dropdowns when clicking outside
        setStrategyDropdownOpen(false)
        setTfDropdownOpen(false)
        setPeriodDropdownOpen(false)
      }}
    >
      {/* Header */}
      <div className="neon-border glass-panel p-2 flex-shrink-0">
        <div className="text-[11px] text-center text-cyan-500/60 tracking-[0.3em]">STRATEGY BACKTESTER</div>
      </div>

      <div className="neon-border glass-panel p-2 flex-shrink-0">
        <div className="flex items-center gap-4 text-[10px] flex-wrap" onClick={(e) => e.stopPropagation()}>
          {/* Strategy Dropdown */}
          <Dropdown
            label="STRATEGY"
            value={selectedStrategy?.name || "Select..."}
            options={strategies.map((s) => ({ label: s.name, value: s.id }))}
            isOpen={strategyDropdownOpen}
            setIsOpen={setStrategyDropdownOpen}
            onSelect={setSelectedStrategyId}
            width="w-52"
          />

          {/* Timeframe Dropdown */}
          <Dropdown
            label="TF"
            value={selectedTimeframe}
            options={TIMEFRAMES.map((tf) => ({ label: tf, value: tf }))}
            isOpen={tfDropdownOpen}
            setIsOpen={setTfDropdownOpen}
            onSelect={setSelectedTimeframe}
            width="w-20"
          />

          {/* Period Dropdown */}
          <Dropdown
            label="PERIOD"
            value={selectedPeriod}
            options={PERIODS.map((p) => ({ label: p.label, value: p.label }))}
            isOpen={periodDropdownOpen}
            setIsOpen={setPeriodDropdownOpen}
            onSelect={setSelectedPeriod}
            width="w-24"
          />

          {/* Capital Input */}
          <div className="flex items-center gap-2">
            <span className="text-cyan-500/60">CAPITAL:</span>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-cyan-500/60 text-[10px]">$</span>
              <input
                type="text"
                value={capital}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "")
                  setCapital(val)
                }}
                className="w-24 px-2 pl-4 py-0.5 border border-cyan-500/40 bg-black/60 text-cyan-400 text-[10px] focus:outline-none focus:border-cyan-400"
                style={{ textShadow: "0 0 6px #00ffff" }}
              />
            </div>
          </div>

          <button
            onClick={runBacktest}
            disabled={isRunning || !selectedStrategy}
            className={`ml-auto px-4 py-1 neon-border glass-panel text-[10px] transition-all ${
              isRunning || !selectedStrategy
                ? "text-cyan-500/40 cursor-not-allowed"
                : "text-cyan-400 hover:bg-cyan-500/20"
            }`}
            style={{ textShadow: isRunning || !selectedStrategy ? "none" : "0 0 6px #00ffff" }}
          >
            {isRunning ? `RUNNING ${progress}%` : "[ RUN ]"}
          </button>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mt-2 h-1 border border-cyan-500/40">
            <div
              className="h-full bg-cyan-400 transition-all duration-100"
              style={{ width: `${progress}%`, boxShadow: "0 0 10px #00ffff" }}
            />
          </div>
        )}
      </div>

      {/* Results - Full tear sheet layout */}
      {showResults && (
        <div className="flex-1 neon-border glass-panel p-3 flex flex-col gap-2 overflow-auto">
          {/* Strategy Info Banner */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-1">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 text-[11px]" style={{ textShadow: "0 0 6px #00ffff" }}>
                {selectedStrategy?.name}
              </span>
              <span className="text-[9px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {selectedStrategy?.type}
              </span>
            </div>
            <div className="text-[9px] text-cyan-500/60">
              {selectedTimeframe} • {selectedPeriod} • ${Number.parseFloat(capital).toLocaleString()}
            </div>
          </div>

          {/* Top Section: Charts */}
          <div className="flex gap-3">
            {/* Equity Curve */}
            <div className="flex-1 border border-cyan-500/20 p-2">
              <div className="text-[9px] text-cyan-500/60 text-center mb-1 tracking-wider">EQUITY CURVE</div>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={results} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ffff" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#00ffff" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 8, fill: "#00ffff40" }}
                    axisLine={{ stroke: "#00ffff20" }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 8, fill: "#00ffff40" }}
                    axisLine={{ stroke: "#00ffff20" }}
                    tickLine={false}
                    domain={["dataMin - 100", "dataMax + 100"]}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.9)",
                      border: "1px solid #00ffff40",
                      fontSize: 9,
                      color: "#00ffff",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Equity"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#00ffff"
                    strokeWidth={1.5}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Drawdown Chart */}
            <div className="w-64 border border-cyan-500/20 p-2">
              <div className="text-[9px] text-cyan-500/60 text-center mb-1 tracking-wider">DRAWDOWN</div>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={results} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <defs>
                    <linearGradient id="ddGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff4466" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ff4466" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={false} axisLine={{ stroke: "#00ffff20" }} />
                  <YAxis
                    tick={{ fontSize: 8, fill: "#ff446680" }}
                    axisLine={{ stroke: "#00ffff20" }}
                    tickLine={false}
                    domain={[0, "dataMax + 2"]}
                    tickFormatter={(v) => `-${v.toFixed(0)}%`}
                    width={30}
                    reversed
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.9)",
                      border: "1px solid #ff446640",
                      fontSize: 9,
                      color: "#ff4466",
                    }}
                    formatter={(value: number) => [`-${value.toFixed(2)}%`, "Drawdown"]}
                  />
                  <Area type="monotone" dataKey="drawdown" stroke="#ff4466" strokeWidth={1} fill="url(#ddGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Returns */}
            <div className="w-48 border border-cyan-500/20 p-2">
              <div className="text-[9px] text-cyan-500/60 text-center mb-1 tracking-wider">MONTHLY RETURNS</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={monthlyReturns} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 8, fill: "#00ffff40" }}
                    axisLine={{ stroke: "#00ffff20" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 8, fill: "#00ffff40" }}
                    axisLine={{ stroke: "#00ffff20" }}
                    tickLine={false}
                    tickFormatter={(v) => `${v.toFixed(0)}%`}
                    width={25}
                  />
                  <ReferenceLine y={0} stroke="#00ffff30" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid #00ffff40", fontSize: 9 }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, "Return"]}
                  />
                  <Bar dataKey="return" radius={[2, 2, 0, 0]}>
                    {monthlyReturns.map((entry, index) => (
                      <Cell key={index} fill={entry.return >= 0 ? "#00ff88" : "#ff4466"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metrics Grid - Full Tear Sheet */}
          <div className="grid grid-cols-8 gap-1">
            {/* Performance Metrics */}
            <div className="col-span-8 text-[8px] text-cyan-500/40 tracking-widest mt-1 mb-0.5 border-b border-cyan-500/20 pb-0.5">
              PERFORMANCE
            </div>
            <Metric
              label="TOTAL RETURN"
              value={`${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}%`}
              color={totalReturn >= 0 ? "green" : "red"}
            />
            <Metric
              label="CAGR"
              value={`${(totalReturn * 4).toFixed(2)}%`}
              color={totalReturn >= 0 ? "green" : "red"}
            />
            <Metric label="SHARPE" value={sharpeRatio.toFixed(2)} color={sharpeRatio > 1 ? "green" : "yellow"} />
            <Metric label="SORTINO" value={sortinoRatio.toFixed(2)} color={sortinoRatio > 1.5 ? "green" : "yellow"} />
            <Metric label="CALMAR" value={calmarRatio.toFixed(2)} color={calmarRatio > 1 ? "green" : "yellow"} />
            <Metric label="MAX DD" value={`-${maxDrawdown.toFixed(2)}%`} color="red" />
            <Metric label="AVG DD" value={`-${avgDrawdown.toFixed(2)}%`} color="red" />
            <Metric
              label="RECOVERY"
              value={`${recoveryFactor.toFixed(2)}x`}
              color={recoveryFactor > 2 ? "green" : "yellow"}
            />

            {/* Trade Metrics */}
            <div className="col-span-8 text-[8px] text-cyan-500/40 tracking-widest mt-1 mb-0.5 border-b border-cyan-500/20 pb-0.5">
              TRADE STATISTICS
            </div>
            <Metric label="TOTAL TRADES" value={totalTrades} />
            <Metric label="WIN RATE" value={`${winRate}%`} color={winRate > 50 ? "green" : "red"} />
            <Metric
              label="PROFIT FACTOR"
              value={profitFactor.toFixed(2)}
              color={profitFactor > 1.5 ? "green" : "yellow"}
            />
            <Metric label="EXPECTANCY" value={`${expectancy.toFixed(3)}%`} color={expectancy > 0 ? "green" : "red"} />
            <Metric label="AVG WIN" value={`+${avgWin}%`} color="green" />
            <Metric label="AVG LOSS" value={`${avgLoss}%`} color="red" />
            <Metric label="PAYOFF RATIO" value={payoffRatio.toFixed(2)} color={payoffRatio > 1 ? "green" : "red"} />
            <Metric label="AVG HOLD" value={avgHoldTime} />

            {/* Extremes */}
            <div className="col-span-8 text-[8px] text-cyan-500/40 tracking-widest mt-1 mb-0.5 border-b border-cyan-500/20 pb-0.5">
              EXTREMES & STREAKS
            </div>
            <Metric label="LARGEST WIN" value={`+${largestWin}%`} color="green" />
            <Metric label="LARGEST LOSS" value={`${largestLoss}%`} color="red" />
            <Metric label="WIN STREAK" value={`${consecutiveWins} trades`} color="green" />
            <Metric label="LOSS STREAK" value={`${consecutiveLosses} trades`} color="red" />
            <Metric label="ULCER IDX" value={ulcerIndex.toFixed(2)} color={ulcerIndex < 5 ? "green" : "yellow"} />
            <Metric label="TAIL RATIO" value={tailRatio.toFixed(2)} color={tailRatio > 1 ? "green" : "yellow"} />
            <Metric label="CSR" value={commonSenseRatio.toFixed(2)} color={commonSenseRatio > 1 ? "green" : "yellow"} />
            <Metric label="KELLY %" value={`${(kellyPct * 100).toFixed(1)}%`} color={kellyPct > 0 ? "green" : "red"} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto pt-2">
            <button
              className="flex-1 py-2 neon-border glass-panel text-[11px] text-emerald-400 hover:bg-emerald-500/20 tracking-wider"
              style={{ textShadow: "0 0 6px #00ff88" }}
            >
              [ DEPLOY LIVE ]
            </button>
            <button
              className="flex-1 py-2 neon-border glass-panel text-[11px] text-cyan-400 hover:bg-cyan-500/20 tracking-wider"
              style={{ textShadow: "0 0 6px #00ffff" }}
            >
              [ SAVE RESULTS ]
            </button>
            <button
              className="flex-1 py-2 neon-border glass-panel text-[11px] text-amber-400 hover:bg-amber-500/20 tracking-wider"
              style={{ textShadow: "0 0 6px #ffaa00" }}
            >
              [ EXPORT PDF ]
            </button>
          </div>
        </div>
      )}

      {/* Placeholder when no results */}
      {!showResults && !isRunning && (
        <div className="flex-1 neon-border glass-panel p-4 flex items-center justify-center">
          <div className="text-[11px] text-cyan-500/40 text-center">
            <div className="mb-2">◇ CONFIGURE PARAMETERS AND RUN BACKTEST ◇</div>
            <div className="text-[9px]">Select strategy, timeframe, and period to begin simulation</div>
          </div>
        </div>
      )}
    </div>
  )
}
