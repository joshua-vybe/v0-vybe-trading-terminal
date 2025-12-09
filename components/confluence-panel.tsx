"use client"

import { useState, useEffect, useMemo } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts"

// Signal layer weights
const SIGNAL_LAYERS = [
  { id: "vp", name: "VP Containment", shortName: "VP", weight: 30, color: "#22c55e" },
  { id: "cvd", name: "CVD Divergence", shortName: "CVD", weight: 25, color: "#3b82f6" },
  { id: "breakout", name: "Breakout Conf", shortName: "BRK", weight: 30, color: "#f97316" },
  { id: "ob_fvg", name: "OB/FVG", shortName: "OB", weight: 20, color: "#a855f7" },
  { id: "regime", name: "Regime Score", shortName: "REG", weight: 25, color: "#06b6d4" },
  { id: "htf", name: "HTF Alignment", shortName: "HTF", weight: 15, color: "#ec4899" },
]

const HMM_REGIMES = ["BULL", "BEAR", "CHOP", "HVOL"]
const REGIME_COLORS: Record<string, string> = {
  BULL: "#22c55e",
  BEAR: "#ef4444",
  CHOP: "#facc15",
  HVOL: "#a855f7",
}

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D", "1W", "1M"]

interface SignalData {
  vp: number
  cvd: number
  breakout: number
  ob_fvg: number
  regime: number
  htf: number
}

interface TimeframeRegime {
  tf: string
  hmm: string
  prob: number
  entropy: number
  elo: number
  days: number
  score: number
}

interface CVDBar {
  index: number
  value: number
}

interface OrderflowMetrics {
  poc: number
  vwap: number
  vpoc_dist: number
  delta_percent: number
  imbalance_ratio: number
  large_trades: number
  absorption: string
}

