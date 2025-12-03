"use client"
import { useState, useEffect, useCallback } from "react"
import { GlitchText } from "./glitch-text"
import { StatusIndicator } from "./status-indicator"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts"

type Step = "prompt" | "parsing" | "preview" | "backtest" | "deploy"
type LLMModel = "gpt-4" | "claude-3" | "llama-3" | "mistral" | "auto-router"

interface StrategyParams {
  name: string
  type: string
  venue: string
  pair: string
  timeframe: string
  entryConditions: string[]
  exitConditions: string[]
  riskParams: {
    positionSize: number
    maxLeverage: number
    stopLoss: number
    takeProfit: number
    trailingStop: number | null
    maxDrawdown: number
  }
  indicators: { name: string; params: Record<string, number> }[]
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
  equityCurve: { time: number; value: number }[]
}

interface StrategyCreatorModalProps {
  isOpen: boolean
  onClose: () => void
  onDeploy: (strategy: StrategyParams) => void
}

function generateStrategyName(prompt: string): string {
  const words = prompt.split(" ").slice(0, 3).join("_").toUpperCase()
  return words.substring(0, 20) + "_V1"
}

function detectStrategyType(prompt: string): string {
  const p = prompt.toLowerCase()
  if (p.includes("scalp")) return "SCALP"
  if (p.includes("swing")) return "SWING"
  if (p.includes("grid")) return "GRID"
  if (p.includes("arbitrage") || p.includes("arb")) return "ARB"
  if (p.includes("mean reversion")) return "MEAN_REV"
  if (p.includes("breakout")) return "BREAKOUT"
  if (p.includes("momentum")) return "MOMENTUM"
  return "CUSTOM"
}

function generateEntryConditions(prompt: string): string[] {
  const conditions: string[] = []
  const p = prompt.toLowerCase()
  if (p.includes("rsi")) conditions.push("RSI crosses above 30 (oversold)")
  if (p.includes("macd")) conditions.push("MACD crosses signal line")
  if (p.includes("bollinger")) conditions.push("Price at lower Bollinger Band")
  if (p.includes("volume")) conditions.push("Volume > 1.5x average")
  if (p.includes("breakout")) conditions.push("Price breaks 20-period high")
  if (p.includes("vwap")) conditions.push("Price crosses VWAP")
  if (conditions.length === 0) conditions.push("Custom NLP condition")
  return conditions
}

function generateExitConditions(prompt: string): string[] {
  const conditions: string[] = []
  const p = prompt.toLowerCase()
  if (p.includes("rsi")) conditions.push("RSI crosses above 70")
  if (p.includes("trailing")) conditions.push("Trailing stop at 1.5%")
  conditions.push("Take profit at 3:1 R/R")
  conditions.push("Stop loss at -2%")
  return conditions
}

function generateIndicators(prompt: string): { name: string; params: Record<string, number> }[] {
  const indicators: { name: string; params: Record<string, number> }[] = []
  const p = prompt.toLowerCase()
  if (p.includes("rsi")) indicators.push({ name: "RSI", params: { period: 14 } })
  if (p.includes("macd")) indicators.push({ name: "MACD", params: { fast: 12, slow: 26 } })
  if (p.includes("bollinger")) indicators.push({ name: "BBANDS", params: { period: 20 } })
  if (p.includes("vwap")) indicators.push({ name: "VWAP", params: { period: 1 } })
  if (indicators.length === 0) indicators.push({ name: "SMA", params: { period: 20 } })
  return indicators
}

