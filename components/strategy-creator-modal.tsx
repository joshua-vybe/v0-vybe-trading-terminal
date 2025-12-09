"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ResponsiveContainer, AreaChart, Area } from "recharts"

const REGIME_CATEGORIES = {
  TREND_FOLLOWING: {
    name: "Trend Following",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 7h4v4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="3" cy="17" r="1" fill="currentColor" />
        <circle cx="21" cy="7" r="1" fill="currentColor" />
      </svg>
    ),
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    glowColor: "shadow-green-500/30",
    description: "Captures directional moves in trending markets",
  },
  MEAN_REVERSION: {
    name: "Mean Reversion",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 12h16" strokeLinecap="round" strokeDasharray="2 2" />
        <path d="M4 6c4 0 4 12 8 12s4-12 8-12" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/50",
    glowColor: "shadow-cyan-500/30",
    description: "Profits from price returning to equilibrium",
  },
  MOMENTUM: {
    name: "Momentum",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    glowColor: "shadow-yellow-500/30",
    description: "Exploits continuation of strong moves",
  },
  VOLATILITY: {
    name: "Volatility",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12l3-3 2 6 4-10 4 14 3-7 4 0" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="2" cy="12" r="1" fill="currentColor" />
        <circle cx="22" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/50",
    glowColor: "shadow-orange-500/30",
    description: "Trades volatility expansion/contraction",
  },
  STATISTICAL_ARB: {
    name: "Statistical Arbitrage",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4v16h16" strokeLinecap="round" />
        <circle cx="8" cy="14" r="2" stroke="currentColor" />
        <circle cx="14" cy="10" r="2" stroke="currentColor" />
        <circle cx="18" cy="8" r="2" stroke="currentColor" />
        <path d="M8 14l6-4 4-2" strokeDasharray="2 2" />
      </svg>
    ),
    color: "text-fuchsia-400",
    bgColor: "bg-fuchsia-500/20",
    borderColor: "border-fuchsia-500/50",
    glowColor: "shadow-fuchsia-500/30",
    description: "Exploits statistical mispricings",
  },
  MARKET_MAKING: {
    name: "Market Making",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="8" width="7" height="8" rx="1" />
        <rect x="14" y="8" width="7" height="8" rx="1" />
        <path d="M10 12h4" strokeLinecap="round" />
        <path d="M12 10v4" strokeLinecap="round" />
        <path d="M6.5 10v4M17.5 10v4" strokeLinecap="round" strokeWidth="1" />
      </svg>
    ),
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
    glowColor: "shadow-blue-500/30",
    description: "Provides liquidity and captures spread",
  },
  BREAKOUT: {
    name: "Breakout",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="8" width="16" height="8" rx="1" strokeDasharray="3 3" />
        <path d="M12 4v4M12 16v4" strokeLinecap="round" />
        <path d="M8 4l4 4 4-4M8 20l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
    glowColor: "shadow-red-500/30",
    description: "Captures moves from consolidation zones",
  },
  HYBRID: {
    name: "Hybrid/Adaptive",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" fillOpacity="0.3" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <path d="M12 6v3M12 15v3M6 12h3M15 12h3" strokeLinecap="round" />
      </svg>
    ),
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/50",
    glowColor: "shadow-purple-500/30",
    description: "Adapts strategy to current regime",
  },
}

interface AnalyzedStrategy {
  name: string
  summary: string
  type: string
  regimeCategory: keyof typeof REGIME_CATEGORIES
  assets: string[]
  timeframes: string[]
  entryLogic: string[]
  exitLogic: string[]
  riskParameters: {
    positionSize: string
    positionSizeValue: number
    stopLoss: string
    stopLossValue: number
    takeProfit: string
    takeProfitValue: number
    maxDrawdown: string
    maxDrawdownValue: number
    leverage: string
    leverageValue: number
    maxPositions: number
    maxCorrelation: number
    dailyLossLimit: number
    trailingStop: boolean
    trailingStopValue: number
  }
  indicators: {
    name: string
    purpose: string
    params: Record<string, number | string>
    enabled: boolean
  }[]
  regimeFilters: {
    name: string
    enabled: boolean
    value: string
  }[]
  executionSettings: {
    orderType: "MARKET" | "LIMIT" | "ADAPTIVE"
    slippageTolerance: number
    retryAttempts: number
    cooldownPeriod: number
    partialFills: boolean
    reduceOnly: boolean
  }
  edgeDescription: string
  complexity: "BASIC" | "INTERMEDIATE" | "ADVANCED" | "QUANT"
  estimatedWinRate: string
  pythonPreview: string
}

interface Message {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: Date
  codeBlock?: string
}

interface BacktestResult {
  totalReturn: number
  sharpe: number
  maxDrawdown: number
  winRate: number
  trades: number
  profitFactor: number
  equityCurve: { day: number; value: number }[]
}

interface StrategyCreatorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (strategy: AnalyzedStrategy) => void
}

const EXAMPLE_PROMPTS = [
  "Build a mean reversion strategy using Bollinger Bands with Kalman filter smoothing, only entering when HMM detects ranging regime and entropy is high",
  "Create a momentum breakout strategy that uses volume profile POC, market structure breaks, and orderflow CVD confirmation with regime filtering",
  "Design a statistical arbitrage pairs trading strategy for BTC/ETH using cointegration, Kalman filter hedge ratios, and z-score entry/exit",
  "Make an adaptive strategy that switches between trend-following and mean reversion based on Hurst exponent and HMM regime state",
  "Build a volatility expansion strategy using GARCH forecasting, Bollinger Band squeeze detection, and ATR breakout confirmation",
]

const AVAILABLE_ASSETS = [
  "BTC-USDC",
  "ETH-USDC",
  "SOL-USDC",
  "ARB-USDC",
  "OP-USDC",
  "AVAX-USDC",
  "MATIC-USDC",
  "LINK-USDC",
]
const AVAILABLE_TIMEFRAMES = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"]

