"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"

// 7-Layer Adaptive Confluence Stack (2025 Ultimate)
export const SIGNAL_LAYERS = [
  { id: "vp", name: "Volume Profile", shortName: "VP", baseWeight: 30, color: "#22c55e", dominates: "Ranges" },
  {
    id: "breakout",
    name: "True Breakout Conf",
    shortName: "BRK",
    baseWeight: 30,
    color: "#f97316",
    dominates: "Explosive moves",
  },
  {
    id: "cvd",
    name: "CVD Divergence",
    shortName: "CVD",
    baseWeight: 25,
    color: "#3b82f6",
    dominates: "Hidden distribution",
  },
  {
    id: "ob_fvg",
    name: "Order Block/FVG",
    shortName: "OB",
    baseWeight: 20,
    color: "#a855f7",
    dominates: "Institutional footprints",
  },
  {
    id: "regime",
    name: "Regime Composite",
    shortName: "REG",
    baseWeight: 20,
    color: "#06b6d4",
    dominates: "Macro filter",
  },
  {
    id: "htf",
    name: "HTF Alignment",
    shortName: "HTF",
    baseWeight: 15,
    color: "#ec4899",
    dominates: "Trend continuation",
  },
  {
    id: "vqc",
    name: "VQC-Lite Quantum",
    shortName: "VQC",
    baseWeight: 15,
    color: "#8b5cf6",
    dominates: "Liquidation cascades & gamma",
  },
]

export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w"

export const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "30m", label: "30m" },
  { value: "1h", label: "1H" },
  { value: "4h", label: "4H" },
  { value: "1d", label: "1D" },
  { value: "1w", label: "1W" },
]

const QUANTUM_CLASSIFICATIONS = ["TRENDING", "RANGING", "CASCADE"] as const
export type QuantumClassification = (typeof QUANTUM_CLASSIFICATIONS)[number]

export interface SignalData {
  vp: number
  cvd: number
  breakout: number
  ob_fvg: number
  regime: number
  htf: number
  vqc: number
}

export interface LayerAccuracy {
  id: string
  accuracy: number
  weight: number // Dynamic weight after accuracy adjustment
}

export interface QuantumState {
  classification: QuantumClassification
  probabilities: Record<QuantumClassification, number>
  confidence: number
}

interface ConfluenceContextType {
  timeframe: Timeframe
  setTimeframe: (tf: Timeframe) => void
  signals: SignalData
  layerAccuracies: LayerAccuracy[]
  totalConfluence: number
  quantumState: QuantumState
  currentAction: string
  isQuantumEnhanced: boolean
}

const ConfluenceContext = createContext<ConfluenceContextType | undefined>(undefined)

// Timeframe-specific base signals (different timeframes have different characteristics)
const TIMEFRAME_SIGNAL_BIAS: Record<Timeframe, Partial<SignalData>> = {
  "1m": { vp: 65, breakout: 80, cvd: 70, ob_fvg: 60, regime: 50, htf: 40, vqc: 75 },
  "5m": { vp: 75, breakout: 85, cvd: 75, ob_fvg: 70, regime: 60, htf: 55, vqc: 80 },
  "15m": { vp: 80, breakout: 82, cvd: 78, ob_fvg: 75, regime: 70, htf: 65, vqc: 82 },
  "30m": { vp: 82, breakout: 78, cvd: 80, ob_fvg: 78, regime: 75, htf: 70, vqc: 78 },
  "1h": { vp: 85, breakout: 75, cvd: 82, ob_fvg: 80, regime: 80, htf: 78, vqc: 85 },
  "4h": { vp: 88, breakout: 70, cvd: 85, ob_fvg: 85, regime: 85, htf: 85, vqc: 88 },
  "1d": { vp: 90, breakout: 65, cvd: 88, ob_fvg: 88, regime: 90, htf: 92, vqc: 90 },
  "1w": { vp: 92, breakout: 60, cvd: 90, ob_fvg: 90, regime: 92, htf: 95, vqc: 92 },
}

// Actions based on dominant signal
const ACTIONS = [
  "Momentum Breakout",
  "Mean Reversion",
  "Trend Continuation",
  "Range Scalp",
  "Liquidity Sweep",
  "Cascade Entry",
  "Gamma Squeeze",
  "Waiting...",
]

