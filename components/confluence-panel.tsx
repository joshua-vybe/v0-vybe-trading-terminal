"use client"

import { useState, useEffect, useMemo } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line } from "recharts"
import { useConfluence, SIGNAL_LAYERS, type QuantumClassification } from "@/contexts/confluence-context"

const HMM_REGIMES = ["BULL", "BEAR", "CHOP", "HVOL"]
const REGIME_COLORS: Record<string, string> = {
  BULL: "#22c55e",
  BEAR: "#ef4444",
  CHOP: "#facc15",
  HVOL: "#a855f7",
}

const TIMEFRAMES_DISPLAY = ["1m", "5m", "15m", "1H", "4H", "1D", "1W", "1M"]

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

interface QuantumPanelState {
  qubitStates: { theta: number; phi: number; rotationSpeed: number }[]
  predictions: { predicted: number; actual: number }[]
}

function BlochSphere({
  theta,
  phi,
  size = 40,
  rotationOffset = 0,
}: { theta: number; phi: number; size?: number; rotationOffset?: number }) {
  const [animatedPhi, setAnimatedPhi] = useState(phi)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPhi((p) => (p + 0.02 + rotationOffset * 0.01) % (2 * Math.PI))
    }, 50)
    return () => clearInterval(interval)
  }, [rotationOffset])

  const x = Math.sin(theta) * Math.cos(animatedPhi) * (size / 2 - 4)
  const y = Math.sin(theta) * Math.sin(animatedPhi) * (size / 2 - 4)
  const z = Math.cos(theta) * (size / 2 - 4)

  const projX = x * 0.8 + y * 0.4
  const projY = -z + y * 0.2

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id={`sphereGlow-${rotationOffset}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill={`url(#sphereGlow-${rotationOffset})`} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          fill="none"
          stroke="#00ffff"
          strokeWidth="0.5"
          strokeOpacity="0.4"
        />
        <ellipse
          cx={size / 2}
          cy={size / 2}
          rx={size / 2 - 4}
          ry={(size / 2 - 4) * 0.3}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        <line x1={size / 2} y1={4} x2={size / 2} y2={size - 4} stroke="#00ffff" strokeWidth="0.5" strokeOpacity="0.3" />
        <line
          x1={size / 2}
          y1={size / 2}
          x2={size / 2 + projX}
          y2={size / 2 + projY}
          stroke="#ff00ff"
          strokeWidth="2"
        />
        <circle
          cx={size / 2 + projX}
          cy={size / 2 + projY}
          r="3"
          fill="#ff00ff"
          filter={`url(#blur-${rotationOffset})`}
        />
        <circle cx={size / 2 + projX} cy={size / 2 + projY} r="2" fill="#ffffff" />
      </svg>
    </div>
  )
}