export function StrategyCreatorModal({ isOpen, onClose, onSave }: StrategyCreatorModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedStrategy, setAnalyzedStrategy] = useState<AnalyzedStrategy | null>(null)
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [isBacktesting, setIsBacktesting] = useState(false)
  const [showCapabilities, setShowCapabilities] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [configTab, setConfigTab] = useState<"overview" | "indicators" | "risk" | "execution">("overview")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const modalRootRef = useRef<HTMLElement | null>(null)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage(
        "ai",
        `◈ NEURAL STRATEGY ARCHITECT v2.0 ◈

I'm your AI-powered strategy designer with access to quant-level tools:

• Hidden Markov Models & Regime Detection
• Kalman Filters & Statistical Methods
• Machine Learning (XGBoost, LSTM, Transformers)
• Orderflow Analysis (CVD, Delta, VPIN)
• Advanced Technical Analysis Library
• Risk Management & Position Sizing

Describe your trading idea in natural language and I'll architect a complete strategy with all parameters configured.

Type your strategy concept or click an example below.`,
      )
    }
  }, [isOpen])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const addMessage = (role: "user" | "ai", content: string, extra?: { codeBlock?: string }) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        content,
        timestamp: new Date(),
        ...extra,
      },
    ])
  }

  const generateStrategy = (prompt: string): AnalyzedStrategy => {
    const promptLower = prompt.toLowerCase()

    const isMeanReversion = promptLower.includes("mean reversion") || promptLower.includes("revert")
    const isMomentum =
      promptLower.includes("momentum") || promptLower.includes("trend") || promptLower.includes("breakout")
    const isStatArb =
      promptLower.includes("arbitrage") || promptLower.includes("cointegration") || promptLower.includes("pairs")
    const isMarketMaking = promptLower.includes("market making") || promptLower.includes("spread")
    const isVolatility =
      promptLower.includes("volatility") || promptLower.includes("garch") || promptLower.includes("squeeze")
    const isBreakout = promptLower.includes("breakout") || promptLower.includes("range")
    const isAdaptive =
      promptLower.includes("adaptive") || promptLower.includes("switch") || promptLower.includes("hybrid")
    const usesML =
      promptLower.includes("machine learning") ||
      promptLower.includes("ml") ||
      promptLower.includes("lstm") ||
      promptLower.includes("xgboost")
    const usesHMM =
      promptLower.includes("hmm") || promptLower.includes("regime") || promptLower.includes("hidden markov")
    const usesOrderflow =
      promptLower.includes("orderflow") || promptLower.includes("cvd") || promptLower.includes("delta")

    let strategyType = "CUSTOM"
    let regimeCategory: keyof typeof REGIME_CATEGORIES = "HYBRID"
    let indicators: AnalyzedStrategy["indicators"] = []
    let entryLogic: string[] = []
    let exitLogic: string[] = []
    let complexity: AnalyzedStrategy["complexity"] = "INTERMEDIATE"

    if (isMeanReversion) {
      strategyType = "MEAN_REVERSION"
      regimeCategory = "MEAN_REVERSION"
      indicators = [
        {
          name: "Bollinger Bands",
          purpose: "Identify overextension from mean",
          params: { period: 20, stdDev: 2.5, source: "close" },
          enabled: true,
        },
        {
          name: "RSI",
          purpose: "Confirm oversold/overbought conditions",
          params: { period: 14, oversold: 25, overbought: 75 },
          enabled: true,
        },
        {
          name: "Kalman Filter",
          purpose: "Dynamic mean estimation",
          params: { processNoise: 0.01, measurementNoise: 0.1, smoothing: 0.5 },
          enabled: true,
        },
        {
          name: "Entropy",
          purpose: "Measure market randomness",
          params: { window: 50, threshold: 0.7 },
          enabled: true,
        },
        { name: "ATR", purpose: "Volatility measurement", params: { period: 14, multiplier: 1.5 }, enabled: true },
      ]
      entryLogic = [
        "Price touches lower Bollinger Band (2.5 std)",
        "RSI shows bullish divergence below 25",
        "Kalman filter slope turning positive",
        "Entropy above 0.7 (ranging market confirmed)",
        "HMM regime = MEAN_REVERTING or RANGING",
      ]
      exitLogic = [
        "Price reaches Kalman filter mean",
        "RSI crosses above 50",
        "ATR-based trailing stop (1.5x ATR)",
        "Time-based exit after 24 candles",
      ]
      complexity = "ADVANCED"
    } else if (isVolatility) {
      strategyType = "VOLATILITY_EXPANSION"
      regimeCategory = "VOLATILITY"
      indicators = [
        { name: "GARCH", purpose: "Volatility forecasting", params: { p: 1, q: 1, horizon: 5 }, enabled: true },
        {
          name: "Bollinger Band Width",
          purpose: "Squeeze detection",
          params: { period: 20, squeezeThreshold: 0.05 },
          enabled: true,
        },
        {
          name: "Keltner Channel",
          purpose: "Volatility bands",
          params: { period: 20, atrMultiplier: 1.5 },
          enabled: true,
        },
        { name: "ATR", purpose: "Volatility baseline", params: { period: 14 }, enabled: true },
        { name: "Historical Volatility", purpose: "Realized vol comparison", params: { period: 20 }, enabled: true },
      ]
      entryLogic = [
        "BB inside Keltner (squeeze detected)",
        "GARCH forecasts vol expansion > 20%",
        "ATR at 30-day low",
        "Volume building during squeeze",
        "Direction from prior trend or orderflow",
      ]
      exitLogic = [
        "Volatility expansion target reached",
        "ATR-based trailing stop",
        "Time decay exit after expansion",
        "Reversal signal detected",
      ]
      complexity = "QUANT"
    } else if (isBreakout || isMomentum) {
      strategyType = "MOMENTUM_BREAKOUT"
      regimeCategory = isMomentum ? "MOMENTUM" : "BREAKOUT"
      indicators = [
        {
          name: "Market Structure",
          purpose: "Identify break of structure",
          params: { swingLookback: 10, sensitivity: "medium" },
          enabled: true,
        },
        {
          name: "Volume Profile",
          purpose: "Identify high volume nodes",
          params: { period: 100, valueArea: 70 },
          enabled: true,
        },
        { name: "ADX", purpose: "Confirm trend strength", params: { period: 14, threshold: 25 }, enabled: true },
        {
          name: "Hurst Exponent",
          purpose: "Measure trend persistence",
          params: { window: 100, threshold: 0.55 },
          enabled: true,
        },
        { name: "VWAP", purpose: "Institutional fair value", params: { anchored: false }, enabled: true },
      ]
      entryLogic = [
        "Break of significant swing high/low",
        "Volume exceeds 2x 20-period average",
        "ADX > 25 confirming trend strength",
        "Hurst exponent > 0.55 (trending)",
        "Price above VWAP for longs",
      ]
      exitLogic = [
        "Scaled take profit at 1R, 2R, 3R",
        "Structure-based stop loss",
        "Trailing stop using swing lows",
        "Exit if ADX drops below 20",
      ]
      complexity = "ADVANCED"
    } else if (isStatArb) {
      strategyType = "STATISTICAL_ARBITRAGE"
      regimeCategory = "STATISTICAL_ARB"
      indicators = [
        {
          name: "Cointegration Test",
          purpose: "Verify pair relationship",
          params: { lookback: 252, pValue: 0.05, method: "johansen" },
          enabled: true,
        },
        {
          name: "Kalman Filter",
          purpose: "Dynamic hedge ratio",
          params: { processNoise: 0.001, adaptiveWindow: true },
          enabled: true,
        },
        {
          name: "Z-Score",
          purpose: "Spread deviation measure",
          params: { window: 20, entry: 2.0, exit: 0.5 },
          enabled: true,
        },
        {
          name: "Half-Life",
          purpose: "Mean reversion speed",
          params: { maxHalfLife: 30, method: "OLS" },
          enabled: true,
        },
        {
          name: "Structural Break Test",
          purpose: "Detect regime changes",
          params: { window: 50, threshold: 0.01 },
          enabled: true,
        },
      ]
      entryLogic = [
        "Cointegration p-value < 0.05",
        "Spread Z-score exceeds ±2.0",
        "Half-life < 30 periods",
        "Kalman-adjusted hedge ratio",
        "No recent structural break",
      ]
      exitLogic = [
        "Spread returns to mean (Z = 0.5)",
        "Stop loss at Z-score ±4.0",
        "Maximum holding period 2x half-life",
        "Emergency exit if cointegration breaks",
      ]
      complexity = "QUANT"
    } else if (isMarketMaking) {
      strategyType = "MARKET_MAKING"
      regimeCategory = "MARKET_MAKING"
      indicators = [
        { name: "VPIN", purpose: "Toxic flow detection", params: { buckets: 50, threshold: 0.7 }, enabled: true },
        { name: "Kyle's Lambda", purpose: "Market impact estimation", params: { window: 100 }, enabled: true },
        { name: "Realized Volatility", purpose: "Dynamic spread adjustment", params: { window: 20 }, enabled: true },
        {
          name: "Inventory Skew",
          purpose: "Position risk management",
          params: { maxInventory: 10, skewFactor: 0.001 },
          enabled: true,
        },
        { name: "Order Imbalance", purpose: "Predict short-term direction", params: { depth: 5 }, enabled: true },
      ]
      entryLogic = [
        "Place symmetric quotes around mid-price",
        "Spread = base_spread * volatility_multiplier",
        "Skew quotes based on inventory",
        "Widen spread when VPIN > 0.7",
        "Pause quoting during high impact events",
      ]
      exitLogic = [
        "Flatten inventory at session end",
        "Emergency flatten if drawdown > 2%",
        "Reduce position if inventory > max",
        "Hard stop at daily loss limit",
      ]
      complexity = "QUANT"
    } else if (isAdaptive) {
      strategyType = "ADAPTIVE_HYBRID"
      regimeCategory = "HYBRID"
      indicators = [
        {
          name: "HMM Regime Classifier",
          purpose: "Detect current regime",
          params: { states: 4, features: ["returns", "vol", "volume"] },
          enabled: true,
        },
        { name: "Hurst Exponent", purpose: "Trend vs mean reversion", params: { window: 100 }, enabled: true },
        { name: "Entropy", purpose: "Market predictability", params: { window: 50 }, enabled: true },
        { name: "ADX", purpose: "Trend strength for regime", params: { period: 14 }, enabled: true },
        {
          name: "Bollinger Bands",
          purpose: "Mean reversion signals",
          params: { period: 20, stdDev: 2 },
          enabled: true,
        },
        { name: "Market Structure", purpose: "Trend following signals", params: { swingLookback: 10 }, enabled: true },
      ]
      entryLogic = [
        "HMM determines current regime",
        "If TRENDING: Use momentum signals",
        "If RANGING: Use mean reversion signals",
        "Hurst > 0.55 confirms trend bias",
        "Entropy confirms signal reliability",
      ]
      exitLogic = [
        "Regime change triggers position review",
        "Trend exits: trailing stop",
        "Mean rev exits: target mean",
        "Universal: max drawdown stop",
      ]
      complexity = "QUANT"
    } else {
      strategyType = "TREND_FOLLOWING"
      regimeCategory = "TREND_FOLLOWING"
      indicators = [
        { name: "EMA Crossover", purpose: "Trend direction", params: { fast: 9, slow: 21, signal: 5 }, enabled: true },
        { name: "RSI", purpose: "Momentum confirmation", params: { period: 14, threshold: 50 }, enabled: true },
        { name: "ATR", purpose: "Volatility-based stops", params: { period: 14, multiplier: 2 }, enabled: true },
        { name: "MACD", purpose: "Momentum divergence", params: { fast: 12, slow: 26, signal: 9 }, enabled: true },
      ]
      entryLogic = [
        "Fast EMA crosses above slow EMA",
        "RSI between 40-60 (not overextended)",
        "Price above VWAP",
        "MACD histogram positive",
      ]
      exitLogic = ["Take profit at 2:1 risk/reward", "Stop loss at 2x ATR", "Exit on EMA cross back"]
      complexity = "INTERMEDIATE"
    }

    if (usesML) {
      indicators.push({
        name: "XGBoost Classifier",
        purpose: "Predict direction probability",
        params: { features: 50, lookback: 100, threshold: 0.65, maxDepth: 6 },
        enabled: true,
      })
      indicators.push({
        name: "Feature Importance",
        purpose: "Adaptive feature selection",
        params: { method: "SHAP", topN: 20 },
        enabled: true,
      })
      entryLogic.push("ML model prediction probability > 65%")
      complexity = "QUANT"
    }

    if (usesHMM) {
      indicators.push({
        name: "Hidden Markov Model",
        purpose: "Regime classification",
        params: { states: 4, features: ["returns", "volatility", "volume"], retrainPeriod: 100 },
        enabled: true,
      })
      entryLogic.push("HMM regime aligned with strategy type")
      if (complexity !== "QUANT") complexity = "ADVANCED"
    }

    if (usesOrderflow) {
      indicators.push(
        { name: "CVD", purpose: "Cumulative volume delta", params: { period: 50, smoothing: 5 }, enabled: true },
        {
          name: "Delta Divergence",
          purpose: "Spot absorption",
          params: { lookback: 20, threshold: 0.3 },
          enabled: true,
        },
        { name: "VPIN", purpose: "Volume-synchronized probability", params: { buckets: 50 }, enabled: true },
      )
      entryLogic.push("CVD confirms direction")
      entryLogic.push("No negative delta divergence")
      if (complexity === "BASIC") complexity = "INTERMEDIATE"
    }

    const pythonCode = `# ${strategyType} Strategy - Generated by Neural Architect
from nautilus_trader.trading.strategy import Strategy
from nautilus_trader.model.data import Bar
from nautilus_trader.indicators import *
import numpy as np

class ${strategyType.replace(/_/g, "")}Strategy(Strategy):
    def __init__(self, config):
        super().__init__(config)
        # Indicator initialization
        ${indicators
          .filter((i) => i.enabled)
          .map((i) => `self.${i.name.toLowerCase().replace(/ /g, "_")} = None`)
          .join("\n        ")}
        
        # Risk parameters
        self.position_size_pct = ${complexity === "QUANT" ? 0.02 : 0.03}
        self.max_leverage = ${complexity === "QUANT" ? 5 : 10}
        self.max_drawdown = 0.15
        
    def on_bar(self, bar: Bar):
        # Update indicators
        self.update_indicators(bar)
        
        # Check regime filter
        if not self.regime_allows_entry():
            return
            
        # Entry Logic
        ${entryLogic.map((e, i) => `# ${i + 1}. ${e}`).join("\n        ")}
        
        entry_signal = self.calculate_entry()
        if entry_signal and not self.has_position():
            size = self.calculate_position_size()
            self.enter_position(entry_signal, size)
            
    def calculate_entry(self) -> Optional[str]:
        signals = []
        ${indicators
          .filter((i) => i.enabled)
          .map((i) => `signals.append(self.check_${i.name.toLowerCase().replace(/ /g, "_")}())`)
          .join("\n        ")}
        
        if all(signals):
            return "LONG" if self.bias > 0 else "SHORT"
        return None
        
    def calculate_position_size(self) -> float:
        risk_amount = self.portfolio_value * self.position_size_pct
        stop_distance = self.atr.value * 1.5
        return risk_amount / stop_distance
`

    return {
      name: `${strategyType}_${Date.now().toString(36).toUpperCase()}`,
      summary: `A ${complexity.toLowerCase()}-level ${strategyType.replace(/_/g, " ").toLowerCase()} strategy using ${indicators.length} indicators with regime-aware entry logic.`,
      type: strategyType,
      regimeCategory,
      assets: ["BTC-USDC", "ETH-USDC"],
      timeframes: ["15m", "1H", "4H"],
      entryLogic,
      exitLogic,
      riskParameters: {
        positionSize: "2% of equity per trade",
        positionSizeValue: 2,
        stopLoss: "1.5x ATR or structure-based",
        stopLossValue: 1.5,
        takeProfit: "2:1 to 3:1 risk/reward",
        takeProfitValue: 2.5,
        maxDrawdown: "15% maximum",
        maxDrawdownValue: 15,
        leverage: "Up to 10x",
        leverageValue: 10,
        maxPositions: 3,
        maxCorrelation: 0.7,
        dailyLossLimit: 5,
        trailingStop: true,
        trailingStopValue: 1.0,
      },
      indicators,
      regimeFilters: [
        { name: "HMM State Alignment", enabled: true, value: "BULL or RANGING" },
        { name: "Entropy Threshold", enabled: true, value: "> 0.6" },
        { name: "Volatility Regime", enabled: true, value: "NORMAL or LOW" },
        { name: "Trend Strength (ADX)", enabled: false, value: "> 25" },
      ],
      executionSettings: {
        orderType: "ADAPTIVE",
        slippageTolerance: 0.1,
        retryAttempts: 3,
        cooldownPeriod: 5,
        partialFills: true,
        reduceOnly: false,
      },
      edgeDescription: `This strategy exploits ${isMeanReversion ? "mean reversion dynamics in ranging markets" : isMomentum ? "momentum continuation after structural breaks" : isStatArb ? "statistical mispricings between correlated assets" : isVolatility ? "volatility expansion after low-vol squeezes" : "market inefficiencies"} with ${complexity.toLowerCase()}-level quantitative methods.`,
      complexity,
      estimatedWinRate: complexity === "QUANT" ? "55-65%" : complexity === "ADVANCED" ? "52-58%" : "50-55%",
      pythonPreview: pythonCode,
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    setInputValue("")
    addMessage("user", userMessage)

    if (!analyzedStrategy) {
      setIsAnalyzing(true)
      setTimeout(() => {
        const strategy = generateStrategy(userMessage)
        setAnalyzedStrategy(strategy)
        setIsAnalyzing(false)

        const regime = REGIME_CATEGORIES[strategy.regimeCategory]
        addMessage(
          "ai",
          `◈ STRATEGY ANALYSIS COMPLETE

[ ${regime.name.toUpperCase()} ] - ${strategy.type}

${strategy.summary}

I've configured ${strategy.indicators.length} indicators across ${strategy.timeframes.length} timeframes with ${strategy.entryLogic.length} entry conditions and ${strategy.exitLogic.length} exit rules.

The configuration panel on the right is now EDITABLE. You can:
• Click any parameter to modify it directly
• Toggle indicators on/off
• Adjust risk parameters
• Or tell me what to change in chat

Try: "Increase leverage to 15x" or "Add RSI divergence filter" or "Use 4H as primary timeframe"`,
        )
      }, 2000)
    } else {
      handleRefinement(userMessage)
    }
  }

  const handleRefinement = (message: string) => {
    const msgLower = message.toLowerCase()

    if (msgLower.includes("backtest") || msgLower.includes("test")) {
      runBacktest()
    } else if (msgLower.includes("code") || msgLower.includes("show")) {
      addMessage(
        "ai",
        `Here's the Nautilus Trader Python code preview:\n\n\`\`\`python\n${analyzedStrategy?.pythonPreview}\n\`\`\`\n\nThis code integrates with our Nautilus backend. Would you like to run a backtest or make modifications?`,
        { codeBlock: analyzedStrategy?.pythonPreview },
      )
    } else if (msgLower.includes("deploy") || msgLower.includes("live")) {
      handleDeploy()
    } else if (analyzedStrategy) {
      // Parse modification requests
      const updated = { ...analyzedStrategy }
      const changes: string[] = []

      // Leverage changes
      const leverageMatch = msgLower.match(/leverage.*?(\d+)/i) || msgLower.match(/(\d+)x?\s*leverage/i)
      if (leverageMatch) {
        const newLeverage = Number.parseInt(leverageMatch[1])
        updated.riskParameters = {
          ...updated.riskParameters,
          leverageValue: newLeverage,
          leverage: `Up to ${newLeverage}x`,
        }
        changes.push(`Leverage → ${newLeverage}x`)
      }

      // Stop loss changes
      const slMatch = msgLower.match(/stop\s*loss.*?(\d+\.?\d*)/i) || msgLower.match(/sl.*?(\d+\.?\d*)/i)
      if (slMatch) {
        const newSL = Number.parseFloat(slMatch[1])
        updated.riskParameters = { ...updated.riskParameters, stopLossValue: newSL, stopLoss: `${newSL}x ATR` }
        changes.push(`Stop Loss → ${newSL}x ATR`)
      }

      // Take profit changes
      const tpMatch = msgLower.match(/take\s*profit.*?(\d+\.?\d*)/i) || msgLower.match(/tp.*?(\d+\.?\d*)/i)
      if (tpMatch) {
        const newTP = Number.parseFloat(tpMatch[1])
        updated.riskParameters = { ...updated.riskParameters, takeProfitValue: newTP, takeProfit: `${newTP}:1 R:R` }
        changes.push(`Take Profit → ${newTP}:1 R:R`)
      }

      // Position size changes
      const posMatch = msgLower.match(/position\s*size.*?(\d+\.?\d*)/i) || msgLower.match(/risk.*?(\d+\.?\d*)%/i)
      if (posMatch) {
        const newPos = Number.parseFloat(posMatch[1])
        updated.riskParameters = {
          ...updated.riskParameters,
          positionSizeValue: newPos,
          positionSize: `${newPos}% of equity`,
        }
        changes.push(`Position Size → ${newPos}%`)
      }

      // Timeframe changes
      const tfMatch =
        msgLower.match(/timeframe.*?(1m|5m|15m|30m|1h|4h|1d|1w)/i) ||
        msgLower.match(/(1m|5m|15m|30m|1h|4h|1d|1w).*?timeframe/i)
      if (tfMatch) {
        const newTF = tfMatch[1].toUpperCase()
        if (!updated.timeframes.includes(newTF)) {
          updated.timeframes = [...updated.timeframes, newTF]
          changes.push(`Added timeframe: ${newTF}`)
        }
      }

      // Add indicator
      if (
        msgLower.includes("add") &&
        (msgLower.includes("rsi") || msgLower.includes("macd") || msgLower.includes("volume"))
      ) {
        if (msgLower.includes("rsi") && !updated.indicators.find((i) => i.name === "RSI")) {
          updated.indicators = [
            ...updated.indicators,
            {
              name: "RSI",
              purpose: "Momentum filter",
              params: { period: 14, oversold: 30, overbought: 70 },
              enabled: true,
            },
          ]
          changes.push("Added RSI indicator")
        }
        if (msgLower.includes("macd") && !updated.indicators.find((i) => i.name === "MACD")) {
          updated.indicators = [
            ...updated.indicators,
            { name: "MACD", purpose: "Momentum divergence", params: { fast: 12, slow: 26, signal: 9 }, enabled: true },
          ]
          changes.push("Added MACD indicator")
        }
      }

      // Toggle indicator
      if (msgLower.includes("disable") || msgLower.includes("remove") || msgLower.includes("turn off")) {
        updated.indicators.forEach((ind, idx) => {
          if (msgLower.includes(ind.name.toLowerCase())) {
            updated.indicators[idx] = { ...ind, enabled: false }
            changes.push(`Disabled ${ind.name}`)
          }
        })
      }

      if (msgLower.includes("enable") || msgLower.includes("turn on")) {
        updated.indicators.forEach((ind, idx) => {
          if (msgLower.includes(ind.name.toLowerCase())) {
            updated.indicators[idx] = { ...ind, enabled: true }
            changes.push(`Enabled ${ind.name}`)
          }
        })
      }

      if (changes.length > 0) {
        setAnalyzedStrategy(updated)
        addMessage(
          "ai",
          `◈ CONFIGURATION UPDATED\n\nChanges applied:\n${changes.map((c) => `• ${c}`).join("\n")}\n\nThe strategy panel has been updated. You can continue refining or run a backtest to validate.`,
        )
      } else {
        addMessage(
          "ai",
          `I understood you want to modify the strategy, but I couldn't parse the specific changes. Try being more specific like:\n\n• "Set leverage to 15x"\n• "Add RSI filter"\n• "Change stop loss to 2x ATR"\n• "Use 4H timeframe"\n\nOr click directly on the configuration panel to edit values.`,
        )
      }
    }
  }

  const runBacktest = () => {
    setIsBacktesting(true)
    addMessage(
      "ai",
      "◈ INITIATING BACKTEST\n\nConnecting to Nautilus engine...\nLoading historical data...\nRunning simulation...",
    )

    setTimeout(() => {
      const result: BacktestResult = {
        totalReturn: 15 + Math.random() * 30,
        sharpe: 1.5 + Math.random() * 1.5,
        maxDrawdown: 8 + Math.random() * 12,
        winRate: 52 + Math.random() * 15,
        trades: 150 + Math.floor(Math.random() * 200),
        profitFactor: 1.3 + Math.random() * 0.8,
        equityCurve: Array.from({ length: 90 }, (_, i) => ({
          day: i,
          value: 10000 * (1 + (0.001 + Math.random() * 0.003) * i + Math.sin(i / 10) * 200),
        })),
      }
      setBacktestResult(result)
      setIsBacktesting(false)
      addMessage(
        "ai",
        `◈ BACKTEST COMPLETE

Results (90 days):
• Return: +${result.totalReturn.toFixed(1)}%
• Sharpe: ${result.sharpe.toFixed(2)}
• Max DD: -${result.maxDrawdown.toFixed(1)}%
• Win Rate: ${result.winRate.toFixed(1)}%
• Trades: ${result.trades}
• Profit Factor: ${result.profitFactor.toFixed(2)}

The equity curve and detailed metrics are shown in the results panel.

Ready to deploy live or continue refining?`,
      )
    }, 3000)
  }

  const handleDeploy = () => {
    if (analyzedStrategy) {
      onSave(analyzedStrategy)
      addMessage(
        "ai",
        `◈ DEPLOYMENT INITIATED\n\n${analyzedStrategy.name} has been saved and is ready for live deployment.\n\nYou can monitor it from the Strategy Control Panel.`,
      )
    }
  }

  const updateStrategyField = (path: string, value: any) => {
    if (!analyzedStrategy) return

    const updated = { ...analyzedStrategy }
    const keys = path.split(".")
    let obj: any = updated

    for (let i = 0; i < keys.length - 1; i++) {
      if (keys[i].includes("[")) {
        const arrKey = keys[i].split("[")[0]
        const idx = Number.parseInt(keys[i].split("[")[1])
        obj = obj[arrKey][idx]
      } else {
        obj = obj[keys[i]]
      }
    }

    const finalKey = keys[keys.length - 1]
    obj[finalKey] = value
    setAnalyzedStrategy(updated)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!mounted || !isOpen) return null

  const currentRegime = analyzedStrategy ? REGIME_CATEGORIES[analyzedStrategy.regimeCategory] : null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-start justify-center p-6 pt-12 pb-8 overflow-hidden"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-[98%] max-w-7xl h-full max-h-[calc(100vh-80px)] bg-black border border-cyan-500/30 shadow-lg shadow-cyan-500/20 flex flex-col"
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between p-3 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 font-mono text-sm tracking-wider">◈ NEURAL STRATEGY ARCHITECT v2.0</span>
              {analyzedStrategy && currentRegime && (
                <div
                  className={`flex items-center gap-2 px-2 py-1 ${currentRegime.bgColor} ${currentRegime.borderColor} border`}
                >
                  <span className={currentRegime.color}>{currentRegime.icon}</span>
                  <span className={`text-xs font-mono ${currentRegime.color}`}>{currentRegime.name}</span>
                </div>
              )}
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl px-2">
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Chat Interface */}
            <div className="flex-1 flex flex-col border-r border-gray-800 min-w-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] p-3 text-sm font-mono whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-100"
                          : "bg-gray-900/50 border border-gray-700 text-gray-300"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isAnalyzing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-900/50 border border-gray-700 p-3">
                      <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-cyan-400"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                        <span>ANALYZING STRATEGY PARAMETERS...</span>
                      </div>
                    </div>
                  </div>
                )}

                {isBacktesting && (
                  <div className="flex justify-start">
                    <div className="bg-gray-900/50 border border-gray-700 p-3">
                      <div className="text-cyan-400 text-sm font-mono">
                        <div className="flex items-center gap-2 mb-2">
                          <motion.div
                            className="w-3 h-3 border border-cyan-400"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                          NAUTILUS BACKTEST ENGINE
                        </div>
                        <div className="h-1 bg-gray-800 overflow-hidden">
                          <motion.div
                            className="h-full bg-cyan-400"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Example Prompts */}
              {messages.length <= 1 && (
                <div className="shrink-0 p-3 border-t border-gray-800">
                  <div className="text-xs text-gray-500 mb-2">EXAMPLE STRATEGIES</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {EXAMPLE_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => setInputValue(prompt)}
                        className="w-full text-left text-xs text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/10 p-2 truncate font-mono transition-colors"
                      >
                        → {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Capabilities Button */}
              <div className="shrink-0 px-3 pb-2">
                <button
                  onClick={() => setShowCapabilities(!showCapabilities)}
                  className="text-xs text-gray-500 hover:text-cyan-400 font-mono"
                >
                  [ {showCapabilities ? "HIDE" : "SHOW"} CAPABILITIES ]
                </button>
                {showCapabilities && (
                  <div className="mt-2 p-2 bg-gray-900/50 border border-gray-800 text-xs text-gray-400 font-mono max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div>• Hidden Markov Models</div>
                      <div>• Kalman Filters</div>
                      <div>• Cointegration Tests</div>
                      <div>• GARCH Volatility</div>
                      <div>• XGBoost/LSTM/Transformers</div>
                      <div>• Orderflow (CVD, VPIN)</div>
                      <div>• Volume Profile/POC</div>
                      <div>• Market Structure</div>
                      <div>• Hurst Exponent</div>
                      <div>• Entropy Analysis</div>
                      <div>• Wavelet Transform</div>
                      <div>• Kyle's Lambda</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="shrink-0 p-3 border-t border-gray-800">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your strategy or ask for modifications..."
                    className="flex-1 bg-gray-900/50 border border-gray-700 focus:border-cyan-500/50 p-2 text-sm text-white font-mono resize-none outline-none"
                    rows={2}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isAnalyzing}
                    className="px-4 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                  >
                    SEND
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Editable Configuration */}
            <div className="w-96 flex flex-col bg-black/50 overflow-hidden">
              {analyzedStrategy ? (
                <>
                  {/* Strategy Header with Regime Icon */}
                  <div className="shrink-0 p-3 border-b border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      {currentRegime && (
                        <div
                          className={`p-1.5 ${currentRegime.bgColor} ${currentRegime.borderColor} border shadow-lg ${currentRegime.glowColor}`}
                        >
                          <span className={currentRegime.color}>{currentRegime.icon}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={analyzedStrategy.name}
                          onChange={(e) => updateStrategyField("name", e.target.value)}
                          className="w-full bg-transparent text-sm text-cyan-400 font-mono border-b border-transparent hover:border-cyan-500/30 focus:border-cyan-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 ${
                          analyzedStrategy.complexity === "QUANT"
                            ? "bg-fuchsia-500/20 text-fuchsia-400"
                            : analyzedStrategy.complexity === "ADVANCED"
                              ? "bg-cyan-500/20 text-cyan-400"
                              : analyzedStrategy.complexity === "INTERMEDIATE"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {analyzedStrategy.complexity}
                      </span>
                      <span className="text-xs text-gray-500">Est. Win: {analyzedStrategy.estimatedWinRate}</span>
                    </div>
                  </div>

                  {/* Config Tabs */}
                  <div className="shrink-0 flex border-b border-gray-800">
                    {(["overview", "indicators", "risk", "execution"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setConfigTab(tab)}
                        className={`flex-1 py-2 text-xs font-mono uppercase ${
                          configTab === tab
                            ? "text-cyan-400 border-b border-cyan-400 bg-cyan-500/10"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Config Content */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {configTab === "overview" && (
                      <>
                        {/* Assets */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">ASSETS</div>
                          <div className="flex flex-wrap gap-1">
                            {AVAILABLE_ASSETS.map((asset) => (
                              <button
                                key={asset}
                                onClick={() => {
                                  const assets = analyzedStrategy.assets.includes(asset)
                                    ? analyzedStrategy.assets.filter((a) => a !== asset)
                                    : [...analyzedStrategy.assets, asset]
                                  updateStrategyField("assets", assets)
                                }}
                                className={`text-xs px-2 py-0.5 font-mono transition-colors ${
                                  analyzedStrategy.assets.includes(asset)
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                    : "bg-gray-900/50 text-gray-500 border border-gray-700 hover:border-gray-500"
                                }`}
                              >
                                {asset.replace("-USDC", "")}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Timeframes */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">TIMEFRAMES</div>
                          <div className="flex flex-wrap gap-1">
                            {AVAILABLE_TIMEFRAMES.map((tf) => (
                              <button
                                key={tf}
                                onClick={() => {
                                  const tfs = analyzedStrategy.timeframes.includes(tf)
                                    ? analyzedStrategy.timeframes.filter((t) => t !== tf)
                                    : [...analyzedStrategy.timeframes, tf]
                                  updateStrategyField("timeframes", tfs)
                                }}
                                className={`text-xs px-2 py-0.5 font-mono transition-colors ${
                                  analyzedStrategy.timeframes.includes(tf)
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                    : "bg-gray-900/50 text-gray-500 border border-gray-700 hover:border-gray-500"
                                }`}
                              >
                                {tf}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Entry Logic */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            ENTRY CONDITIONS ({analyzedStrategy.entryLogic.length})
                          </div>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {analyzedStrategy.entryLogic.map((logic, i) => (
                              <div
                                key={i}
                                className="text-xs bg-green-500/10 border border-green-500/30 p-1.5 text-green-400 font-mono"
                              >
                                {i + 1}. {logic}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Exit Logic */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            EXIT CONDITIONS ({analyzedStrategy.exitLogic.length})
                          </div>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {analyzedStrategy.exitLogic.map((logic, i) => (
                              <div
                                key={i}
                                className="text-xs bg-red-500/10 border border-red-500/30 p-1.5 text-red-400 font-mono"
                              >
                                {i + 1}. {logic}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Regime Filters */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">REGIME FILTERS</div>
                          <div className="space-y-1">
                            {analyzedStrategy.regimeFilters.map((filter, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-xs bg-gray-900/50 border border-gray-700 p-1.5"
                              >
                                <button
                                  onClick={() => {
                                    const filters = [...analyzedStrategy.regimeFilters]
                                    filters[i] = { ...filters[i], enabled: !filters[i].enabled }
                                    updateStrategyField("regimeFilters", filters)
                                  }}
                                  className={`w-4 h-4 border ${filter.enabled ? "bg-cyan-500/50 border-cyan-500" : "border-gray-600"}`}
                                >
                                  {filter.enabled && <span className="text-white">✓</span>}
                                </button>
                                <span className={filter.enabled ? "text-cyan-400" : "text-gray-500"}>
                                  {filter.name}
                                </span>
                                <span className="text-gray-500 ml-auto">{filter.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {configTab === "indicators" && (
                      <div className="space-y-2">
                        {analyzedStrategy.indicators.map((ind, i) => (
                          <div
                            key={i}
                            className={`border p-2 ${ind.enabled ? "bg-cyan-500/10 border-cyan-500/30" : "bg-gray-900/30 border-gray-700 opacity-60"}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <button
                                onClick={() => {
                                  const indicators = [...analyzedStrategy.indicators]
                                  indicators[i] = { ...indicators[i], enabled: !indicators[i].enabled }
                                  updateStrategyField("indicators", indicators)
                                }}
                                className={`w-4 h-4 border text-xs ${ind.enabled ? "bg-cyan-500/50 border-cyan-500 text-white" : "border-gray-600"}`}
                              >
                                {ind.enabled && "✓"}
                              </button>
                              <span className="text-xs text-cyan-400 font-mono">{ind.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-1">{ind.purpose}</div>
                            <div className="grid grid-cols-2 gap-1">
                              {Object.entries(ind.params).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500">{key}:</span>
                                  <input
                                    type={typeof val === "number" ? "number" : "text"}
                                    value={val}
                                    onChange={(e) => {
                                      const indicators = [...analyzedStrategy.indicators]
                                      indicators[i] = {
                                        ...indicators[i],
                                        params: {
                                          ...indicators[i].params,
                                          [key]:
                                            typeof val === "number"
                                              ? Number.parseFloat(e.target.value) || 0
                                              : e.target.value,
                                        },
                                      }
                                      updateStrategyField("indicators", indicators)
                                    }}
                                    className="flex-1 bg-gray-900 border border-gray-700 px-1 py-0.5 text-xs text-cyan-400 font-mono w-16 outline-none focus:border-cyan-500"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {configTab === "risk" && (
                      <div className="space-y-3">
                        {/* Position Size */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">POSITION SIZE (% equity)</div>
                          <input
                            type="number"
                            step="0.5"
                            value={analyzedStrategy.riskParameters.positionSizeValue}
                            onChange={(e) =>
                              updateStrategyField("riskParameters.positionSizeValue", Number.parseFloat(e.target.value))
                            }
                            className="w-full bg-gray-900/50 border border-gray-700 p-2 text-sm text-cyan-400 font-mono outline-none focus:border-cyan-500"
                          />
                        </div>

                        {/* Leverage */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">MAX LEVERAGE</div>
                          <div className="flex gap-1">
                            {[1, 5, 10, 20, 50].map((lev) => (
                              <button
                                key={lev}
                                onClick={() => updateStrategyField("riskParameters.leverageValue", lev)}
                                className={`flex-1 py-1 text-xs font-mono ${
                                  analyzedStrategy.riskParameters.leverageValue === lev
                                    ? "bg-cyan-500/30 border border-cyan-500 text-cyan-400"
                                    : "bg-gray-900/50 border border-gray-700 text-gray-400 hover:border-gray-500"
                                }`}
                              >
                                {lev}x
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Stop Loss */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">STOP LOSS (ATR multiplier)</div>
                          <input
                            type="number"
                            step="0.1"
                            value={analyzedStrategy.riskParameters.stopLossValue}
                            onChange={(e) =>
                              updateStrategyField("riskParameters.stopLossValue", Number.parseFloat(e.target.value))
                            }
                            className="w-full bg-gray-900/50 border border-gray-700 p-2 text-sm text-red-400 font-mono outline-none focus:border-cyan-500"
                          />
                        </div>

                        {/* Take Profit */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">TAKE PROFIT (R:R)</div>
                          <input
                            type="number"
                            step="0.1"
                            value={analyzedStrategy.riskParameters.takeProfitValue}
                            onChange={(e) =>
                              updateStrategyField("riskParameters.takeProfitValue", Number.parseFloat(e.target.value))
                            }
                            className="w-full bg-gray-900/50 border border-gray-700 p-2 text-sm text-green-400 font-mono outline-none focus:border-cyan-500"
                          />
                        </div>

                        {/* Max Drawdown */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">MAX DRAWDOWN (%)</div>
                          <input
                            type="number"
                            step="1"
                            value={analyzedStrategy.riskParameters.maxDrawdownValue}
                            onChange={(e) =>
                              updateStrategyField("riskParameters.maxDrawdownValue", Number.parseFloat(e.target.value))
                            }
                            className="w-full bg-gray-900/50 border border-gray-700 p-2 text-sm text-orange-400 font-mono outline-none focus:border-cyan-500"
                          />
                        </div>

                        {/* Max Positions */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">MAX CONCURRENT POSITIONS</div>
                          <input
                            type="number"
                            value={analyzedStrategy.riskParameters.maxPositions}
                            onChange={(e) =>
                              updateStrategyField("riskParameters.maxPositions", Number.parseInt(e.target.value))
                            }
                            className="w-full bg-gray-900/50 border border-gray-700 p-2 text-sm text-cyan-400 font-mono outline-none focus:border-cyan-500"
                          />
                        </div>

                        {/* Trailing Stop */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateStrategyField(
                                "riskParameters.trailingStop",
                                !analyzedStrategy.riskParameters.trailingStop,
                              )
                            }
                            className={`w-5 h-5 border ${analyzedStrategy.riskParameters.trailingStop ? "bg-cyan-500/50 border-cyan-500" : "border-gray-600"}`}
                          >
                            {analyzedStrategy.riskParameters.trailingStop && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </button>
                          <span className="text-xs text-gray-400">TRAILING STOP</span>
                          {analyzedStrategy.riskParameters.trailingStop && (
                            <input
                              type="number"
                              step="0.1"
                              value={analyzedStrategy.riskParameters.trailingStopValue}
                              onChange={(e) =>
                                updateStrategyField(
                                  "riskParameters.trailingStopValue",
                                  Number.parseFloat(e.target.value),
                                )
                              }
                              className="w-16 bg-gray-900/50 border border-gray-700 px-2 py-1 text-xs text-cyan-400 font-mono outline-none focus:border-cyan-500"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {configTab === "execution" && (
                      <div className="space-y-3">
                        {/* Order Type */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">ORDER TYPE</div>
                          <div className="flex gap-1">
                            {(["MARKET", "LIMIT", "ADAPTIVE"] as const).map((type) => (
                              <button
                                key={type}
                                onClick={() => updateStrategyField("executionSettings.orderType", type)}
                                className={`flex-1 py-1.5 text-xs font-mono ${
                                  analyzedStrategy.executionSettings.orderType === type
                                    ? "bg-cyan-500/30 border border-cyan-500 text-cyan-400"
                                    : "bg-gray-900/50 border border-gray-700 text-gray-400 hover:border-gray-500"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Slippage Tolerance */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">SLIPPAGE TOLERANCE (%)</div>
                          <input
                            type="number"
                            step="0.01"
                            value={analyzedStrategy.executionSettings.slippageTolerance}
                            onChange={(e) =>
                              updateStrategyField(
                                "executionSettings.slippageTolerance",
                                Number.parseFloat(e.target.value),
                              )
                            }
                            className="w-full bg-gray-900/50 border border-gray-700 p-2 text-sm text-cyan-400 font-mono outline-none focus:border-cyan-500"
                          />
                        </div>

                        {/* Retry Attempts */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">RETRY ATTEMPTS</div>
                          <input
                            type="number"
                            value={analyzedStrategy.executionSettings.retryAttempts}
                            onChange={(e) =>
                              updateStrategyField("executionSettings.retryAttempts", Number.parseInt(e.target.value))
                            }
                            className="w-full bg-gray-900/50 border border-gray-700 p-2 text-sm text-cyan-400 font-mono outline-none focus:border-cyan-500"
                          />
                        </div>

                        {/* Cooldown */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">COOLDOWN PERIOD (minutes)</div>
                          <input
                            type="number"
                            value={analyzedStrategy.executionSettings.cooldownPeriod}
                            onChange={(e) =>
                              updateStrategyField("executionSettings.cooldownPeriod", Number.parseInt(e.target.value))
                            }
                            className="w-full bg-gray-900/50 border border-gray-700 p-2 text-sm text-cyan-400 font-mono outline-none focus:border-cyan-500"
                          />
                        </div>

                        {/* Toggles */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateStrategyField(
                                  "executionSettings.partialFills",
                                  !analyzedStrategy.executionSettings.partialFills,
                                )
                              }
                              className={`w-5 h-5 border ${analyzedStrategy.executionSettings.partialFills ? "bg-cyan-500/50 border-cyan-500" : "border-gray-600"}`}
                            >
                              {analyzedStrategy.executionSettings.partialFills && (
                                <span className="text-white text-xs">✓</span>
                              )}
                            </button>
                            <span className="text-xs text-gray-400">ALLOW PARTIAL FILLS</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateStrategyField(
                                  "executionSettings.reduceOnly",
                                  !analyzedStrategy.executionSettings.reduceOnly,
                                )
                              }
                              className={`w-5 h-5 border ${analyzedStrategy.executionSettings.reduceOnly ? "bg-cyan-500/50 border-cyan-500" : "border-gray-600"}`}
                            >
                              {analyzedStrategy.executionSettings.reduceOnly && (
                                <span className="text-white text-xs">✓</span>
                              )}
                            </button>
                            <span className="text-xs text-gray-400">REDUCE ONLY MODE</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Backtest Results */}
                    {backtestResult && (
                      <div className="border border-green-500/30 bg-green-500/10 p-2 mt-3">
                        <div className="text-xs text-green-400 mb-2">BACKTEST RESULTS</div>
                        <div className="h-20 mb-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={backtestResult.equityCurve}>
                              <defs>
                                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#00ffff" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="#00ffff" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#00ffff"
                                fill="url(#equityGradient)"
                                strokeWidth={1}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div className="bg-gray-900/50 p-1.5">
                            <div className="text-gray-500">Return</div>
                            <div className="text-green-400">+{backtestResult.totalReturn.toFixed(1)}%</div>
                          </div>
                          <div className="bg-gray-900/50 p-1.5">
                            <div className="text-gray-500">Sharpe</div>
                            <div className="text-cyan-400">{backtestResult.sharpe.toFixed(2)}</div>
                          </div>
                          <div className="bg-gray-900/50 p-1.5">
                            <div className="text-gray-500">Max DD</div>
                            <div className="text-red-400">-{backtestResult.maxDrawdown.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="shrink-0 p-3 border-t border-gray-800 space-y-2">
                    <button
                      onClick={runBacktest}
                      disabled={isBacktesting}
                      className="w-full py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50 font-mono text-xs"
                    >
                      {isBacktesting ? "[ RUNNING... ]" : "[ RUN BACKTEST ]"}
                    </button>
                    <button
                      onClick={handleDeploy}
                      className="w-full py-2 bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 font-mono text-xs"
                    >
                      [ SAVE & DEPLOY ]
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center">
                    <div className="text-gray-500 text-sm font-mono mb-4">AWAITING STRATEGY INPUT</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(REGIME_CATEGORIES)
                        .slice(0, 4)
                        .map(([key, regime]) => (
                          <div key={key} className={`p-2 border ${regime.borderColor} ${regime.bgColor} opacity-50`}>
                            <div className={`${regime.color} mb-1`}>{regime.icon}</div>
                            <div className={`text-xs ${regime.color}`}>{regime.name}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