export function ConfluenceProvider({ children }: { children: ReactNode }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("5m")
  const [signals, setSignals] = useState<SignalData>({
    vp: 85,
    cvd: 72,
    breakout: 90,
    ob_fvg: 68,
    regime: 78,
    htf: 82,
    vqc: 85,
  })

  const [layerAccuracies, setLayerAccuracies] = useState<LayerAccuracy[]>(
    SIGNAL_LAYERS.map((layer) => ({
      id: layer.id,
      accuracy: 75 + Math.random() * 20,
      weight: layer.baseWeight,
    })),
  )

  const [quantumState, setQuantumState] = useState<QuantumState>({
    classification: "TRENDING",
    probabilities: { TRENDING: 65, RANGING: 25, CASCADE: 10 },
    confidence: 85,
  })

  const [currentAction, setCurrentAction] = useState("Momentum Breakout")

  // Update signals when timeframe changes
  useEffect(() => {
    const bias = TIMEFRAME_SIGNAL_BIAS[timeframe]
    setSignals({
      vp: bias.vp! + (Math.random() - 0.5) * 10,
      cvd: bias.cvd! + (Math.random() - 0.5) * 10,
      breakout: bias.breakout! + (Math.random() - 0.5) * 10,
      ob_fvg: bias.ob_fvg! + (Math.random() - 0.5) * 10,
      regime: bias.regime! + (Math.random() - 0.5) * 10,
      htf: bias.htf! + (Math.random() - 0.5) * 10,
      vqc: bias.vqc! + (Math.random() - 0.5) * 10,
    })
  }, [timeframe])

  // Live signal updates
  useEffect(() => {
    const interval = setInterval(() => {
      const bias = TIMEFRAME_SIGNAL_BIAS[timeframe]

      setSignals((prev) => ({
        vp: Math.max(0, Math.min(100, prev.vp + (Math.random() - 0.5) * 6 + (bias.vp! - prev.vp) * 0.1)),
        cvd: Math.max(0, Math.min(100, prev.cvd + (Math.random() - 0.5) * 8 + (bias.cvd! - prev.cvd) * 0.1)),
        breakout: Math.max(
          0,
          Math.min(100, prev.breakout + (Math.random() - 0.5) * 5 + (bias.breakout! - prev.breakout) * 0.1),
        ),
        ob_fvg: Math.max(
          0,
          Math.min(100, prev.ob_fvg + (Math.random() - 0.5) * 6 + (bias.ob_fvg! - prev.ob_fvg) * 0.1),
        ),
        regime: Math.max(
          0,
          Math.min(100, prev.regime + (Math.random() - 0.5) * 4 + (bias.regime! - prev.regime) * 0.1),
        ),
        htf: Math.max(0, Math.min(100, prev.htf + (Math.random() - 0.5) * 3 + (bias.htf! - prev.htf) * 0.1)),
        vqc: Math.max(0, Math.min(100, prev.vqc + (Math.random() - 0.5) * 7 + (bias.vqc! - prev.vqc) * 0.1)),
      }))

      // Update accuracies (slowly drift)
      setLayerAccuracies((prev) =>
        prev.map((layer) => {
          const baseLayer = SIGNAL_LAYERS.find((l) => l.id === layer.id)!
          const newAccuracy = Math.max(60, Math.min(98, layer.accuracy + (Math.random() - 0.5) * 2))
          // Dynamic weight: base * (0.8 to 1.2) based on accuracy
          const accuracyMultiplier = 0.8 + (newAccuracy / 100) * 0.4
          return {
            ...layer,
            accuracy: newAccuracy,
            weight: Math.round(baseLayer.baseWeight * accuracyMultiplier * 10) / 10,
          }
        }),
      )

      // Update quantum state
      const classifications: QuantumClassification[] = ["TRENDING", "RANGING", "CASCADE"]
      const probs = {
        TRENDING: 30 + Math.random() * 50,
        RANGING: 20 + Math.random() * 40,
        CASCADE: 5 + Math.random() * 25,
      }
      const total = probs.TRENDING + probs.RANGING + probs.CASCADE
      probs.TRENDING = (probs.TRENDING / total) * 100
      probs.RANGING = (probs.RANGING / total) * 100
      probs.CASCADE = (probs.CASCADE / total) * 100

      const dominant = classifications.reduce((a, b) => (probs[a] > probs[b] ? a : b))

      setQuantumState({
        classification: dominant,
        probabilities: probs,
        confidence: Math.max(probs.TRENDING, probs.RANGING, probs.CASCADE),
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [timeframe])

  // Update action based on signals
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        // Determine action based on dominant signal
        const signalValues = [
          { name: "Momentum Breakout", value: signals.breakout },
          { name: "Mean Reversion", value: 100 - signals.breakout },
          { name: "Trend Continuation", value: signals.htf },
          { name: "Range Scalp", value: signals.vp },
          { name: "Liquidity Sweep", value: signals.ob_fvg },
          { name: "Cascade Entry", value: quantumState.classification === "CASCADE" ? 90 : 20 },
          { name: "Gamma Squeeze", value: signals.vqc },
        ]

        // Weighted random selection favoring higher values
        const totalWeight = signalValues.reduce((sum, s) => sum + s.value, 0)
        let random = Math.random() * totalWeight
        for (const signal of signalValues) {
          random -= signal.value
          if (random <= 0) {
            setCurrentAction(signal.name)
            break
          }
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [signals, quantumState])

  // Calculate total confluence with dynamic weights
  const totalConfluence = useMemo(() => {
    const signalArray = [
      { id: "vp", value: signals.vp },
      { id: "breakout", value: signals.breakout },
      { id: "cvd", value: signals.cvd },
      { id: "ob_fvg", value: signals.ob_fvg },
      { id: "regime", value: signals.regime },
      { id: "htf", value: signals.htf },
      { id: "vqc", value: signals.vqc },
    ]

    let weightedSum = 0
    let totalWeight = 0

    signalArray.forEach((signal) => {
      const layerAcc = layerAccuracies.find((l) => l.id === signal.id)
      const weight = layerAcc?.weight || SIGNAL_LAYERS.find((l) => l.id === signal.id)?.baseWeight || 15
      weightedSum += signal.value * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }, [signals, layerAccuracies])

  const isQuantumEnhanced = totalConfluence >= 90

  return (
    <ConfluenceContext.Provider
      value={{
        timeframe,
        setTimeframe,
        signals,
        layerAccuracies,
        totalConfluence,
        quantumState,
        currentAction,
        isQuantumEnhanced,
      }}
    >
      {children}
    </ConfluenceContext.Provider>
  )
}

export function useConfluence() {
  const context = useContext(ConfluenceContext)
  if (!context) {
    throw new Error("useConfluence must be used within a ConfluenceProvider")
  }
  return context
}
