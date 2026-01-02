"use client"

import { useEffect, useState } from "react"
import { Activity, Target, Zap, TrendingUp } from "lucide-react"

interface GroverState {
  probability: number
  signal: "BUY" | "SELL" | "NEUTRAL"
  confidence: number
  targetPrice: number
  imbalance: number
  volumeFactor: number
  iterations: number
  timestamp: number
}

interface GroverSignal {
  type: "BUY" | "SELL"
  probability: number
  confidence: number
  targetPrice: number
  currentPrice: number
  expectedMove: number
  timestamp: number
}

export function GroverSniperPanel() {
  const [currentState, setCurrentState] = useState<GroverState>({
    probability: 0.67,
    signal: "NEUTRAL",
    confidence: 0.67,
    targetPrice: 43298.5,
    imbalance: 1.87,
    volumeFactor: 1.43,
    iterations: 2, // Changed iterations from 3 to 2
    timestamp: Date.now(),
  })

  const [recentSignals, setRecentSignals] = useState<GroverSignal[]>([
    {
      type: "BUY",
      probability: 0.83,
      confidence: 0.83,
      targetPrice: 43150.0,
      currentPrice: 43098.5,
      expectedMove: 51.5,
      timestamp: Date.now() - 180000,
    },
    {
      type: "SELL",
      probability: 0.79,
      confidence: 0.79,
      targetPrice: 43420.0,
      currentPrice: 43465.2,
      expectedMove: -45.2,
      timestamp: Date.now() - 420000,
    },
  ])

  const [stateVector, setStateVector] = useState<number[]>([0.12, 0.18, 0.34, 0.67, 0.89, 0.92, 0.78, 0.45, 0.23, 0.11])

  // Simulate real-time updates from Rust backend
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentState((prev) => ({
        ...prev,
        probability: Math.max(0, Math.min(1, prev.probability + (Math.random() - 0.5) * 0.1)),
        confidence: Math.max(0, Math.min(1, prev.confidence + (Math.random() - 0.5) * 0.08)),
        imbalance: Math.max(1.0, Math.min(3.0, prev.imbalance + (Math.random() - 0.5) * 0.2)),
        volumeFactor: Math.max(1.0, Math.min(2.0, prev.volumeFactor + (Math.random() - 0.5) * 0.15)),
        timestamp: Date.now(),
      }))

      setStateVector((prev) => prev.map((val) => Math.max(0, Math.min(1, val + (Math.random() - 0.5) * 0.2))))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Determine signal based on probability
  useEffect(() => {
    if (currentState.probability > 0.75) {
      setCurrentState((prev) => ({
        ...prev,
        signal: prev.imbalance > 1.5 ? "BUY" : "SELL",
      }))
    } else {
      setCurrentState((prev) => ({ ...prev, signal: "NEUTRAL" }))
    }
  }, [currentState.probability, currentState.imbalance])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY":
        return "text-green-400"
      case "SELL":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getProbabilityColor = (prob: number) => {
    if (prob > 0.75) return "text-purple-400"
    if (prob > 0.5) return "text-cyan-400"
    return "text-gray-400"
  }

  return (
    <div className="h-full flex flex-col gap-3 p-2 overflow-auto">
      {/* Current State */}
      <div className="border border-purple-500/30 bg-purple-500/5 p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-400">QUANTUM STATE</span>
          </div>
          <div className="text-[10px] text-gray-500">{currentState.iterations} iterations</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-gray-500 mb-1">SIGNAL</div>
            <div className={`text-lg font-bold ${getSignalColor(currentState.signal)}`}>{currentState.signal}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-1">PROBABILITY</div>
            <div className={`text-lg font-bold ${getProbabilityColor(currentState.probability)}`}>
              {(currentState.probability * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-1">CONFIDENCE</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${currentState.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-cyan-400 font-mono">{(currentState.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-1">TARGET PRICE</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">${currentState.targetPrice.toFixed(2)}</div>
          </div>
        </div>

        {/* Amplitude Visualization */}
        <div className="mt-3 pt-3 border-t border-purple-500/20">
          <div className="text-[10px] text-gray-500 mb-2">AMPLITUDE DISTRIBUTION</div>
          <div className="flex gap-1 items-end h-16">
            {stateVector.map((amp, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t transition-all duration-300"
                style={{ height: `${amp * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Market Conditions */}
      <div className="border border-cyan-500/30 bg-cyan-500/5 p-3">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-cyan-400">MARKET CONDITIONS</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500">ORDERBOOK IMBALANCE</span>
            <span className="text-xs font-mono text-cyan-400">{currentState.imbalance.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500">VOLUME FACTOR</span>
            <span className="text-xs font-mono text-cyan-400">{currentState.volumeFactor.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500">GROVER ITERATIONS</span>
            <span className="text-xs font-mono text-purple-400">{currentState.iterations}</span>
          </div>
        </div>
      </div>

      {/* Recent Signals */}
      <div className="border border-gray-700 p-3">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">RECENT SNIPER SIGNALS</span>
        </div>

        <div className="space-y-2">
          {recentSignals.map((signal, i) => (
            <div key={i} className="border border-gray-700/50 p-2 rounded hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`text-xs font-bold ${signal.type === "BUY" ? "text-green-400" : "text-red-400"}`}>
                    {signal.type}
                  </div>
                  <div className="text-[10px] text-gray-500">{new Date(signal.timestamp).toLocaleTimeString()}</div>
                </div>
                <div className="text-xs font-mono text-purple-400">{(signal.probability * 100).toFixed(0)}%</div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <span className="text-gray-500">Entry: </span>
                  <span className="text-cyan-400 font-mono">${signal.currentPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Target: </span>
                  <span className="text-cyan-400 font-mono">${signal.targetPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Move: </span>
                  <span className={`font-mono ${signal.expectedMove > 0 ? "text-green-400" : "text-red-400"}`}>
                    {signal.expectedMove > 0 ? "+" : ""}
                    {signal.expectedMove.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="border border-gray-700 p-3">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-xs font-bold text-green-400">PERFORMANCE</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-[10px] text-gray-500 mb-1">WIN RATE</div>
            <div className="text-sm font-bold text-green-400">73.2%</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-1">AVG LATENCY</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">6.4ms</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-1">SIGNALS TODAY</div>
            <div className="text-sm font-bold text-purple-400">47</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-1">AVG MOVE</div>
            <div className="text-sm font-bold text-yellow-400">$52.3</div>
          </div>
        </div>
      </div>
    </div>
  )
}
