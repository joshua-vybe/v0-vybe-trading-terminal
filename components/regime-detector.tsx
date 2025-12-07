"use client"

import { useState, useEffect } from "react"

interface RegimeData {
  composite_score: number
  hmm_regime: number
  hmm_prob: number
  entropy: number
  elo_rating: number
  days_since_break: number
  trade_allowed: boolean
  full_size_allowed: boolean
}

interface TimeframeRegime {
  tf: string
  data: RegimeData
}

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"]

const HMM_REGIMES = ["BULL", "BEAR", "CHOP", "HVOL"]
const REGIME_COLORS = {
  BULL: "#22c55e",
  BEAR: "#ef4444",
  CHOP: "#facc15",
  HVOL: "#a855f7",
}

// Simulated regime data - will be replaced with backend API calls
function generateMockRegimeData(): RegimeData {
  const hmmRegime = Math.floor(Math.random() * 4)
  const hmmProb = 0.5 + Math.random() * 0.45
  const entropy = Math.random() * 1.2
  const eloRating = 800 + Math.random() * 600
  const daysSinceBreak = Math.floor(Math.random() * 30)

  // Calculate component scores
  const hmmScore = hmmRegime === 0 ? hmmProb : 0 // Bull probability
  const calmScore = entropy < 0.6 ? (0.6 - entropy) / 0.6 : 0
  const eloScore = Math.min((eloRating - 1000) / 1000, 1) * (eloRating > 1000 ? 1 : 0)
  const breakoutScore = daysSinceBreak <= 10 ? 1 : Math.max(0.6, 1 - (daysSinceBreak - 10) * 0.04)

  const compositeScore = (0.4 * hmmScore + 0.25 * calmScore + 0.2 * eloScore + 0.15 * breakoutScore) * 100

  return {
    composite_score: Math.max(0, Math.min(100, compositeScore)),
    hmm_regime: hmmRegime,
    hmm_prob: hmmProb,
    entropy,
    elo_rating: eloRating,
    days_since_break: daysSinceBreak,
    trade_allowed: compositeScore >= 70,
    full_size_allowed: compositeScore >= 80,
  }
}

