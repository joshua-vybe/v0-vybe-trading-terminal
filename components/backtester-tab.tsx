"use client"

import { useState } from "react"
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

export function BacktesterTab() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BacktestResult[]>([])
  const [monthlyReturns, setMonthlyReturns] = useState<MonthlyReturn[]>([])
  const [showResults, setShowResults] = useState(false)

  const runBacktest = () => {
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
    const data: BacktestResult[] = []
    let equity = 10000
    let peak = 10000
    for (let i = 0; i < 90; i++) {
      const change = (Math.random() - 0.45) * 200
      const prevEquity = equity
      equity = Math.max(equity + change, 8000)
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

    // Generate monthly returns
    const months = ["Jan", "Feb", "Mar"]
    const monthly = months.map((month) => ({
      month,
      return: (Math.random() - 0.3) * 8,
    }))
    setMonthlyReturns(monthly)
  }

  // Calculate tear sheet metrics
  const finalEquity = results.length > 0 ? results[results.length - 1].equity : 10000
  const totalReturn = ((finalEquity - 10000) / 10000) * 100
  const maxDrawdown = results.length > 0 ? Math.max(...results.map((r) => r.drawdown)) : 0
  const avgDrawdown = results.length > 0 ? results.reduce((a, b) => a + b.drawdown, 0) / results.length : 0
  const dailyReturns = results.map((r) => r.returns)
  const avgDailyReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0
  const stdDev =
    dailyReturns.length > 0
      ? Math.sqrt(dailyReturns.reduce((a, b) => a + Math.pow(b - avgDailyReturn, 2), 0) / dailyReturns.length)
      : 0
  const sharpeRatio = stdDev > 0 ? (avgDailyReturn / stdDev) * Math.sqrt(252) : 0
  const sortinoRatio = sharpeRatio * 1.25 // Simplified
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
  const recoveryFactor = totalReturn / maxDrawdown
  const payoffRatio = Math.abs(avgWin / avgLoss)
  const ulcerIndex = avgDrawdown * 0.8
  const tailRatio = 1.32
  const commonSenseRatio = profitFactor * (winRate / 100)
  const kellyPct = winRate / 100 - (100 - winRate) / 100 / payoffRatio

  // Metric display helper
  const Metric = ({ label, value, color = "cyan" }: { label: string; value: string | number; color?: string }) => (
    <div className="border border-[#00ffff20] p-1.5 bg-[#00000040]">
      <div className="text-[8px] text-[#00ffff50] tracking-wider">{label}</div>
      <div
        className={`text-[11px] font-mono ${
          color === "green"
            ? "text-[#00ff88]"
            : color === "red"
              ? "text-[#ff4466]"
              : color === "yellow"
                ? "text-[#ffaa00]"
                : "text-[#00ffff]"
        }`}
        style={{
          textShadow: `0 0 6px ${color === "green" ? "#00ff88" : color === "red" ? "#ff4466" : color === "yellow" ? "#ffaa00" : "#00ffff"}`,
        }}
      >
        {value}
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* Header */}
      <div className="neon-border glass-panel p-2 flex-shrink-0">
        <div className="text-[11px] text-center text-[#00ffff60] tracking-[0.3em]">STRATEGY BACKTESTER</div>
      </div>

      {/* Config Panel - Compact */}
      <div className="neon-border glass-panel p-2 flex-shrink-0">
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="text-[#00ffff60]">STRATEGY:</span>
            <div className="px-2 py-0.5 border border-[#00ffff40] glow-cyan">MOMENTUM_SCALPER</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#00ffff60]">TF:</span>
            <div className="px-2 py-0.5 border border-[#00ffff40] glow-cyan">1H</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#00ffff60]">PERIOD:</span>
            <div className="px-2 py-0.5 border border-[#00ffff40] glow-cyan">90D</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#00ffff60]">CAPITAL:</span>
            <div className="px-2 py-0.5 border border-[#00ffff40] glow-cyan">$10,000</div>
          </div>
          <button
            onClick={runBacktest}
            disabled={isRunning}
            className={`ml-auto px-4 py-1 neon-border glass-panel text-[10px] transition-all ${isRunning ? "text-[#00ffff60]" : "glow-cyan hover:bg-[#00ffff20]"}`}
          >
            {isRunning ? `RUNNING ${progress}%` : "[ RUN ]"}
          </button>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mt-2 h-1 border border-[#00ffff40]">
            <div className="h-full bg-[#00ffff]" style={{ width: `${progress}%`, boxShadow: "0 0 10px #00ffff" }} />
          </div>
        )}
      </div>

      {/* Results - Full tear sheet layout */}
      {showResults && (
        <div className="flex-1 neon-border glass-panel p-3 flex flex-col gap-2 overflow-auto">
          {/* Top Section: Charts */}
          <div className="flex gap-3">
            {/* Equity Curve */}
            <div className="flex-1 border border-[#00ffff20] p-2">
              <div className="text-[9px] text-[#00ffff60] text-center mb-1 tracking-wider">EQUITY CURVE</div>
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
            <div className="w-64 border border-[#00ffff20] p-2">
              <div className="text-[9px] text-[#00ffff60] text-center mb-1 tracking-wider">DRAWDOWN</div>
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
            <div className="w-48 border border-[#00ffff20] p-2">
              <div className="text-[9px] text-[#00ffff60] text-center mb-1 tracking-wider">MONTHLY RETURNS</div>
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
            <div className="col-span-8 text-[8px] text-[#00ffff40] tracking-widest mt-1 mb-0.5 border-b border-[#00ffff20] pb-0.5">
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
            <div className="col-span-8 text-[8px] text-[#00ffff40] tracking-widest mt-1 mb-0.5 border-b border-[#00ffff20] pb-0.5">
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
            <div className="col-span-8 text-[8px] text-[#00ffff40] tracking-widest mt-1 mb-0.5 border-b border-[#00ffff20] pb-0.5">
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
            <button className="flex-1 py-2 neon-border glass-panel text-[11px] glow-green hover:bg-[#00ff8820] tracking-wider">
              [ DEPLOY LIVE ]
            </button>
            <button className="flex-1 py-2 neon-border glass-panel text-[11px] glow-cyan hover:bg-[#00ffff20] tracking-wider">
              [ SAVE RESULTS ]
            </button>
            <button
              className="flex-1 py-2 neon-border glass-panel text-[11px] text-[#ffaa00] hover:bg-[#ffaa0020] tracking-wider"
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
          <div className="text-[11px] text-[#00ffff40] text-center">
            <div className="mb-2">◇ CONFIGURE PARAMETERS AND RUN BACKTEST ◇</div>
            <div className="text-[9px]">Select strategy, timeframe, and period to begin simulation</div>
          </div>
        </div>
      )}
    </div>
  )
}
