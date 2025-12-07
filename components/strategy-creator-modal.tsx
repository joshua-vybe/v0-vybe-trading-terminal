"use client"
import { useState, useEffect, useCallback } from "react"
import { GlitchText } from "./glitch-text"
import { StatusIndicator } from "./status-indicator"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts"

type Step =
  | "basic"
  | "timeframes"
  | "entry"
  | "exit"
  | "risk"
  | "execution"
  | "processing"
  | "preview"
  | "backtest"
  | "deploy"

interface StrategyConfig {
  // Basic Info
  name: string
  description: string
  pair: string
  strategyType: "SCALP" | "SWING" | "GRID" | "MEAN_REV" | "MOMENTUM" | "BREAKOUT" | "CUSTOM"

  // Timeframes
  primaryTimeframe: string
  secondaryTimeframes: string[]
  useRegimeFilter: boolean
  regimeThreshold: number

  // Entry Rules
  entryIndicators: { name: string; params: Record<string, number>; condition: string }[]
  entryLogic: "AND" | "OR"
  entryConfirmations: number

  // Exit Rules
  takeProfitType: "FIXED" | "TRAILING" | "SCALED" | "INDICATOR"
  takeProfitValue: number
  stopLossType: "FIXED" | "ATR" | "STRUCTURE"
  stopLossValue: number
  trailingStopEnabled: boolean
  trailingStopValue: number
  timeBasedExit: boolean
  maxHoldingPeriod: number

  // Risk Management
  positionSizeType: "FIXED" | "PERCENT_EQUITY" | "KELLY" | "VOLATILITY"
  positionSizeValue: number
  maxLeverage: number
  maxDrawdown: number
  maxDailyLoss: number
  maxOpenPositions: number
  correlationLimit: number

  // Execution
  orderType: "MARKET" | "LIMIT" | "TWAP" | "ICEBERG"
  slippageTolerance: number
  partialFillsEnabled: boolean
  retryOnFail: boolean
  maxRetries: number
}

interface BacktestResult {
  totalTrades: number
  winRate: number
  profitFactor: number
  sharpe: number
  sortino: number
  maxDrawdown: number
  totalReturn: number
  avgWin: number
  avgLoss: number
  calmar: number
  expectancy: number
  avgHoldTime: string
  equityCurve: { time: number; value: number }[]
}

interface StrategyCreatorModalProps {
  isOpen: boolean
  onClose: () => void
  onDeploy: (strategy: StrategyConfig) => void
}

const defaultConfig: StrategyConfig = {
  name: "",
  description: "",
  pair: "BTC-USDC",
  strategyType: "CUSTOM",
  primaryTimeframe: "1H",
  secondaryTimeframes: [],
  useRegimeFilter: true,
  regimeThreshold: 50,
  entryIndicators: [],
  entryLogic: "AND",
  entryConfirmations: 1,
  takeProfitType: "FIXED",
  takeProfitValue: 3,
  stopLossType: "FIXED",
  stopLossValue: 1.5,
  trailingStopEnabled: false,
  trailingStopValue: 1,
  timeBasedExit: false,
  maxHoldingPeriod: 24,
  positionSizeType: "PERCENT_EQUITY",
  positionSizeValue: 2,
  maxLeverage: 10,
  maxDrawdown: 15,
  maxDailyLoss: 5,
  maxOpenPositions: 3,
  correlationLimit: 0.7,
  orderType: "LIMIT",
  slippageTolerance: 0.1,
  partialFillsEnabled: true,
  retryOnFail: true,
  maxRetries: 3,
}

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"]
const PAIRS = ["BTC-USDC", "ETH-USDC", "SOL-USDC", "ARB-USDC", "OP-USDC"]
const STRATEGY_TYPES = ["SCALP", "SWING", "GRID", "MEAN_REV", "MOMENTUM", "BREAKOUT", "CUSTOM"] as const

const INDICATORS = [
  { name: "RSI", defaultParams: { period: 14, overbought: 70, oversold: 30 } },
  { name: "MACD", defaultParams: { fast: 12, slow: 26, signal: 9 } },
  { name: "Bollinger Bands", defaultParams: { period: 20, stdDev: 2 } },
  { name: "EMA", defaultParams: { period: 20 } },
  { name: "SMA", defaultParams: { period: 50 } },
  { name: "ATR", defaultParams: { period: 14 } },
  { name: "VWAP", defaultParams: { period: 1 } },
  { name: "Stochastic", defaultParams: { kPeriod: 14, dPeriod: 3 } },
  { name: "ADX", defaultParams: { period: 14, threshold: 25 } },
  { name: "OBV", defaultParams: { period: 20 } },
]