export function ConfluencePanel() {
  const [activeTab, setActiveTab] = useState<"confluence" | "regime" | "orderflow" | "quantum">("confluence")

  const { signals, layerAccuracies, totalConfluence, quantumState, isQuantumEnhanced, timeframe } = useConfluence()

  // Local state for panel-specific data
  const [quantumPanelState, setQuantumPanelState] = useState<QuantumPanelState>({
    qubitStates: [
      { theta: Math.PI / 4, phi: 0, rotationSpeed: 1 },
      { theta: Math.PI / 3, phi: Math.PI / 2, rotationSpeed: 1.5 },
      { theta: Math.PI / 6, phi: Math.PI, rotationSpeed: 0.8 },
      { theta: Math.PI / 2, phi: (3 * Math.PI) / 2, rotationSpeed: 1.2 },
    ],
    predictions: Array.from({ length: 100 }, () => {
      const predicted = Math.random() > 0.5 ? 1 : 0
      const actual = Math.random() > 0.042 ? predicted : 1 - predicted
      return { predicted, actual }
    }),
  })

  const [timeframeRegimes, setTimeframeRegimes] = useState<TimeframeRegime[]>([])
  const [cvdBars, setCvdBars] = useState<CVDBar[]>([])
  const [orderflowMetrics, setOrderflowMetrics] = useState<OrderflowMetrics>({
    poc: 43250,
    vwap: 43180,
    vpoc_dist: 0.15,
    delta_percent: 12.5,
    imbalance_ratio: 1.8,
    large_trades: 847,
    absorption: "BUYING",
  })

  // Initialize timeframe regimes
  useEffect(() => {
    const generateRegimes = () => {
      return TIMEFRAMES_DISPLAY.map((tf) => ({
        tf,
        hmm: HMM_REGIMES[Math.floor(Math.random() * HMM_REGIMES.length)],
        prob: 60 + Math.random() * 35,
        entropy: Math.random() * 0.8,
        elo: 1200 + Math.random() * 600,
        days: Math.floor(Math.random() * 30) + 1,
        score: 50 + Math.random() * 50,
      }))
    }
    setTimeframeRegimes(generateRegimes())

    const interval = setInterval(() => {
      setTimeframeRegimes((prev) =>
        prev.map((r) => ({
          ...r,
          prob: Math.max(50, Math.min(99, r.prob + (Math.random() - 0.5) * 5)),
          entropy: Math.max(0, Math.min(1, r.entropy + (Math.random() - 0.5) * 0.1)),
          score: Math.max(40, Math.min(100, r.score + (Math.random() - 0.5) * 8)),
        })),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // CVD bars
  useEffect(() => {
    const generateCVD = () => {
      return Array.from({ length: 20 }, (_, i) => ({
        index: i,
        value: (Math.random() - 0.5) * 100,
      }))
    }
    setCvdBars(generateCVD())

    const interval = setInterval(() => {
      setCvdBars((prev) => {
        const newBars = [...prev.slice(1)]
        newBars.push({
          index: prev[prev.length - 1].index + 1,
          value: prev[prev.length - 1].value + (Math.random() - 0.48) * 20,
        })
        return newBars
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Update orderflow metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderflowMetrics((prev) => ({
        poc: prev.poc + (Math.random() - 0.5) * 20,
        vwap: prev.vwap + (Math.random() - 0.5) * 15,
        vpoc_dist: Math.max(-1, Math.min(1, prev.vpoc_dist + (Math.random() - 0.5) * 0.1)),
        delta_percent: Math.max(-50, Math.min(50, prev.delta_percent + (Math.random() - 0.5) * 5)),
        imbalance_ratio: Math.max(0.5, Math.min(3, prev.imbalance_ratio + (Math.random() - 0.5) * 0.2)),
        large_trades: Math.max(0, prev.large_trades + Math.floor((Math.random() - 0.3) * 50)),
        absorption: Math.random() > 0.9 ? (prev.absorption === "BUYING" ? "SELLING" : "BUYING") : prev.absorption,
      }))
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  // Update quantum panel state
  useEffect(() => {
    const interval = setInterval(() => {
      setQuantumPanelState((prev) => ({
        qubitStates: prev.qubitStates.map((q) => ({
          ...q,
          theta: Math.max(0, Math.min(Math.PI, q.theta + (Math.random() - 0.5) * 0.1)),
          phi: (q.phi + 0.05 * q.rotationSpeed) % (2 * Math.PI),
        })),
        predictions: [
          ...prev.predictions.slice(1),
          (() => {
            const predicted = Math.random() > 0.5 ? 1 : 0
            const actual = Math.random() > 0.042 ? predicted : 1 - predicted
            return { predicted, actual }
          })(),
        ],
      }))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Calculate prediction accuracy
  const predictionAccuracy = useMemo(() => {
    const correct = quantumPanelState.predictions.filter((p) => p.predicted === p.actual).length
    return (correct / quantumPanelState.predictions.length) * 100
  }, [quantumPanelState.predictions])

  // Radar data for 7 layers
  const radarData = useMemo(() => {
    return SIGNAL_LAYERS.map((layer) => ({
      subject: layer.shortName,
      value: signals[layer.id as keyof typeof signals] || 0,
      fullMark: 100,
    }))
  }, [signals])

  const getScoreColor = (score: number) => {
    if (score >= 88) return "#22c55e"
    if (score >= 78) return "#facc15"
    return "#ef4444"
  }

  const tabs = [
    { id: "confluence", label: "CONFLUENCE" },
    { id: "regime", label: "REGIME" },
    { id: "orderflow", label: "ORDERFLOW" },
    { id: "quantum", label: "QUANTUM" },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-2 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-2 py-1 text-[9px] font-bold tracking-wider border transition-all ${
              activeTab === tab.id
                ? tab.id === "quantum"
                  ? "border-purple-500 text-purple-400 bg-purple-500/10"
                  : "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                : "border-cyan-900/50 text-cyan-700 hover:text-cyan-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2">
        {activeTab === "confluence" && (
          <div className="space-y-3">
            <div className="text-center text-[9px] text-cyan-600 tracking-wider">
              TIMEFRAME: <span className="text-cyan-400 font-bold">{timeframe.toUpperCase()}</span>
            </div>

            {/* Total Score with quantum glow */}
            <div
              className={`text-center p-2 border ${isQuantumEnhanced ? "border-purple-500/50 quantum-shimmer" : "border-cyan-900/30"} rounded`}
            >
              <div className="text-[10px] text-cyan-600 tracking-wider mb-1">TOTAL CONFLUENCE</div>
              <div
                className="text-4xl font-bold font-mono"
                style={{
                  color: isQuantumEnhanced ? "#8b5cf6" : getScoreColor(totalConfluence),
                  textShadow: isQuantumEnhanced
                    ? "0 0 20px #8b5cf680, 0 0 40px #00ffff40"
                    : `0 0 20px ${getScoreColor(totalConfluence)}60`,
                }}
              >
                {totalConfluence.toFixed(1)}
              </div>
              {isQuantumEnhanced && (
                <div className="text-[9px] text-purple-400 mt-1 tracking-wider">QUANTUM ENHANCED</div>
              )}
            </div>

            {/* Radar Chart - 7 points */}
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#164e6340" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#0e7490", fontSize: 9 }} />
                  <Radar
                    name="Signal"
                    dataKey="value"
                    stroke="#00ffff"
                    fill="#00ffff"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5">
              {SIGNAL_LAYERS.map((layer) => {
                const value = signals[layer.id as keyof typeof signals] || 0
                const layerAcc = layerAccuracies.find((l) => l.id === layer.id)
                const weight = layerAcc?.weight || layer.baseWeight
                const accuracy = layerAcc?.accuracy || 80
                const isVQC = layer.id === "vqc"

                return (
                  <div
                    key={layer.id}
                    className={`flex items-center gap-2 text-[10px] ${isVQC ? "border border-purple-500/30 rounded px-1 py-0.5 bg-purple-500/5" : ""}`}
                  >
                    <span className="w-8 font-bold" style={{ color: layer.color }}>
                      {layer.shortName}
                    </span>
                    <span className="w-10 text-cyan-600 text-[8px]">{weight.toFixed(1)}%</span>
                    <div className="flex-1 h-2 bg-cyan-950/50 rounded overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${value}%`,
                          backgroundColor: layer.color,
                          boxShadow: `0 0 8px ${layer.color}60`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono" style={{ color: layer.color }}>
                      {Math.round(value)}
                    </span>
                    <span className="w-10 text-right text-[8px] text-cyan-700">{accuracy.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>

            {/* Weight Legend */}
            <div className="text-[8px] text-cyan-700 text-center border-t border-cyan-900/30 pt-2 mt-2">
              WEIGHTS AUTO-ADJUST BY ACCURACY (0.8x-1.2x) | VQC = 4-QUBIT QUANTUM
            </div>
          </div>
        )}

        {activeTab === "regime" && (
          <div className="space-y-2">
            <div className="text-[9px] text-cyan-600 tracking-wider mb-2">HMM REGIME ANALYSIS</div>
            <div className="space-y-1">
              {timeframeRegimes.map((regime) => (
                <div key={regime.tf} className="flex items-center gap-2 text-[10px] border-b border-cyan-900/20 pb-1">
                  <span className="w-8 text-cyan-500 font-bold">{regime.tf}</span>
                  <span
                    className="w-12 font-bold text-center px-1 rounded text-[9px]"
                    style={{
                      color: REGIME_COLORS[regime.hmm],
                      backgroundColor: `${REGIME_COLORS[regime.hmm]}20`,
                      border: `1px solid ${REGIME_COLORS[regime.hmm]}40`,
                    }}
                  >
                    {regime.hmm}
                  </span>
                  <div className="flex-1 h-1.5 bg-cyan-950/50 rounded overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${regime.prob}%`,
                        backgroundColor: REGIME_COLORS[regime.hmm],
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-cyan-400 font-mono">{regime.prob.toFixed(0)}%</span>
                  <span className="w-8 text-right text-cyan-700 text-[8px]">H:{regime.entropy.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 p-2 border border-cyan-900/30 rounded">
              <div className="text-[9px] text-cyan-600 mb-2">REGIME ELO RANKINGS</div>
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                {timeframeRegimes
                  .sort((a, b) => b.elo - a.elo)
                  .slice(0, 4)
                  .map((r, i) => (
                    <div key={r.tf} className="flex justify-between">
                      <span className="text-cyan-500">
                        #{i + 1} {r.tf}
                      </span>
                      <span className="text-cyan-400 font-mono">{Math.round(r.elo)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orderflow" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 border border-cyan-900/30 rounded">
                <div className="text-[8px] text-cyan-600">POC</div>
                <div className="text-sm text-cyan-400 font-mono">${orderflowMetrics.poc.toFixed(0)}</div>
              </div>
              <div className="p-2 border border-cyan-900/30 rounded">
                <div className="text-[8px] text-cyan-600">VWAP</div>
                <div className="text-sm text-cyan-400 font-mono">${orderflowMetrics.vwap.toFixed(0)}</div>
              </div>
            </div>

            <div className="p-2 border border-cyan-900/30 rounded">
              <div className="text-[8px] text-cyan-600 mb-1">CVD DELTA</div>
              <div className="h-[60px] flex items-end gap-0.5">
                {cvdBars.map((bar, i) => (
                  <div
                    key={i}
                    className="flex-1 transition-all duration-200"
                    style={{
                      height: `${Math.abs(bar.value)}%`,
                      backgroundColor: bar.value >= 0 ? "#00ffff" : "#ff00ff",
                      opacity: 0.5 + (i / cvdBars.length) * 0.5,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[8px] mt-1">
                <span className={orderflowMetrics.delta_percent >= 0 ? "text-cyan-400" : "text-pink-400"}>
                  {orderflowMetrics.delta_percent >= 0 ? "+" : ""}
                  {orderflowMetrics.delta_percent.toFixed(1)}%
                </span>
                <span
                  className={`font-bold ${orderflowMetrics.absorption === "BUYING" ? "text-green-400" : "text-red-400"}`}
                >
                  {orderflowMetrics.absorption}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 text-[9px]">
              <div className="p-1.5 border border-cyan-900/30 rounded text-center">
                <div className="text-[7px] text-cyan-600">IMBALANCE</div>
                <div className="text-cyan-400 font-mono">{orderflowMetrics.imbalance_ratio.toFixed(2)}x</div>
              </div>
              <div className="p-1.5 border border-cyan-900/30 rounded text-center">
                <div className="text-[7px] text-cyan-600">LG TRADES</div>
                <div className="text-cyan-400 font-mono">{orderflowMetrics.large_trades}</div>
              </div>
              <div className="p-1.5 border border-cyan-900/30 rounded text-center">
                <div className="text-[7px] text-cyan-600">VPOC DIST</div>
                <div className={`font-mono ${orderflowMetrics.vpoc_dist >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {orderflowMetrics.vpoc_dist >= 0 ? "+" : ""}
                  {(orderflowMetrics.vpoc_dist * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "quantum" && (
          <div className="space-y-3">
            {/* Qubit Circuit */}
            <div className="p-2 border border-purple-500/30 rounded bg-purple-500/5">
              <div className="text-[9px] text-purple-400 tracking-wider mb-2">4-QUBIT QUANTUM CIRCUIT</div>
              <div className="flex justify-around">
                {quantumPanelState.qubitStates.map((qubit, i) => (
                  <div key={i} className="text-center">
                    <BlochSphere theta={qubit.theta} phi={qubit.phi} size={50} rotationOffset={i} />
                    <div className="text-[8px] text-purple-400 mt-1">Q{i}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* VQC Classification - uses shared context */}
            <div className="p-2 border border-purple-500/30 rounded">
              <div className="text-[9px] text-purple-400 tracking-wider mb-2">VQC-LITE CLASSIFICATION</div>
              {(["TRENDING", "RANGING", "CASCADE"] as QuantumClassification[]).map((cls) => (
                <div key={cls} className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] w-16 ${quantumState.classification === cls ? "text-purple-300 font-bold" : "text-purple-600"}`}
                  >
                    {cls}
                  </span>
                  <div className="flex-1 h-2 bg-purple-950/50 rounded overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${quantumState.probabilities[cls]}%`,
                        backgroundColor: quantumState.classification === cls ? "#a855f7" : "#6b21a8",
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-purple-400 w-12 text-right font-mono">
                    {quantumState.probabilities[cls].toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>

            {/* Quantum Contribution - uses shared context */}
            <div className="p-2 border border-purple-500/30 rounded bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[9px] text-purple-400">QUANTUM CONTRIBUTION</div>
                  <div className="text-lg font-bold text-purple-300">
                    +{((signals.vqc * (layerAccuracies.find((l) => l.id === "vqc")?.weight || 15)) / 100).toFixed(1)}{" "}
                    pts
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-cyan-400">TOTAL SCORE</div>
                  <div className="text-lg font-bold text-cyan-300">{totalConfluence.toFixed(1)}</div>
                </div>
              </div>
            </div>

            {/* Prediction Accuracy */}
            <div className="p-2 border border-purple-500/30 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-purple-400">PREDICTION ACCURACY (100 SAMPLES)</span>
                <span className="text-[11px] font-bold text-green-400">{predictionAccuracy.toFixed(1)}%</span>
              </div>
              <div className="h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={quantumPanelState.predictions.map((p, i) => ({ i, match: p.predicted === p.actual ? 1 : 0 }))}
                  >
                    <Line type="stepAfter" dataKey="match" stroke="#22c55e" dot={false} strokeWidth={1} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
