"use client"

import { useState } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface BacktestResult {
  date: string
  equity: number
  drawdown: number
}

export function BacktesterTab() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BacktestResult[]>([])
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
    for (let i = 0; i < 90; i++) {
      const change = (Math.random() - 0.45) * 200
      equity = Math.max(equity + change, 8000)
      data.push({
        date: `Day ${i + 1}`,
        equity,
        drawdown: Math.max(0, ((10000 - equity) / 10000) * 100),
      })
    }
    setResults(data)
  }

  const finalEquity = results.length > 0 ? results[results.length - 1].equity : 10000
  const totalReturn = ((finalEquity - 10000) / 10000) * 100
  const maxDrawdown = results.length > 0 ? Math.max(...results.map((r) => r.drawdown)) : 0

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* Header */}
      <div className="neon-border glass-panel p-2 flex-shrink-0">
        <div className="text-[10px] text-center text-[#00ffff60] tracking-[0.3em]">STRATEGY BACKTESTER</div>
      </div>

      {/* Config Panel - Compact */}
      <div className="neon-border glass-panel p-2 flex-shrink-0">
        <div className="flex items-center gap-4 text-[9px]">
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
            className={`ml-auto px-4 py-1 neon-border glass-panel text-[9px] transition-all ${isRunning ? "text-[#00ffff60]" : "glow-cyan hover:bg-[#00ffff20]"}`}
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

      {/* Results - Full width, side-by-side layout */}
      {showResults && (
        <div className="flex-1 neon-border glass-panel p-2 flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 flex gap-3 min-h-0">
            {/* Equity Curve - Left side, using Recharts */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="text-[9px] text-[#00ffff60] text-center mb-1 tracking-wider">EQUITY CURVE</div>
              <div className="flex-1 min-h-0" style={{ minHeight: 150 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={results} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00ffff" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#00ffff" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 8, fill: "#00ffff60" }}
                      axisLine={{ stroke: "#00ffff40" }}
                      tickLine={{ stroke: "#00ffff40" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 8, fill: "#00ffff60" }}
                      axisLine={{ stroke: "#00ffff40" }}
                      tickLine={{ stroke: "#00ffff40" }}
                      domain={["dataMin - 100", "dataMax + 100"]}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
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
                      strokeWidth={2}
                      fill="url(#equityGradient)"
                      style={{ filter: "drop-shadow(0 0 4px #00ffff)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metrics - Right side, compact grid */}
            <div className="w-48 flex flex-col gap-2 flex-shrink-0">
              <div className="text-[9px] text-[#00ffff60] text-center tracking-wider">METRICS</div>
              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <div className="border border-[#00ffff30] p-1">
                  <div className="text-[#00ffff60] text-[8px]">RETURN</div>
                  <div className={totalReturn >= 0 ? "glow-green" : "glow-crimson"}>
                    {totalReturn >= 0 ? "+" : ""}
                    {totalReturn.toFixed(2)}%
                  </div>
                </div>
                <div className="border border-[#00ffff30] p-1">
                  <div className="text-[#00ffff60] text-[8px]">SHARPE</div>
                  <div className="glow-cyan">2.31</div>
                </div>
                <div className="border border-[#00ffff30] p-1">
                  <div className="text-[#00ffff60] text-[8px]">MAX DD</div>
                  <div className="glow-crimson">-{maxDrawdown.toFixed(2)}%</div>
                </div>
                <div className="border border-[#00ffff30] p-1">
                  <div className="text-[#00ffff60] text-[8px]">WIN RATE</div>
                  <div className="glow-green">68.4%</div>
                </div>
                <div className="border border-[#00ffff30] p-1">
                  <div className="text-[#00ffff60] text-[8px]">TRADES</div>
                  <div className="glow-cyan">247</div>
                </div>
                <div className="border border-[#00ffff30] p-1">
                  <div className="text-[#00ffff60] text-[8px]">PROFIT F</div>
                  <div className="glow-green">2.14</div>
                </div>
                <div className="border border-[#00ffff30] p-1">
                  <div className="text-[#00ffff60] text-[8px]">AVG WIN</div>
                  <div className="glow-green">+0.72%</div>
                </div>
                <div className="border border-[#00ffff30] p-1">
                  <div className="text-[#00ffff60] text-[8px]">AVG LOSS</div>
                  <div className="glow-crimson">-0.38%</div>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-auto">
                <button className="w-full py-1.5 neon-border glass-panel text-[9px] glow-green hover:bg-[#00ff8820]">
                  [ DEPLOY LIVE ]
                </button>
                <button className="w-full py-1.5 neon-border glass-panel text-[9px] glow-cyan hover:bg-[#00ffff20]">
                  [ SAVE RESULTS ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder when no results */}
      {!showResults && !isRunning && (
        <div className="flex-1 neon-border glass-panel p-4 flex items-center justify-center">
          <div className="text-[10px] text-[#00ffff40] text-center">
            <div className="mb-2">◇ CONFIGURE PARAMETERS AND RUN BACKTEST ◇</div>
            <div className="text-[8px]">Select strategy, timeframe, and period to begin simulation</div>
          </div>
        </div>
      )}
    </div>
  )
}