const CONDITIONS = [
  "crosses above",
  "crosses below",
  "is above",
  "is below",
  "increases",
  "decreases",
  "diverges bullish",
  "diverges bearish",
]

export function StrategyCreatorModal({ isOpen, onClose, onDeploy }: StrategyCreatorModalProps) {
  const [step, setStep] = useState<Step>("basic")
  const [config, setConfig] = useState<StrategyConfig>(defaultConfig)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState("")
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)

  const steps: Step[] = [
    "basic",
    "timeframes",
    "entry",
    "exit",
    "risk",
    "execution",
    "processing",
    "preview",
    "backtest",
    "deploy",
  ]
  const stepIndex = steps.indexOf(step)

  const stepLabels: Record<Step, string> = {
    basic: "BASIC INFO",
    timeframes: "TIMEFRAMES",
    entry: "ENTRY RULES",
    exit: "EXIT RULES",
    risk: "RISK MGMT",
    execution: "EXECUTION",
    processing: "PROCESSING",
    preview: "PREVIEW",
    backtest: "BACKTEST",
    deploy: "DEPLOY",
  }

  const updateConfig = <K extends keyof StrategyConfig>(key: K, value: StrategyConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const addIndicator = () => {
    const newIndicator = {
      name: "RSI",
      params: { ...INDICATORS[0].defaultParams },
      condition: "crosses above",
    }
    updateConfig("entryIndicators", [...config.entryIndicators, newIndicator])
  }

  const removeIndicator = (index: number) => {
    updateConfig(
      "entryIndicators",
      config.entryIndicators.filter((_, i) => i !== index),
    )
  }

  const updateIndicator = (index: number, field: string, value: any) => {
    const updated = [...config.entryIndicators]
    if (field === "name") {
      const indicator = INDICATORS.find((i) => i.name === value)
      updated[index] = { ...updated[index], name: value, params: indicator?.defaultParams || {} }
    } else if (field === "condition") {
      updated[index] = { ...updated[index], condition: value }
    } else {
      updated[index] = { ...updated[index], params: { ...updated[index].params, [field]: value } }
    }
    updateConfig("entryIndicators", updated)
  }

  const toggleSecondaryTimeframe = (tf: string) => {
    if (config.secondaryTimeframes.includes(tf)) {
      updateConfig(
        "secondaryTimeframes",
        config.secondaryTimeframes.filter((t) => t !== tf),
      )
    } else {
      updateConfig("secondaryTimeframes", [...config.secondaryTimeframes, tf])
    }
  }

  const canProceed = (): boolean => {
    switch (step) {
      case "basic":
        return config.name.trim().length > 0
      case "timeframes":
        return true
      case "entry":
        return config.entryIndicators.length > 0
      case "exit":
        return config.takeProfitValue > 0 && config.stopLossValue > 0
      case "risk":
        return config.positionSizeValue > 0 && config.maxLeverage > 0
      case "execution":
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      if (step === "execution") {
        // Start AI processing
        setStep("processing")
        processStrategy()
      } else {
        setStep(steps[currentIndex + 1])
      }
    }
  }

  const prevStep = () => {
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  const processStrategy = useCallback(() => {
    setProcessingProgress(0)
    const stages = [
      "VALIDATING CONFIG",
      "PARSING INDICATORS",
      "BUILDING LOGIC TREE",
      "OPTIMIZING PARAMETERS",
      "GENERATING CODE",
      "COMPILING STRATEGY",
    ]
    let stageIndex = 0

    const interval = setInterval(() => {
      if (stageIndex < stages.length) {
        setProcessingStage(stages[stageIndex])
        setProcessingProgress(((stageIndex + 1) / stages.length) * 100)
        stageIndex++
      } else {
        clearInterval(interval)
        setStep("preview")
      }
    }, 400)
  }, [])

  const runBacktest = useCallback(() => {
    setProcessingProgress(0)
    setProcessingStage("RUNNING NAUTILUS SIMULATION")
    setStep("processing")

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          const curve: { time: number; value: number }[] = []
          let value = 10000
          for (let i = 0; i < 90; i++) {
            value += (Math.random() - 0.42) * 250
            curve.push({ time: i, value: Math.max(7500, value) })
          }
          setBacktestResult({
            totalTrades: Math.floor(Math.random() * 100) + 50,
            winRate: 58 + Math.random() * 15,
            profitFactor: 1.5 + Math.random() * 1,
            sharpe: 1.8 + Math.random() * 1.2,
            sortino: 2.2 + Math.random() * 1.5,
            maxDrawdown: 5 + Math.random() * 10,
            totalReturn: 15 + Math.random() * 25,
            avgWin: 250 + Math.random() * 200,
            avgLoss: 120 + Math.random() * 80,
            calmar: 2 + Math.random() * 2,
            expectancy: 0.3 + Math.random() * 0.5,
            avgHoldTime: `${Math.floor(Math.random() * 24) + 1}h ${Math.floor(Math.random() * 60)}m`,
            equityCurve: curve,
          })
          setStep("backtest")
          return 100
        }
        return prev + 2
      })
    }, 30)
  }, [])

  const handleDeploy = useCallback(() => {
    setStep("deploy")
    setTimeout(() => {
      onDeploy(config)
      setTimeout(() => {
        onClose()
        setStep("basic")
        setConfig(defaultConfig)
        setBacktestResult(null)
      }, 2000)
    }, 1500)
  }, [config, onDeploy, onClose])

  useEffect(() => {
    if (!isOpen) {
      setStep("basic")
      setConfig(defaultConfig)
      setBacktestResult(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/80" onClick={onClose} />
      <div
        className="fixed z-[101] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[95%] md:max-w-6xl border border-cyan-500/50 bg-black/95 flex flex-col"
        style={{ top: "70px", bottom: "40px", boxShadow: "0 0 40px rgba(0,255,255,0.2)" }}
      >
        {/* Header */}
        <div className="shrink-0 h-12 flex items-center justify-between px-4 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <StatusIndicator status="active" />
            <GlitchText text="STRATEGY ARCHITECT" className="text-sm glow-cyan" />
          </div>
          <div className="flex items-center gap-1">
            {steps.slice(0, 6).map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < stepIndex ? "bg-green-400" : i === stepIndex ? "bg-cyan-400 animate-pulse" : "bg-gray-600"
                  }`}
                />
                {i < 5 && <div className="w-4 h-px bg-gray-600 mx-0.5" />}
              </div>
            ))}
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ×
          </button>
        </div>

        {/* Step Label */}
        <div className="shrink-0 px-4 py-2 border-b border-gray-800">
          <span className="text-xs text-gray-500">STEP {stepIndex + 1}/10:</span>
          <span className="text-xs text-cyan-400 ml-2">{stepLabels[step]}</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* STEP 1: BASIC INFO */}
          {step === "basic" && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div>
                <label className="block text-xs text-gray-500 mb-1">STRATEGY NAME *</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig("name", e.target.value)}
                  placeholder="e.g., BTC_MOMENTUM_SCALPER_V1"
                  className="w-full bg-black/50 border border-gray-700 text-cyan-300 p-3 focus:outline-none focus:border-cyan-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">DESCRIPTION</label>
                <textarea
                  value={config.description}
                  onChange={(e) => updateConfig("description", e.target.value)}
                  placeholder="Describe your strategy logic and goals..."
                  rows={3}
                  className="w-full bg-black/50 border border-gray-700 text-cyan-300 p-3 resize-none focus:outline-none focus:border-cyan-500 font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">TRADING PAIR</label>
                  <select
                    value={config.pair}
                    onChange={(e) => updateConfig("pair", e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 text-cyan-300 p-3 focus:outline-none focus:border-cyan-500 font-mono text-sm"
                  >
                    {PAIRS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">STRATEGY TYPE</label>
                  <select
                    value={config.strategyType}
                    onChange={(e) => updateConfig("strategyType", e.target.value as any)}
                    className="w-full bg-black/50 border border-gray-700 text-cyan-300 p-3 focus:outline-none focus:border-cyan-500 font-mono text-sm"
                  >
                    {STRATEGY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TIMEFRAMES */}
          {step === "timeframes" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-xs text-gray-500 mb-2">PRIMARY TIMEFRAME</label>
                <div className="grid grid-cols-8 gap-2">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => updateConfig("primaryTimeframe", tf)}
                      className={`py-2 border text-xs font-mono ${
                        config.primaryTimeframe === tf
                          ? "border-cyan-400 bg-cyan-400/20 text-cyan-400"
                          : "border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">SECONDARY TIMEFRAMES (for confirmation)</label>
                <div className="grid grid-cols-8 gap-2">
                  {TIMEFRAMES.filter((tf) => tf !== config.primaryTimeframe).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => toggleSecondaryTimeframe(tf)}
                      className={`py-2 border text-xs font-mono ${
                        config.secondaryTimeframes.includes(tf)
                          ? "border-fuchsia-400 bg-fuchsia-400/20 text-fuchsia-400"
                          : "border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-gray-500">REGIME FILTER</label>
                  <button
                    type="button"
                    onClick={() => updateConfig("useRegimeFilter", !config.useRegimeFilter)}
                    className={`px-3 py-1 border text-xs font-mono ${
                      config.useRegimeFilter ? "border-green-500 text-green-400" : "border-gray-600 text-gray-500"
                    }`}
                  >
                    {config.useRegimeFilter ? "[ ON ]" : "[ OFF ]"}
                  </button>
                </div>
                {config.useRegimeFilter && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      MIN REGIME SCORE TO TRADE: {config.regimeThreshold}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={config.regimeThreshold}
                      onChange={(e) => updateConfig("regimeThreshold", Number.parseInt(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>0 (Any)</span>
                      <span>50 (Moderate)</span>
                      <span>100 (Perfect)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: ENTRY RULES */}
          {step === "entry" && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">ENTRY INDICATORS</label>
                <button
                  type="button"
                  onClick={addIndicator}
                  className="px-3 py-1 border border-cyan-500 text-cyan-400 text-xs hover:bg-cyan-500/20"
                >
                  + ADD INDICATOR
                </button>
              </div>

              {config.entryIndicators.length === 0 ? (
                <div className="border border-dashed border-gray-700 p-8 text-center">
                  <div className="text-gray-500 text-sm mb-2">No indicators added</div>
                  <div className="text-gray-600 text-xs">Click "ADD INDICATOR" to define entry conditions</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {config.entryIndicators.map((ind, i) => (
                    <div key={i} className="border border-gray-700 p-3 bg-gray-900/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">#{i + 1}</span>
                        <select
                          value={ind.name}
                          onChange={(e) => updateIndicator(i, "name", e.target.value)}
                          className="bg-black border border-gray-700 text-cyan-300 px-2 py-1 text-xs"
                        >
                          {INDICATORS.map((indicator) => (
                            <option key={indicator.name} value={indicator.name}>
                              {indicator.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={ind.condition}
                          onChange={(e) => updateIndicator(i, "condition", e.target.value)}
                          className="bg-black border border-gray-700 text-fuchsia-300 px-2 py-1 text-xs"
                        >
                          {CONDITIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeIndicator(i)}
                          className="ml-auto text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(ind.params).map(([param, value]) => (
                          <div key={param} className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">{param}:</span>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => updateIndicator(i, param, Number.parseInt(e.target.value))}
                              className="w-16 bg-black border border-gray-700 text-cyan-300 px-2 py-1 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {config.entryIndicators.length > 1 && (
                <div className="flex items-center gap-4">
                  <label className="text-xs text-gray-500">LOGIC:</label>
                  <button
                    type="button"
                    onClick={() => updateConfig("entryLogic", "AND")}
                    className={`px-3 py-1 border text-xs ${
                      config.entryLogic === "AND" ? "border-cyan-400 text-cyan-400" : "border-gray-700 text-gray-500"
                    }`}
                  >
                    AND (All must be true)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConfig("entryLogic", "OR")}
                    className={`px-3 py-1 border text-xs ${
                      config.entryLogic === "OR" ? "border-cyan-400 text-cyan-400" : "border-gray-700 text-gray-500"
                    }`}
                  >
                    OR (Any can be true)
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  CONFIRMATIONS REQUIRED: {config.entryConfirmations}
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={config.entryConfirmations}
                  onChange={(e) => updateConfig("entryConfirmations", Number.parseInt(e.target.value))}
                  className="w-full max-w-xs accent-cyan-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: EXIT RULES */}
          {step === "exit" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-green-500/30 p-4">
                  <div className="text-sm text-green-500 mb-3">TAKE PROFIT</div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {(["FIXED", "TRAILING", "SCALED", "INDICATOR"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateConfig("takeProfitType", type)}
                          className={`py-2 border text-xs ${
                            config.takeProfitType === type
                              ? "border-green-500 text-green-400"
                              : "border-gray-700 text-gray-500"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {config.takeProfitType === "FIXED" ? "TAKE PROFIT %" : "TP MULTIPLIER"}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.takeProfitValue}
                        onChange={(e) => updateConfig("takeProfitValue", Number.parseFloat(e.target.value))}
                        className="w-full bg-black border border-gray-700 text-green-300 p-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-red-500/30 p-4">
                  <div className="text-sm text-red-500 mb-3">STOP LOSS</div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {(["FIXED", "ATR", "STRUCTURE"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateConfig("stopLossType", type)}
                          className={`py-2 border text-xs ${
                            config.stopLossType === type
                              ? "border-red-500 text-red-400"
                              : "border-gray-700 text-gray-500"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {config.stopLossType === "FIXED"
                          ? "STOP LOSS %"
                          : config.stopLossType === "ATR"
                            ? "ATR MULTIPLIER"
                            : "LOOKBACK PERIODS"}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.stopLossValue}
                        onChange={(e) => updateConfig("stopLossValue", Number.parseFloat(e.target.value))}
                        className="w-full bg-black border border-gray-700 text-red-300 p-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-gray-500">TRAILING STOP</label>
                  <button
                    type="button"
                    onClick={() => updateConfig("trailingStopEnabled", !config.trailingStopEnabled)}
                    className={`px-3 py-1 border text-xs ${
                      config.trailingStopEnabled ? "border-green-500 text-green-400" : "border-gray-600 text-gray-500"
                    }`}
                  >
                    {config.trailingStopEnabled ? "[ ON ]" : "[ OFF ]"}
                  </button>
                </div>
                {config.trailingStopEnabled && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">TRAIL DISTANCE %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.trailingStopValue}
                      onChange={(e) => updateConfig("trailingStopValue", Number.parseFloat(e.target.value))}
                      className="w-full bg-black border border-gray-700 text-cyan-300 p-2 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-gray-500">TIME-BASED EXIT</label>
                  <button
                    type="button"
                    onClick={() => updateConfig("timeBasedExit", !config.timeBasedExit)}
                    className={`px-3 py-1 border text-xs ${
                      config.timeBasedExit ? "border-green-500 text-green-400" : "border-gray-600 text-gray-500"
                    }`}
                  >
                    {config.timeBasedExit ? "[ ON ]" : "[ OFF ]"}
                  </button>
                </div>
                {config.timeBasedExit && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">MAX HOLDING PERIOD (hours)</label>
                    <input
                      type="number"
                      value={config.maxHoldingPeriod}
                      onChange={(e) => updateConfig("maxHoldingPeriod", Number.parseInt(e.target.value))}
                      className="w-full bg-black border border-gray-700 text-cyan-300 p-2 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: RISK MANAGEMENT */}
          {step === "risk" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="border border-fuchsia-500/30 p-4">
                <div className="text-sm text-fuchsia-400 mb-3">POSITION SIZING</div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {(["FIXED", "PERCENT_EQUITY", "KELLY", "VOLATILITY"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateConfig("positionSizeType", type)}
                      className={`py-2 border text-xs ${
                        config.positionSizeType === type
                          ? "border-fuchsia-500 text-fuchsia-400"
                          : "border-gray-700 text-gray-500"
                      }`}
                    >
                      {type.replace("_", " ")}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {config.positionSizeType === "FIXED"
                      ? "POSITION SIZE (USD)"
                      : config.positionSizeType === "PERCENT_EQUITY"
                        ? "% OF EQUITY PER TRADE"
                        : config.positionSizeType === "KELLY"
                          ? "KELLY FRACTION"
                          : "VOL TARGET %"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.positionSizeValue}
                    onChange={(e) => updateConfig("positionSizeValue", Number.parseFloat(e.target.value))}
                    className="w-full bg-black border border-gray-700 text-fuchsia-300 p-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">MAX LEVERAGE</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={config.maxLeverage}
                      onChange={(e) => updateConfig("maxLeverage", Number.parseInt(e.target.value))}
                      className="flex-1 accent-cyan-500"
                    />
                    <span className="text-cyan-400 text-sm font-mono w-12">{config.maxLeverage}x</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">MAX OPEN POSITIONS</label>
                  <input
                    type="number"
                    value={config.maxOpenPositions}
                    onChange={(e) => updateConfig("maxOpenPositions", Number.parseInt(e.target.value))}
                    className="w-full bg-black border border-gray-700 text-cyan-300 p-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">MAX DRAWDOWN % (kill switch)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.maxDrawdown}
                    onChange={(e) => updateConfig("maxDrawdown", Number.parseFloat(e.target.value))}
                    className="w-full bg-black border border-gray-700 text-red-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">MAX DAILY LOSS %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.maxDailyLoss}
                    onChange={(e) => updateConfig("maxDailyLoss", Number.parseFloat(e.target.value))}
                    className="w-full bg-black border border-gray-700 text-red-300 p-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">CORRELATION LIMIT: {config.correlationLimit}</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={config.correlationLimit}
                  onChange={(e) => updateConfig("correlationLimit", Number.parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0 (No correlated trades)</span>
                  <span>1 (Allow all)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: EXECUTION */}
          {step === "execution" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-xs text-gray-500 mb-2">ORDER TYPE</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["MARKET", "LIMIT", "TWAP", "ICEBERG"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateConfig("orderType", type)}
                      className={`py-3 border text-sm ${
                        config.orderType === type
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                          : "border-gray-700 text-gray-500 hover:border-gray-500"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">SLIPPAGE TOLERANCE %</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.slippageTolerance}
                  onChange={(e) => updateConfig("slippageTolerance", Number.parseFloat(e.target.value))}
                  className="w-full bg-black border border-gray-700 text-cyan-300 p-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500">ALLOW PARTIAL FILLS</label>
                    <button
                      type="button"
                      onClick={() => updateConfig("partialFillsEnabled", !config.partialFillsEnabled)}
                      className={`px-3 py-1 border text-xs ${
                        config.partialFillsEnabled ? "border-green-500 text-green-400" : "border-gray-600 text-gray-500"
                      }`}
                    >
                      {config.partialFillsEnabled ? "[ ON ]" : "[ OFF ]"}
                    </button>
                  </div>
                </div>
                <div className="border border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500">RETRY ON FAILURE</label>
                    <button
                      type="button"
                      onClick={() => updateConfig("retryOnFail", !config.retryOnFail)}
                      className={`px-3 py-1 border text-xs ${
                        config.retryOnFail ? "border-green-500 text-green-400" : "border-gray-600 text-gray-500"
                      }`}
                    >
                      {config.retryOnFail ? "[ ON ]" : "[ OFF ]"}
                    </button>
                  </div>
                </div>
              </div>

              {config.retryOnFail && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">MAX RETRIES</label>
                  <input
                    type="number"
                    value={config.maxRetries}
                    onChange={(e) => updateConfig("maxRetries", Number.parseInt(e.target.value))}
                    className="w-full bg-black border border-gray-700 text-cyan-300 p-2 text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 7: PROCESSING */}
          {step === "processing" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 border-2 border-cyan-500/30 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 border-2 border-cyan-500/50 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-full animate-ping" />
                  </div>
                </div>
              </div>
              <GlitchText text={processingStage} className="text-lg font-bold text-cyan-400" />
              <div className="w-80">
                <div className="h-2 bg-gray-800 border border-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 text-center mt-2">{Math.round(processingProgress)}%</div>
              </div>
            </div>
          )}

          {/* STEP 8: PREVIEW */}
          {step === "preview" && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="text-center mb-4">
                <GlitchText text={config.name} className="text-xl font-bold text-cyan-400" />
                <div className="text-xs text-gray-500 mt-1">
                  {config.strategyType} | {config.pair} | {config.primaryTimeframe}
                  {config.secondaryTimeframes.length > 0 && ` + ${config.secondaryTimeframes.join(", ")}`}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="border border-cyan-500/30 p-3">
                  <div className="text-xs text-cyan-500 mb-2">ENTRY</div>
                  <div className="text-xs text-gray-400 space-y-1">
                    {config.entryIndicators.map((ind, i) => (
                      <div key={i}>
                        {ind.name} {ind.condition}
                      </div>
                    ))}
                    <div className="text-gray-600">Logic: {config.entryLogic}</div>
                  </div>
                </div>
                <div className="border border-green-500/30 p-3">
                  <div className="text-xs text-green-500 mb-2">EXIT</div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>
                      TP: {config.takeProfitType} @ {config.takeProfitValue}%
                    </div>
                    <div>
                      SL: {config.stopLossType} @ {config.stopLossValue}%
                    </div>
                    {config.trailingStopEnabled && <div>Trail: {config.trailingStopValue}%</div>}
                  </div>
                </div>
                <div className="border border-fuchsia-500/30 p-3">
                  <div className="text-xs text-fuchsia-500 mb-2">RISK</div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>
                      Size: {config.positionSizeType} @ {config.positionSizeValue}
                    </div>
                    <div>Max Lev: {config.maxLeverage}x</div>
                    <div>Max DD: {config.maxDrawdown}%</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={runBacktest}
                className="w-full h-12 bg-fuchsia-500/20 border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500/30 font-mono"
              >
                [ RUN BACKTEST WITH NAUTILUS ]
              </button>
            </div>
          )}

          {/* STEP 9: BACKTEST */}
          {step === "backtest" && backtestResult && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="text-center">
                <GlitchText text="BACKTEST COMPLETE" className="text-lg font-bold text-green-400" />
                <div className="text-xs text-gray-500">90 days | Nautilus Trader</div>
              </div>

              <div className="grid grid-cols-[1fr_280px] gap-4">
                <div className="border border-cyan-500/30 p-3">
                  <div className="text-xs text-cyan-500 mb-2">EQUITY CURVE</div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={backtestResult.equityCurve}>
                        <defs>
                          <linearGradient id="eqGradModal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00ffff" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#00ffff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />
                        <Area type="monotone" dataKey="value" stroke="#00ffff" fill="url(#eqGradModal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border border-gray-700 p-3">
                  <div className="text-xs text-gray-500 mb-2">TEAR SHEET</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Return:</span>
                      <span className="text-green-400">+{backtestResult.totalReturn.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sharpe:</span>
                      <span className="text-cyan-400">{backtestResult.sharpe.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sortino:</span>
                      <span className="text-cyan-400">{backtestResult.sortino.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Calmar:</span>
                      <span className="text-cyan-400">{backtestResult.calmar.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Max DD:</span>
                      <span className="text-red-400">-{backtestResult.maxDrawdown.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Win Rate:</span>
                      <span className="text-cyan-400">{backtestResult.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trades:</span>
                      <span className="text-gray-300">{backtestResult.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">P/F:</span>
                      <span className="text-cyan-400">{backtestResult.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expect:</span>
                      <span className="text-green-400">{backtestResult.expectancy.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg Hold:</span>
                      <span className="text-gray-300">{backtestResult.avgHoldTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setStep("entry")}
                  className="h-10 border border-gray-600 text-gray-400 hover:border-gray-400 font-mono text-sm"
                >
                  [ TWEAK PARAMETERS ]
                </button>
                <button
                  type="button"
                  onClick={handleDeploy}
                  className="h-10 bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30 font-mono text-sm"
                >
                  [ DEPLOY LIVE ]
                </button>
              </div>
            </div>
          )}

          {/* STEP 10: DEPLOY */}
          {step === "deploy" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="w-20 h-20 border-2 border-green-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="text-green-500 text-3xl">✓</div>
              </div>
              <GlitchText text="DEPLOYING TO ORDERLY" className="text-xl font-bold text-green-400" />
              <div className="text-xs text-gray-500">Strategy is now trading autonomously</div>
              <div className="text-xs text-cyan-400">{config.name}</div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {!["processing", "deploy"].includes(step) && step !== "backtest" && step !== "preview" && (
          <div className="shrink-0 px-4 py-3 border-t border-gray-800 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === "basic"}
              className="px-4 py-2 border border-gray-700 text-gray-400 hover:border-gray-500 disabled:opacity-30 text-sm"
            >
              ← BACK
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-6 py-2 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-30 text-sm"
            >
              {step === "execution" ? "PROCESS →" : "NEXT →"}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