export function RegimeDetector() {
  const [regimes, setRegimes] = useState<TimeframeRegime[]>([])

  useEffect(() => {
    // Initial data
    const initial = TIMEFRAMES.map((tf) => ({
      tf,
      data: generateMockRegimeData(),
    }))
    setRegimes(initial)

    // Live updates every 2 seconds
    const interval = setInterval(() => {
      setRegimes((prev) =>
        prev.map((r) => ({
          ...r,
          data: {
            ...r.data,
            // Small random walk on composite score
            composite_score: Math.max(0, Math.min(100, r.data.composite_score + (Math.random() - 0.5) * 5)),
            hmm_prob: Math.max(0.5, Math.min(0.95, r.data.hmm_prob + (Math.random() - 0.5) * 0.05)),
            entropy: Math.max(0, Math.min(1.2, r.data.entropy + (Math.random() - 0.5) * 0.1)),
            elo_rating: Math.max(800, Math.min(1400, r.data.elo_rating + (Math.random() - 0.5) * 20)),
          },
        })),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e" // Green - full size
    if (score >= 70) return "#facc15" // Yellow - trade allowed
    if (score >= 50) return "#f97316" // Orange - caution
    return "#ef4444" // Red - no trade
  }

  const getRegimeLabel = (regime: number) => HMM_REGIMES[regime] || "UNK"
  const getRegimeColor = (regime: number) => REGIME_COLORS[HMM_REGIMES[regime] as keyof typeof REGIME_COLORS] || "#888"

  // Find the primary regime (highest timeframe with trade_allowed)
  const primaryRegime = regimes.find((r) => r.data.trade_allowed) || regimes[0]

  return (
    <div className="neon-border glass-panel p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] text-cyan-500 tracking-wider">REGIME DETECTOR</div>
        <div className="flex items-center gap-2">
          {primaryRegime?.data.full_size_allowed && (
            <span className="px-1.5 py-0.5 text-[9px] bg-green-500/20 text-green-400 border border-green-500/50">
              FULL SIZE
            </span>
          )}
          {primaryRegime?.data.trade_allowed && !primaryRegime?.data.full_size_allowed && (
            <span className="px-1.5 py-0.5 text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
              REDUCED
            </span>
          )}
          {!primaryRegime?.data.trade_allowed && (
            <span className="px-1.5 py-0.5 text-[9px] bg-red-500/20 text-red-400 border border-red-500/50">
              NO TRADE
            </span>
          )}
        </div>
      </div>

      {/* Composite Score Bar */}
      {primaryRegime && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-cyan-600">COMPOSITE</span>
            <span className="font-bold font-mono" style={{ color: getScoreColor(primaryRegime.data.composite_score) }}>
              {primaryRegime.data.composite_score.toFixed(1)}
            </span>
          </div>
          <div className="h-2 bg-black/50 border border-cyan-900/50 overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${primaryRegime.data.composite_score}%`,
                backgroundColor: getScoreColor(primaryRegime.data.composite_score),
                boxShadow: `0 0 8px ${getScoreColor(primaryRegime.data.composite_score)}`,
              }}
            />
          </div>
          <div className="flex justify-between text-[8px] text-cyan-800 mt-0.5">
            <span>0</span>
            <span className="text-yellow-600">70</span>
            <span className="text-green-600">80</span>
            <span>100</span>
          </div>
        </div>
      )}

      {/* Component Weights */}
      <div className="grid grid-cols-4 gap-1 mb-3 text-[9px]">
        <div className="text-center">
          <div className="text-purple-400">HMM</div>
          <div className="text-cyan-700">40%</div>
        </div>
        <div className="text-center">
          <div className="text-blue-400">ENTROPY</div>
          <div className="text-cyan-700">25%</div>
        </div>
        <div className="text-center">
          <div className="text-orange-400">ELO</div>
          <div className="text-cyan-700">20%</div>
        </div>
        <div className="text-center">
          <div className="text-pink-400">BREAK</div>
          <div className="text-cyan-700">15%</div>
        </div>
      </div>

      {/* Timeframe Grid */}
      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-1 text-[9px] text-cyan-700 border-b border-cyan-900/30 pb-1">
          <div>TF</div>
          <div>SCORE</div>
          <div>HMM</div>
          <div>ENT</div>
          <div>ELO</div>
          <div>BRK</div>
          <div>SIG</div>
        </div>

        {regimes.map(({ tf, data }) => (
          <div key={tf} className="grid grid-cols-7 gap-1 text-[10px] font-mono py-0.5 border-b border-cyan-900/20">
            <div className="text-cyan-400 font-bold">{tf}</div>
            <div style={{ color: getScoreColor(data.composite_score) }}>{data.composite_score.toFixed(0)}</div>
            <div className="font-bold" style={{ color: getRegimeColor(data.hmm_regime) }}>
              {getRegimeLabel(data.hmm_regime).slice(0, 4)}
            </div>
            <div className={data.entropy < 0.6 ? "text-green-400" : "text-red-400"}>{data.entropy.toFixed(2)}</div>
            <div className={data.elo_rating > 1000 ? "text-green-400" : "text-cyan-600"}>
              {data.elo_rating.toFixed(0)}
            </div>
            <div className="text-pink-400">{data.days_since_break}d</div>
            <div>
              {data.full_size_allowed ? (
                <span className="text-green-400">●●</span>
              ) : data.trade_allowed ? (
                <span className="text-yellow-400">●○</span>
              ) : (
                <span className="text-red-400">○○</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 pt-2 border-t border-cyan-900/30 grid grid-cols-4 gap-1 text-[8px]">
        <div className="flex items-center gap-1">
          <span style={{ color: REGIME_COLORS.BULL }}>●</span> BULL
        </div>
        <div className="flex items-center gap-1">
          <span style={{ color: REGIME_COLORS.BEAR }}>●</span> BEAR
        </div>
        <div className="flex items-center gap-1">
          <span style={{ color: REGIME_COLORS.CHOP }}>●</span> CHOP
        </div>
        <div className="flex items-center gap-1">
          <span style={{ color: REGIME_COLORS.HVOL }}>●</span> HVOL
        </div>
      </div>
    </div>
  )
}