export function ConfluencePanel() {
  const [activeTab, setActiveTab] = useState<"confluence" | "regime" | "orderflow">("confluence")
  const [signals, setSignals] = useState<SignalData>({
    vp: 85,
    cvd: 72,
    breakout: 90,
    ob_fvg: 68,
    regime: 78,
    htf: 82,
  })
  const [regimeData, setRegimeData] = useState<TimeframeRegime[]>(
    TIMEFRAMES.map((tf) => ({
      tf,
      hmm: HMM_REGIMES[Math.floor(Math.random() * 4)],
      prob: 0.7 + Math.random() * 0.25,
      entropy: 0.3 + Math.random() * 0.7,
      elo: 900 + Math.random() * 400,
      days: Math.floor(Math.random() * 30),
      score: 50 + Math.random() * 50,
    })),
  )
  const [cvdData, setCvdData] = useState<CVDBar[]>([])
  const [orderflow, setOrderflow] = useState<OrderflowMetrics>({
    poc: 44125.5,
    vwap: 44089.25,
    vpoc_dist: 0.08,
    delta_percent: 12.5,
    imbalance_ratio: 1.35,
    large_trades: 847,
    absorption: "BID",
  })

  // Initialize CVD data
  useEffect(() => {
    const initialCVD = Array.from({ length: 30 }, (_, i) => ({
      index: i,
      value: (Math.random() - 0.5) * 100,
    }))
    setCvdData(initialCVD)
  }, [])

  // Live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSignals((prev) => ({
        vp: Math.max(0, Math.min(100, prev.vp + (Math.random() - 0.5) * 8)),
        cvd: Math.max(0, Math.min(100, prev.cvd + (Math.random() - 0.5) * 10)),
        breakout: Math.max(0, Math.min(100, prev.breakout + (Math.random() - 0.5) * 6)),
        ob_fvg: Math.max(0, Math.min(100, prev.ob_fvg + (Math.random() - 0.5) * 8)),
        regime: Math.max(0, Math.min(100, prev.regime + (Math.random() - 0.5) * 5)),
        htf: Math.max(0, Math.min(100, prev.htf + (Math.random() - 0.5) * 4)),
      }))

      setRegimeData((prev) =>
        prev.map((r) => ({
          ...r,
          prob: Math.max(0.5, Math.min(0.98, r.prob + (Math.random() - 0.5) * 0.05)),
          entropy: Math.max(0.1, Math.min(1.2, r.entropy + (Math.random() - 0.5) * 0.08)),
          elo: Math.max(800, Math.min(1400, r.elo + (Math.random() - 0.5) * 15)),
          score: Math.max(0, Math.min(100, r.score + (Math.random() - 0.5) * 5)),
          hmm: Math.random() > 0.98 ? HMM_REGIMES[Math.floor(Math.random() * 4)] : r.hmm,
        })),
      )

      setCvdData((prev) => {
        const newBar = { index: prev.length, value: (Math.random() - 0.5) * 100 }
        return [...prev.slice(1), newBar]
      })

      setOrderflow((prev) => ({
        poc: prev.poc + (Math.random() - 0.5) * 10,
        vwap: prev.vwap + (Math.random() - 0.5) * 5,
        vpoc_dist: Math.max(-1, Math.min(1, prev.vpoc_dist + (Math.random() - 0.5) * 0.1)),
        delta_percent: Math.max(-50, Math.min(50, prev.delta_percent + (Math.random() - 0.5) * 5)),
        imbalance_ratio: Math.max(0.5, Math.min(2, prev.imbalance_ratio + (Math.random() - 0.5) * 0.1)),
        large_trades: Math.max(0, Math.floor(prev.large_trades + (Math.random() - 0.5) * 50)),
        absorption: Math.random() > 0.95 ? (prev.absorption === "BID" ? "ASK" : "BID") : prev.absorption,
      }))
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 88) return "#22c55e"
    if (score >= 78) return "#facc15"
    return "#ef4444"
  }

  const radarData = SIGNAL_LAYERS.map((layer) => ({
    subject: layer.shortName,
    value: signals[layer.id as keyof SignalData],
    fullMark: 100,
  }))

  const cumulativeCVD = useMemo(() => {
    let cumulative = 0
    return cvdData.map((bar) => {
      cumulative += bar.value
      return cumulative
    })
  }, [cvdData])

  return (
    <div className="neon-border glass-panel p-2 h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-cyan-900/50 mb-2 shrink-0">
        {(["confluence", "regime", "orderflow"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-[11px] font-bold tracking-wider transition-all relative ${
              activeTab === tab ? "text-cyan-400" : "text-cyan-700 hover:text-cyan-500"
            }`}
          >
            {tab.toUpperCase()}
            {activeTab === tab && (
              <div
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan-400"
                style={{ boxShadow: "0 0 8px #22d3ee" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content - fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Confluence Tab */}
        {activeTab === "confluence" && (
          <div className="h-full flex flex-col">
            {/* Radar Chart - takes more space now */}
            <div className="flex-1 min-h-0 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#164e63" strokeOpacity={0.5} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#06b6d4", fontSize: 10 }}
                    tickLine={{ stroke: "#164e63" }}
                  />
                  <Radar
                    name="Signals"
                    dataKey="value"
                    stroke="#22d3ee"
                    fill="#22d3ee"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Signal Layers List - compact */}
            <div className="space-y-1.5 shrink-0">
              {SIGNAL_LAYERS.map((layer) => {
                const value = signals[layer.id as keyof SignalData]
                return (
                  <div key={layer.id} className="flex items-center gap-2">
                    <div className="w-10 text-[10px] text-cyan-600 truncate">{layer.shortName}</div>
                    <div className="flex-1 h-2 bg-black/50 border border-cyan-900/30 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${value}%`,
                          backgroundColor: layer.color,
                          boxShadow: `0 0 4px ${layer.color}`,
                        }}
                      />
                    </div>
                    <div className="w-8 text-[10px] font-mono text-right" style={{ color: layer.color }}>
                      {value.toFixed(0)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Regime Tab */}
        {activeTab === "regime" && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="grid grid-cols-7 gap-1 text-[9px] text-cyan-600 font-bold px-1 mb-1 shrink-0">
              <div>TF</div>
              <div>HMM</div>
              <div>PROB</div>
              <div>ENT</div>
              <div>ELO</div>
              <div>DAYS</div>
              <div>SCORE</div>
            </div>

            {/* Timeframe Rows */}
            <div className="flex-1 space-y-1 overflow-y-auto scrollbar-thin pr-1">
              {regimeData.map((row) => (
                <div
                  key={row.tf}
                  className="grid grid-cols-7 gap-1 text-[10px] font-mono items-center px-1 py-1.5 bg-black/20 border border-cyan-900/20"
                >
                  <div className="text-cyan-400 font-bold">{row.tf}</div>
                  <div style={{ color: REGIME_COLORS[row.hmm] }}>{row.hmm}</div>
                  <div className="text-cyan-300">{(row.prob * 100).toFixed(0)}%</div>
                  <div className={row.entropy < 0.6 ? "text-green-400" : "text-red-400"}>{row.entropy.toFixed(2)}</div>
                  <div className={row.elo > 1100 ? "text-green-400" : "text-cyan-400"}>{row.elo.toFixed(0)}</div>
                  <div className="text-pink-400">{row.days}d</div>
                  <div style={{ color: getScoreColor(row.score) }}>{row.score.toFixed(0)}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 pt-2 shrink-0">
              {Object.entries(REGIME_COLORS).map(([regime, color]) => (
                <div key={regime} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[9px] text-cyan-600">{regime}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orderflow Tab */}
        {activeTab === "orderflow" && (
          <div className="h-full flex flex-col">
            {/* Key Levels */}
            <div className="grid grid-cols-2 gap-2 mb-2 shrink-0">
              <div className="glass-panel p-2">
                <div className="text-[9px] text-cyan-600">POC</div>
                <div className="text-sm font-bold font-mono text-yellow-400">${orderflow.poc.toFixed(2)}</div>
              </div>
              <div className="glass-panel p-2">
                <div className="text-[9px] text-cyan-600">VWAP</div>
                <div className="text-sm font-bold font-mono text-purple-400">${orderflow.vwap.toFixed(2)}</div>
              </div>
            </div>

            {/* CVD Delta Chart */}
            <div className="text-[10px] text-cyan-600 mb-1 shrink-0">CVD DELTA (30 bars)</div>
            <div className="h-[60px] shrink-0 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cvdData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <XAxis dataKey="index" hide />
                  <Bar dataKey="value" radius={[1, 1, 0, 0]}>
                    {cvdData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.value >= 0 ? "#22c55e" : "#ef4444"}
                        fillOpacity={Math.min(1, Math.abs(entry.value) / 50 + 0.4)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Running CVD */}
            <div className="glass-panel p-2 mb-2 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-cyan-600">RUNNING CVD</span>
                <span
                  className="text-lg font-bold font-mono"
                  style={{ color: cumulativeCVD[cumulativeCVD.length - 1] >= 0 ? "#22c55e" : "#ef4444" }}
                >
                  {cumulativeCVD[cumulativeCVD.length - 1]?.toFixed(0) || 0}
                </span>
              </div>
            </div>

            {/* Orderflow Metrics Grid */}
            <div className="grid grid-cols-3 gap-1.5 flex-1">
              <div className="glass-panel p-1.5 text-center">
                <div className="text-[8px] text-cyan-700">DELTA %</div>
                <div
                  className="text-[11px] font-bold font-mono"
                  style={{ color: orderflow.delta_percent >= 0 ? "#22c55e" : "#ef4444" }}
                >
                  {orderflow.delta_percent >= 0 ? "+" : ""}
                  {orderflow.delta_percent.toFixed(1)}%
                </div>
              </div>
              <div className="glass-panel p-1.5 text-center">
                <div className="text-[8px] text-cyan-700">IMBALANCE</div>
                <div
                  className="text-[11px] font-bold font-mono"
                  style={{ color: orderflow.imbalance_ratio >= 1 ? "#22c55e" : "#ef4444" }}
                >
                  {orderflow.imbalance_ratio.toFixed(2)}
                </div>
              </div>
              <div className="glass-panel p-1.5 text-center">
                <div className="text-[8px] text-cyan-700">LRG TRADES</div>
                <div className="text-[11px] font-bold font-mono text-cyan-400">{orderflow.large_trades}</div>
              </div>
              <div className="glass-panel p-1.5 text-center">
                <div className="text-[8px] text-cyan-700">POC DIST</div>
                <div
                  className="text-[11px] font-bold font-mono"
                  style={{ color: Math.abs(orderflow.vpoc_dist) < 0.1 ? "#22c55e" : "#facc15" }}
                >
                  {(orderflow.vpoc_dist * 100).toFixed(1)}%
                </div>
              </div>
              <div className="glass-panel p-1.5 text-center">
                <div className="text-[8px] text-cyan-700">ABSORPTION</div>
                <div
                  className="text-[11px] font-bold font-mono"
                  style={{ color: orderflow.absorption === "BID" ? "#22c55e" : "#ef4444" }}
                >
                  {orderflow.absorption}
                </div>
              </div>
              <div className="glass-panel p-1.5 text-center">
                <div className="text-[8px] text-cyan-700">BIAS</div>
                <div
                  className="text-[11px] font-bold font-mono"
                  style={{
                    color: cumulativeCVD[cumulativeCVD.length - 1] >= 0 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {cumulativeCVD[cumulativeCVD.length - 1] >= 0 ? "BUYERS" : "SELLERS"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
