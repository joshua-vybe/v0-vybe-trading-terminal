// Shared strategy store for cross-component access
export interface SavedStrategy {
  id: string
  name: string
  type: string
  assets: string[]
  timeframes: string[]
  createdAt: Date
  lastBacktest?: {
    return: number
    sharpe: number
    maxDD: number
    winRate: number
  }
}

// Simple in-memory store (would be replaced with proper state management in production)
let strategies: SavedStrategy[] = [
  {
    id: "1",
    name: "MOMENTUM_BREAKOUT",
    type: "Momentum",
    assets: ["BTC", "ETH"],
    timeframes: ["15m", "1H", "4H"],
    createdAt: new Date(),
    lastBacktest: { return: 12.4, sharpe: 1.82, maxDD: 8.2, winRate: 64 },
  },
  {
    id: "2",
    name: "MEAN_REVERSION_BB",
    type: "Mean Reversion",
    assets: ["BTC", "ETH", "SOL"],
    timeframes: ["5m", "15m"],
    createdAt: new Date(),
    lastBacktest: { return: 8.7, sharpe: 1.45, maxDD: 5.1, winRate: 71 },
  },
  {
    id: "3",
    name: "TREND_FOLLOWER_HMM",
    type: "Trend Following",
    assets: ["BTC"],
    timeframes: ["1H", "4H", "1D"],
    createdAt: new Date(),
    lastBacktest: { return: 22.1, sharpe: 2.1, maxDD: 12.4, winRate: 58 },
  },
  {
    id: "4",
    name: "VOLATILITY_EXPANSION",
    type: "Volatility",
    assets: ["BTC", "ETH"],
    timeframes: ["1H"],
    createdAt: new Date(),
  },
]

let listeners: (() => void)[] = []

export const strategyStore = {
  getStrategies: () => strategies,

  addStrategy: (strategy: Omit<SavedStrategy, "id" | "createdAt">) => {
    const newStrategy: SavedStrategy = {
      ...strategy,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    strategies = [...strategies, newStrategy]
    listeners.forEach((l) => l())
    return newStrategy
  },

  updateBacktestResults: (id: string, results: SavedStrategy["lastBacktest"]) => {
    strategies = strategies.map((s) => (s.id === id ? { ...s, lastBacktest: results } : s))
    listeners.forEach((l) => l())
  },

  deleteStrategy: (id: string) => {
    strategies = strategies.filter((s) => s.id !== id)
    listeners.forEach((l) => l())
  },

  subscribe: (listener: () => void) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
}