export function StrategyCreatorModal({ isOpen, onClose, onDeploy }: StrategyCreatorModalProps) {
  const [step, setStep] = useState<Step>("prompt")
  const [prompt, setPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState<LLMModel>("auto-router")
  const [parsingProgress, setParsingProgress] = useState(0)
  const [parsingStage, setParsingStage] = useState("")
  const [strategy, setStrategy] = useState<StrategyParams | null>(null)
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)

  const models: { id: LLMModel; name: string; desc: string; color: string }[] = [
    { id: "auto-router", name: "AUTO-ROUTER", desc: "Optimal selection", color: "#00ff88" },
    { id: "gpt-4", name: "GPT-4", desc: "OpenAI", color: "#00ffff" },
    { id: "claude-3", name: "CLAUDE-3", desc: "Anthropic", color: "#ff00ff" },
    { id: "llama-3", name: "LLAMA-3", desc: "Meta", color: "#facc15" },
    { id: "mistral", name: "MISTRAL", desc: "European", color: "#22c55e" },
  ]

  const templates = [
    "Momentum scalper with RSI",
    "Mean reversion Bollinger",
    "Breakout with volume",
    "Grid trading bot",
  ]

  const parsePrompt = useCallback(() => {
    if (!prompt.trim()) return
    setStep("parsing")
    setParsingProgress(0)

    const stages = ["TOKENIZING", "ANALYZING", "EXTRACTING", "MAPPING", "COMPILING", "VALIDATING"]
    let stageIndex = 0

    const interval = setInterval(() => {
      if (stageIndex < stages.length) {
        setParsingStage(stages[stageIndex])
        setParsingProgress(((stageIndex + 1) / stages.length) * 100)
        stageIndex++
      } else {
        clearInterval(interval)
        setStrategy({
          name: generateStrategyName(prompt),
          type: detectStrategyType(prompt),
          venue: "HYPERLIQUID",
          pair: "BTC-USD",
          timeframe: "1H",
          entryConditions: generateEntryConditions(prompt),
          exitConditions: generateExitConditions(prompt),
          riskParams: {
            positionSize: 5,
            maxLeverage: 10,
            stopLoss: 2,
            takeProfit: 6,
            trailingStop: 1.5,
            maxDrawdown: 15,
          },
          indicators: generateIndicators(prompt),
        })
        setStep("preview")
      }
    }, 300)
    return () => clearInterval(interval)
  }, [prompt])

  const runBacktest = useCallback(() => {
    if (!strategy) return
    setParsingProgress(0)
    setParsingStage("SIMULATING")

    const interval = setInterval(() => {
      setParsingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          const curve: { time: number; value: number }[] = []
          let value = 10000
          for (let i = 0; i < 90; i++) {
            value += (Math.random() - 0.45) * 200
            curve.push({ time: i, value: Math.max(8000, value) })
          }
          setBacktestResult({
            totalTrades: 47,
            winRate: 64.2,
            profitFactor: 1.87,
            sharpe: 2.14,
            sortino: 2.89,
            maxDrawdown: 8.3,
            totalReturn: 18.7,
            avgWin: 312,
            avgLoss: 167,
            equityCurve: curve,
          })
          setStep("backtest")
          return 100
        }
        return prev + 3
      })
    }, 40)
  }, [strategy])

  const handleDeploy = useCallback(() => {
    if (!strategy) return
    setStep("deploy")
    setTimeout(() => {
      onDeploy(strategy)
      setTimeout(() => {
        onClose()
        setStep("prompt")
        setPrompt("")
        setStrategy(null)
        setBacktestResult(null)
      }, 1500)
    }, 1000)
  }, [strategy, onDeploy, onClose])

  useEffect(() => {
    if (!isOpen) {
      setStep("prompt")
      setPrompt("")
      setStrategy(null)
      setBacktestResult(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const steps: Step[] = ["prompt", "parsing", "preview", "backtest", "deploy"]
  const stepIndex = steps.indexOf(step)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/80" onClick={onClose} />

      {/* Modal Container - uses calc() to fill space between header and dock */}
      <div
        className="fixed z-[101] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[90%] md:max-w-5xl border border-cyan-500/50 bg-black/95"
        style={{
          top: "80px",
          bottom: "40px",
          boxShadow: "0 0 40px rgba(0,255,255,0.2)",
        }}
      >
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <StatusIndicator status="active" />
            <GlitchText text="NEURAL STRATEGY SYNTHESIZER" className="text-sm glow-cyan" />
          </div>
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full ${i < stepIndex ? "bg-green-400" : i === stepIndex ? "bg-cyan-400" : "bg-gray-600"}`}
                />
                {i < steps.length - 1 && <div className="w-3 h-px bg-gray-600 mx-0.5" />}
              </div>
            ))}
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ×
          </button>
        </div>

        <div className="absolute top-12 left-0 right-0 bottom-0 p-4 flex flex-col overflow-hidden">
          {/* STEP 1: PROMPT */}
          {step === "prompt" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="shrink-0 mb-4">
                <div className="text-[10px] text-gray-500 mb-2 tracking-wider">SELECT LLM MODEL</div>
                <div className="grid grid-cols-5 gap-2">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModel(m.id)}
                      className={`py-3 px-1 border text-center ${selectedModel === m.id ? "border-cyan-400 bg-cyan-400/10" : "border-gray-700 hover:border-gray-500"}`}
                    >
                      <div className="text-xs font-bold" style={{ color: m.color }}>
                        {m.name}
                      </div>
                      <div className="text-[9px] text-gray-500">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 overflow-hidden mb-4">
                <div className="shrink-0 text-xs text-gray-500 mb-2 tracking-wider">DESCRIBE YOUR TRADING STRATEGY</div>
                <div className="flex-1 min-h-0 relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && parsePrompt()}
                    placeholder="Example: Create a momentum scalping strategy for BTC that enters long when RSI crosses above 30..."
                    className="absolute inset-0 w-full h-full bg-black/50 border border-gray-700 text-cyan-300 p-3 resize-none focus:outline-none focus:border-cyan-500 font-mono text-sm"
                  />
                </div>
                <div className="shrink-0 flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>{prompt.length} chars</span>
                  <span>CTRL+ENTER to synthesize</span>
                </div>
              </div>

              <div className="shrink-0 mb-4">
                <div className="text-xs text-gray-500 mb-2 tracking-wider">TEMPLATES</div>
                <div className="flex gap-2 flex-wrap">
                  {templates.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPrompt(t)}
                      className="px-3 py-1.5 text-xs border border-gray-700 text-gray-400 hover:border-cyan-500 hover:text-cyan-400"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={parsePrompt}
                disabled={!prompt.trim()}
                className="shrink-0 h-12 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-30 tracking-wider font-mono"
              >
                [ SYNTHESIZE STRATEGY ]
              </button>
            </div>
          )}

          {/* STEP 2: PARSING */}
          {step === "parsing" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <GlitchText text="NEURAL PROCESSING" className="text-xl font-bold text-cyan-400" />
              <div className="text-xs text-gray-500">Model: {models.find((m) => m.id === selectedModel)?.name}</div>
              <div className="w-64">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>{parsingStage}</span>
                  <span>{Math.round(parsingProgress)}%</span>
                </div>
                <div className="h-2 bg-gray-800 border border-gray-700">
                  <div className="h-full bg-cyan-500 transition-all" style={{ width: `${parsingProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW */}
          {step === "preview" && strategy && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="shrink-0 text-center mb-4">
                <GlitchText text={strategy.name} className="text-lg font-bold text-cyan-400" />
                <div className="text-xs text-gray-500">
                  {strategy.type} | {strategy.venue} | {strategy.pair}
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4 min-h-0 overflow-auto mb-4">
                <div className="border border-green-500/30 p-4">
                  <div className="text-sm text-green-500 mb-2">ENTRY CONDITIONS</div>
                  {strategy.entryConditions.map((c, i) => (
                    <div key={i} className="text-sm text-green-400 font-mono">
                      {i + 1}. {c}
                    </div>
                  ))}
                </div>
                <div className="border border-red-500/30 p-4">
                  <div className="text-sm text-red-500 mb-2">EXIT CONDITIONS</div>
                  {strategy.exitConditions.map((c, i) => (
                    <div key={i} className="text-sm text-red-400 font-mono">
                      {i + 1}. {c}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={runBacktest}
                className="shrink-0 h-12 bg-fuchsia-500/20 border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500/30 tracking-wider font-mono"
              >
                [ RUN BACKTEST WITH NAUTILUS ]
              </button>
            </div>
          )}

          {/* STEP 4: BACKTEST */}
          {step === "backtest" && backtestResult && (
            <div className="flex-1 flex flex-col">
              <div className="text-center mb-3">
                <GlitchText text="BACKTEST COMPLETE" className="text-lg font-bold text-green-400" />
                <div className="text-xs text-gray-500">90 days | Nautilus Trader</div>
              </div>

              <div className="flex-1 grid grid-cols-[1fr_200px] gap-3 min-h-0 mb-3">
                {/* Chart */}
                <div className="border border-cyan-500/30 p-2 flex flex-col">
                  <div className="text-xs text-cyan-500 mb-1">EQUITY CURVE</div>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={backtestResult.equityCurve}>
                        <defs>
                          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00ffff" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#00ffff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />
                        <Area type="monotone" dataKey="value" stroke="#00ffff" fill="url(#eqGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Metrics */}
                <div className="border border-gray-700 p-2">
                  <div className="text-xs text-gray-500 mb-2">METRICS</div>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Return:</span>
                      <span className="text-green-400">+{backtestResult.totalReturn}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Win Rate:</span>
                      <span className="text-cyan-400">{backtestResult.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sharpe:</span>
                      <span className="text-cyan-400">{backtestResult.sharpe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sortino:</span>
                      <span className="text-cyan-400">{backtestResult.sortino}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Max DD:</span>
                      <span className="text-red-400">-{backtestResult.maxDrawdown}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trades:</span>
                      <span className="text-gray-300">{backtestResult.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">P/F:</span>
                      <span className="text-cyan-400">{backtestResult.profitFactor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStep("preview")}
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

          {/* STEP 5: DEPLOY */}
          {step === "deploy" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-2 border-green-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="text-green-500 text-2xl">✓</div>
              </div>
              <GlitchText text="DEPLOYING TO LIVE" className="text-xl font-bold text-green-400" />
              <div className="text-xs text-gray-500">Strategy is now trading autonomously</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
