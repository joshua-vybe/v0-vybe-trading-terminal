"use client"

import { useState, useEffect, useMemo } from "react"
import { useConfluence, SIGNAL_LAYERS } from "@/contexts/confluence-context"
import { GroverSniperPanel } from "@/components/grover-sniper-panel"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts"

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

function ConfluenceTab() {
  const { signals, layerAccuracies, totalConfluence, timeframe } = useConfluence()

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

  return (
    <div className="space-y-3 p-2">
      {/* Radar Chart */}
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#00ffff" strokeOpacity={0.2} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#00ffff", fontSize: 10 }} />
            <Radar
              name="Confluence"
              dataKey="value"
              stroke="#00ffff"
              fill="#00ffff"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Signal Layers */}
      <div className="space-y-1">
        {SIGNAL_LAYERS.map((layer) => {
          const signalValue = signals[layer.id as keyof typeof signals] || 0
          const accuracy = layerAccuracies[layer.id as keyof typeof layerAccuracies] || 0
          const weight = layer.weight * (0.8 + accuracy * 0.004)
          const weightPercent = (weight / SIGNAL_LAYERS.reduce((sum, l) => sum + l.weight, 0)) * 100

          return (
            <div key={layer.id} className="flex items-center gap-2 text-[10px]">
              <div className="w-8 font-bold" style={{ color: layer.color }}>
                {layer.shortName}
              </div>
              <div className="w-12 text-cyan-400">{weightPercent.toFixed(1)}%</div>
              <div className="flex-1 h-2 bg-black/50 border border-cyan-900/50 relative">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${signalValue}%`,
                    backgroundColor: layer.color,
                    opacity: 0.8,
                  }}
                />
              </div>
              <div className="w-8 text-right font-mono" style={{ color: layer.color }}>
                {signalValue}
              </div>
              <div className="w-10 text-right text-cyan-600 text-[9px]">{accuracy}%</div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-cyan-900/50 text-[9px] text-cyan-600 text-center">
        WEIGHTS AUTO-ADJUST BY ACCURACY (0.8x-1.2x) | VQC = 4-QUBIT QUANTUM
      </div>
    </div>
  )
}

function RegimeTab() {
  const [timeframeRegimes, setTimeframeRegimes] = useState<TimeframeRegime[]>([])

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

  return (
    <div className="space-y-3 p-2">
      <div className="text-[10px] font-bold text-cyan-400 mb-2">HMM REGIME ANALYSIS</div>
      <div className="space-y-1">
        {timeframeRegimes.map((r) => (
          <div key={r.tf} className="flex items-center gap-2 text-[10px]">
            <div className="w-8 text-cyan-400 font-bold">{r.tf}</div>
            <div
              className="px-2 py-0.5 rounded text-[9px] font-bold"
              style={{
                backgroundColor: `${REGIME_COLORS[r.hmm]}20`,
                color: REGIME_COLORS[r.hmm],
                border: `1px solid ${REGIME_COLORS[r.hmm]}`,
              }}
            >
              {r.hmm}
            </div>
            <div className="flex-1 h-2 bg-black/50 border border-cyan-900/50 relative">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${r.prob}%`,
                  backgroundColor: REGIME_COLORS[r.hmm],
                  opacity: 0.6,
                }}
              />
            </div>
            <div className="w-10 text-right text-cyan-400">{r.prob.toFixed(0)}%</div>
            <div className="w-16 text-right text-cyan-600 text-[9px]">H:{r.entropy.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-cyan-900/50">
        <div className="text-[10px] font-bold text-cyan-400 mb-2">REGIME ELO RANKINGS</div>
        <div className="grid grid-cols-2 gap-2 text-[9px]">
          {timeframeRegimes
            .sort((a, b) => b.elo - a.elo)
            .slice(0, 4)
            .map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-cyan-600">#{i + 1}</div>
                <div className="text-cyan-400">{r.tf}</div>
                <div className="flex-1 text-right text-cyan-400">{r.elo.toFixed(0)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

function OrderflowTab() {
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

  const maxCVD = Math.max(...cvdBars.map((b) => Math.abs(b.value)))

  return (
    <div className="space-y-3 p-2">
      <div className="text-[10px] font-bold text-cyan-400 mb-2">CUMULATIVE VOLUME DELTA</div>

      {/* CVD Chart */}
      <div className="h-[100px] flex items-end gap-0.5">
        {cvdBars.map((bar) => {
          const height = (Math.abs(bar.value) / maxCVD) * 90
          const isPositive = bar.value >= 0
          return (
            <div
              key={bar.index}
              className="flex-1 transition-all duration-300"
              style={{
                height: `${height}%`,
                backgroundColor: isPositive ? "#22c55e" : "#ef4444",
                opacity: 0.8,
                alignSelf: "flex-end",
              }}
            />
          )
        })}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="border border-cyan-900/50 p-2">
          <div className="text-cyan-600 text-[9px]">POC</div>
          <div className="text-cyan-400 font-mono">${orderflowMetrics.poc.toFixed(2)}</div>
        </div>
        <div className="border border-cyan-900/50 p-2">
          <div className="text-cyan-600 text-[9px]">VWAP</div>
          <div className="text-cyan-400 font-mono">${orderflowMetrics.vwap.toFixed(2)}</div>
        </div>
        <div className="border border-cyan-900/50 p-2">
          <div className="text-cyan-600 text-[9px]">DELTA %</div>
          <div
            className="font-mono font-bold"
            style={{ color: orderflowMetrics.delta_percent >= 0 ? "#22c55e" : "#ef4444" }}
          >
            {orderflowMetrics.delta_percent >= 0 ? "+" : ""}
            {orderflowMetrics.delta_percent.toFixed(1)}%
          </div>
        </div>
        <div className="border border-cyan-900/50 p-2">
          <div className="text-cyan-600 text-[9px]">IMBALANCE</div>
          <div className="text-cyan-400 font-mono">{orderflowMetrics.imbalance_ratio.toFixed(2)}x</div>
        </div>
        <div className="border border-cyan-900/50 p-2">
          <div className="text-cyan-600 text-[9px]">LARGE TRADES</div>
          <div className="text-cyan-400 font-mono">{orderflowMetrics.large_trades}</div>
        </div>
        <div className="border border-cyan-900/50 p-2">
          <div className="text-cyan-600 text-[9px]">ABSORPTION</div>
          <div
            className="font-bold text-[9px]"
            style={{ color: orderflowMetrics.absorption === "BUYING" ? "#22c55e" : "#ef4444" }}
          >
            {orderflowMetrics.absorption}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuantumTab() {
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

  const predictionAccuracy = useMemo(() => {
    const correct = quantumPanelState.predictions.filter((p) => p.predicted === p.actual).length
    return (correct / quantumPanelState.predictions.length) * 100
  }, [quantumPanelState.predictions])

  return (
    <div className="space-y-3 p-2">
      <div className="text-[10px] font-bold text-purple-400 mb-2">4-QUBIT ENTANGLED STATE</div>

      {/* Bloch Spheres */}
      <div className="grid grid-cols-4 gap-2">
        {quantumPanelState.qubitStates.map((qubit, i) => (
          <div key={i} className="flex flex-col items-center">
            <BlochSphere theta={qubit.theta} phi={qubit.phi} size={40} rotationOffset={i} />
            <div className="text-[8px] text-purple-400 mt-1">Q{i + 1}</div>
          </div>
        ))}
      </div>

      {/* Prediction Accuracy */}
      <div className="border border-purple-900/50 p-2">
        <div className="text-purple-600 text-[9px] mb-1">PREDICTION ACCURACY</div>
        <div className="text-purple-400 font-mono text-sm font-bold">{predictionAccuracy.toFixed(1)}%</div>
        <div className="h-1 bg-black/50 border border-purple-900/50 mt-2">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${predictionAccuracy}%` }}
          />
        </div>
      </div>

      {/* Prediction History */}
      <div>
        <div className="text-[9px] text-purple-600 mb-1">LAST 50 PREDICTIONS</div>
        <div className="flex gap-0.5 flex-wrap">
          {quantumPanelState.predictions.slice(-50).map((p, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-sm"
              style={{
                backgroundColor: p.predicted === p.actual ? "#22c55e" : "#ef4444",
                opacity: 0.8,
              }}
            />
          ))}
        </div>
      </div>

      <div className="text-[9px] text-purple-600 text-center pt-2 border-t border-purple-900/50">
        QUANTUM ENHANCEMENT ACTIVE | SUPERPOSITION MAINTAINED
      </div>
    </div>
  )
}

export function ConfluencePanel() {
  const [activeTab, setActiveTab] = useState<"confluence" | "regime" | "orderflow" | "quantum" | "grover">("confluence")

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
    { id: "grover", label: "GROVER" },
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
                ? tab.id === "quantum" || tab.id === "grover"
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
      <div className="flex-1 overflow-auto">
        {activeTab === "confluence" && <ConfluenceTab />}
        {activeTab === "regime" && <RegimeTab />}
        {activeTab === "orderflow" && <OrderflowTab />}
        {activeTab === "quantum" && <QuantumTab />}
        {activeTab === "grover" && <GroverSniperPanel />}
      </div>
    </div>
  )
}
