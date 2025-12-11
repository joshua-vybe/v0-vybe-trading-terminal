"use client"

import { useState } from "react"
import { ConfluencePanel } from "./confluence-panel"
import { FundingRateMonitor } from "./funding-rate-monitor"

type StrategyStatus = "inactive" | "active" | "profit" | "loss" | "danger" | "liquidated"
type TradeEvent = "open_long" | "open_short" | "close" | "liquidated" | null

interface Position {
  asset: string
  direction: "long" | "short"
  size: number
  leverage: number
  entryPrice: number
  currentPrice: number
  liquidationPrice: number
  pnl: number
  pnlPercent: number
  liquidationDistance: number
}

interface Strategy {
  id: string
  name: string
  status: StrategyStatus
  positions: Position[]
  totalPnl: number
  totalPnlPercent: number
  lastEvent: TradeEvent
  lastEventAsset: string | null
  eventTimestamp: number
}

import { useEffect } from "react"

const mockStrategies: Strategy[] = [
  {
    id: "STR-001",
    name: "MOMENTUM_SCALPER",
    status: "profit",
    positions: [
      {
        asset: "BTC",
        direction: "long",
        size: 0.5,
        leverage: 10,
        entryPrice: 43150,
        currentPrice: 44025,
        liquidationPrice: 38835,
        pnl: 437.5,
        pnlPercent: 2.03,
        liquidationDistance: 11.8,
      },
      {
        asset: "ETH",
        direction: "long",
        size: 3.2,
        leverage: 5,
        entryPrice: 2280,
        currentPrice: 2345,
        liquidationPrice: 1900,
        pnl: 520.0,
        pnlPercent: 2.85,
        liquidationDistance: 19.0,
      },
      {
        asset: "SOL",
        direction: "short",
        size: 45,
        leverage: 8,
        entryPrice: 98.5,
        currentPrice: 95.2,
        liquidationPrice: 115,
        pnl: 289.0,
        pnlPercent: 3.35,
        liquidationDistance: 20.8,
      },
    ],
    totalPnl: 1246.5,
    totalPnlPercent: 12.46,
    lastEvent: null,
    lastEventAsset: null,
    eventTimestamp: 0,
  },
  {
    id: "STR-002",
    name: "MEAN_REVERSION",
    status: "loss",
    positions: [
      {
        asset: "BTC",
        direction: "short",
        size: 0.25,
        leverage: 5,
        entryPrice: 43800,
        currentPrice: 44025,
        liquidationPrice: 52560,
        pnl: -281.25,
        pnlPercent: -2.57,
        liquidationDistance: 19.4,
      },
      {
        asset: "ARB",
        direction: "long",
        size: 1200,
        leverage: 3,
        entryPrice: 0.95,
        currentPrice: 0.92,
        liquidationPrice: 0.65,
        pnl: -42.95,
        pnlPercent: -3.77,
        liquidationDistance: 29.3,
      },
    ],
    totalPnl: -324.2,
    totalPnlPercent: -3.24,
    lastEvent: null,
    lastEventAsset: null,
    eventTimestamp: 0,
  },
  {
    id: "STR-003",
    name: "BREAKOUT_HUNTER",
    status: "danger",
    positions: [
      {
        asset: "BTC",
        direction: "long",
        size: 0.75,
        leverage: 20,
        entryPrice: 44500,
        currentPrice: 44025,
        liquidationPrice: 43312,
        pnl: -712.5,
        pnlPercent: -10.67,
        liquidationDistance: 1.6,
      },
      {
        asset: "DOGE",
        direction: "long",
        size: 50000,
        leverage: 10,
        entryPrice: 0.105,
        currentPrice: 0.102,
        liquidationPrice: 0.095,
        pnl: -179.9,
        pnlPercent: -3.43,
        liquidationDistance: 6.9,
      },
    ],
    totalPnl: -892.4,
    totalPnlPercent: -8.92,
    lastEvent: null,
    lastEventAsset: null,
    eventTimestamp: 0,
  },
  {
    id: "STR-004",
    name: "GRID_BOT_V2",
    status: "inactive",
    positions: [],
    totalPnl: 0,
    totalPnlPercent: 0,
    lastEvent: null,
    lastEventAsset: null,
    eventTimestamp: 0,
  },
]

function PositionRow({ position }: { position: Position }) {
  const isLong = position.direction === "long"
  const isDanger = position.liquidationDistance < 5

  return (
    <div
      className={`flex items-center gap-1 py-0.5 px-1 text-[8px] font-mono ${isDanger ? "bg-[#f59e0b15] animate-pulse" : "bg-[#ffffff05]"}`}
    >
      <div className={`w-12 font-bold ${isLong ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
        {isLong ? "▲" : "▼"} {position.asset}
      </div>
      <div className="w-14 text-[#ffffff60]">
        {position.size < 1 ? position.size.toFixed(3) : position.size.toFixed(1)}
      </div>
      <div className="w-8 text-[#facc15]">{position.leverage}x</div>
      <div className={`w-16 text-right font-bold ${position.pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
        {position.pnl >= 0 ? "+" : ""}
        {position.pnl.toFixed(0)}
      </div>
      <div
        className={`w-10 text-right ${isDanger ? "text-[#f59e0b] font-bold animate-pulse" : position.liquidationDistance < 15 ? "text-[#ef4444]" : "text-[#ffffff40]"}`}
      >
        {position.liquidationDistance.toFixed(1)}%
      </div>
    </div>
  )
}

function StrategyCard({
  strategy,
  onToggle,
  isExpanded,
  onExpand,
  onDelete,
}: {
  strategy: Strategy
  onToggle: () => void
  isExpanded: boolean
  onExpand: () => void
  onDelete: () => void
}) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationType, setAnimationType] = useState<TradeEvent>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (strategy.lastEvent && Date.now() - strategy.eventTimestamp < 3000) {
      setAnimationType(strategy.lastEvent)
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setAnimationType(null)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [strategy.lastEvent, strategy.eventTimestamp])

  const getStatusStyles = () => {
    switch (strategy.status) {
      case "inactive":
        return {
          border: "border-[#ffffff15]",
          bg: "bg-[#ffffff05]",
          glow: "",
          text: "text-[#ffffff30]",
          indicator: "bg-[#ffffff30]",
        }
      case "active":
        return {
          border: "border-[#00ffff50]",
          bg: "bg-[#00ffff05]",
          glow: "shadow-[0_0_10px_#00ffff20]",
          text: "text-[#00ffff]",
          indicator: "bg-[#00ffff]",
        }
      case "profit":
        return {
          border: "border-[#22c55e80]",
          bg: "bg-[#22c55e10]",
          glow: "shadow-[0_0_15px_#22c55e30]",
          text: "text-[#22c55e]",
          indicator: "bg-[#22c55e]",
        }
      case "loss":
        return {
          border: "border-[#ef444480]",
          bg: "bg-[#ef444410]",
          glow: "shadow-[0_0_15px_#ef444430]",
          text: "text-[#ef4444]",
          indicator: "bg-[#ef4444]",
        }
      case "danger":
        return {
          border: "border-[#f59e0b]",
          bg: "bg-[#f59e0b15]",
          glow: "shadow-[0_0_20px_#f59e0b50] animate-pulse",
          text: "text-[#f59e0b]",
          indicator: "bg-[#f59e0b] animate-pulse",
        }
      case "liquidated":
        return {
          border: "border-[#dc2626]",
          bg: "bg-[#dc262620]",
          glow: "",
          text: "text-[#dc2626]",
          indicator: "bg-[#dc2626]",
        }
    }
  }

  const styles = getStatusStyles()
  const isLive = strategy.status !== "inactive"
  const positionCount = strategy.positions.length
  const mostDangerousPos = strategy.positions.reduce(
    (min, p) => (p.liquidationDistance < (min?.liquidationDistance ?? 100) ? p : min),
    strategy.positions[0],
  )

  return (
    <div
      className={`relative border ${styles.border} ${styles.bg} ${styles.glow} p-2 transition-all duration-300 overflow-hidden`}
    >
      {isAnimating && animationType === "open_long" && (
        <>
          <div className="absolute inset-0 bg-[#22c55e] opacity-30 animate-[ping_0.5s_ease-out]" />
          <div className="absolute top-1 right-1 text-[8px] text-[#22c55e] font-bold animate-bounce">
            ▲ LONG {strategy.lastEventAsset}
          </div>
        </>
      )}
      {isAnimating && animationType === "open_short" && (
        <>
          <div className="absolute inset-0 bg-[#ef4444] opacity-30 animate-[ping_0.5s_ease-out]" />
          <div className="absolute top-1 right-1 text-[8px] text-[#ef4444] font-bold animate-bounce">
            ▼ SHORT {strategy.lastEventAsset}
          </div>
        </>
      )}
      {isAnimating && animationType === "close" && (
        <div className="absolute top-1 right-1 text-[8px] text-[#00ffff] font-bold">
          ◉ CLOSED {strategy.lastEventAsset}
        </div>
      )}
      {isAnimating && animationType === "liquidated" && (
        <>
          <div className="absolute inset-0 bg-[#dc2626] animate-[flash_0.2s_ease-out_3]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm animate-pulse">☠ LIQUIDATED {strategy.lastEventAsset}</span>
          </div>
        </>
      )}

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10 animate-fadeIn">
          <span className="text-[10px] text-[#ef4444] mb-2">DELETE {strategy.name}?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onDelete()
                setShowDeleteConfirm(false)
              }}
              className="px-2 py-1 text-[9px] border border-[#ef4444] text-[#ef4444] hover:bg-[#ef444430] transition-all"
            >
              [ CONFIRM ]
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2 py-1 text-[9px] border border-[#ffffff30] text-[#ffffff50] hover:bg-[#ffffff10] transition-all"
            >
              [ CANCEL ]
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${styles.indicator}`} />
          <span className={`text-[10px] font-mono font-bold ${styles.text}`}>{strategy.name}</span>
          {isLive && positionCount > 0 && (
            <span className="text-[8px] px-1 py-0.5 bg-[#ffffff10] text-[#ffffff60] rounded">{positionCount} POS</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isLive && positionCount > 0 && (
            <button
              onClick={onExpand}
              className="px-1 py-0.5 text-[8px] text-[#ffffff50] hover:text-[#00ffff] transition-all"
            >
              {isExpanded ? "▲" : "▼"}
            </button>
          )}
          <button
            onClick={onToggle}
            className={`px-1.5 py-0.5 text-[8px] border transition-all ${isLive ? "border-[#22c55e50] text-[#22c55e] hover:bg-[#22c55e20]" : "border-[#ffffff30] text-[#ffffff50] hover:border-[#00ffff50] hover:text-[#00ffff]"}`}
          >
            {isLive ? "[ ON ]" : "[ OFF ]"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-1.5 py-0.5 text-[8px] border border-[#ef444430] text-[#ef444480] hover:border-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef444420] transition-all"
          >
            [ ✕ ]
          </button>
        </div>
      </div>

      {isLive ? (
        <>
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-base font-bold font-mono ${strategy.totalPnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}
            >
              {strategy.totalPnl >= 0 ? "+" : ""}
              {strategy.totalPnl.toFixed(2)}
              <span className="text-[9px] opacity-60 ml-1">
                ({strategy.totalPnlPercent >= 0 ? "+" : ""}
                {strategy.totalPnlPercent.toFixed(2)}%)
              </span>
            </span>
            {mostDangerousPos && mostDangerousPos.liquidationDistance < 15 && (
              <span
                className={`text-[8px] ${mostDangerousPos.liquidationDistance < 5 ? "text-[#f59e0b] animate-pulse font-bold" : "text-[#ef4444]"}`}
              >
                ⚠ LIQ {mostDangerousPos.asset} {mostDangerousPos.liquidationDistance.toFixed(1)}%
              </span>
            )}
          </div>
          {isExpanded && positionCount > 0 && (
            <div className="border-t border-[#ffffff10] pt-1 mt-1 space-y-0.5">
              <div className="flex items-center gap-1 px-1 text-[7px] text-[#ffffff30] uppercase">
                <div className="w-12">Asset</div>
                <div className="w-14">Size</div>
                <div className="w-8">Lev</div>
                <div className="w-16 text-right">PnL</div>
                <div className="w-10 text-right">Liq</div>
              </div>
              {strategy.positions.map((pos, idx) => (
                <PositionRow key={`${strategy.id}-${pos.asset}-${idx}`} position={pos} />
              ))}
            </div>
          )}
          {!isExpanded && positionCount > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {strategy.positions.map((pos, idx) => (
                <span
                  key={`${strategy.id}-mini-${idx}`}
                  className={`text-[8px] px-1 py-0.5 rounded ${pos.direction === "long" ? "bg-[#22c55e20] text-[#22c55e]" : "bg-[#ef444420] text-[#ef4444]"} ${pos.liquidationDistance < 5 ? "animate-pulse border border-[#f59e0b]" : ""}`}
                >
                  {pos.direction === "long" ? "▲" : "▼"}
                  {pos.asset}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-[10px] text-[#ffffff30] italic">Strategy offline</div>
      )}
    </div>
  )
}

function StrategiesPanel() {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setStrategies((prev) =>
        prev.map((s) => {
          if (s.status === "inactive" || s.positions.length === 0) return s
          const updatedPositions = s.positions.map((pos) => {
            const priceChange = (Math.random() - 0.5) * (pos.currentPrice * 0.002)
            const newPrice = pos.currentPrice + priceChange
            const newPnl =
              pos.direction === "long"
                ? (newPrice - pos.entryPrice) * pos.size * pos.leverage
                : (pos.entryPrice - newPrice) * pos.size * pos.leverage
            const newPnlPercent = pos.entryPrice > 0 ? (newPnl / (pos.entryPrice * pos.size)) * 100 : 0
            const liqDist =
              pos.direction === "long"
                ? ((newPrice - pos.liquidationPrice) / newPrice) * 100
                : ((pos.liquidationPrice - newPrice) / newPrice) * 100
            return {
              ...pos,
              currentPrice: newPrice,
              pnl: newPnl,
              pnlPercent: newPnlPercent,
              liquidationDistance: Math.max(0, liqDist),
            }
          })
          const totalPnl = updatedPositions.reduce((sum, p) => sum + p.pnl, 0)
          const minLiqDist = Math.min(...updatedPositions.map((p) => p.liquidationDistance))
          let newStatus: StrategyStatus = "active"
          if (minLiqDist < 5) newStatus = "danger"
          else if (totalPnl > 0) newStatus = "profit"
          else if (totalPnl < 0) newStatus = "loss"
          return { ...s, positions: updatedPositions, totalPnl, totalPnlPercent: totalPnl / 100, status: newStatus }
        }),
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const eventInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        const activeStrategies = strategies.filter((s) => s.status !== "inactive" && s.positions.length > 0)
        if (activeStrategies.length > 0) {
          const randomStrategy = activeStrategies[Math.floor(Math.random() * activeStrategies.length)]
          const randomPosition = randomStrategy.positions[Math.floor(Math.random() * randomStrategy.positions.length)]
          const events: TradeEvent[] = ["open_long", "open_short", "close"]
          const randomEvent = events[Math.floor(Math.random() * events.length)]
          setStrategies((prev) =>
            prev.map((s) =>
              s.id === randomStrategy.id
                ? { ...s, lastEvent: randomEvent, lastEventAsset: randomPosition.asset, eventTimestamp: Date.now() }
                : s,
            ),
          )
        }
      }
    }, 5000)
    return () => clearInterval(eventInterval)
  }, [strategies])

  const toggleStrategy = (id: string) => {
    setStrategies((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === "inactive" ? "active" : "inactive",
              positions: s.status === "inactive" ? s.positions : [],
              totalPnl: s.status === "inactive" ? s.totalPnl : 0,
              totalPnlPercent: s.status === "inactive" ? s.totalPnlPercent : 0,
            }
          : s,
      ),
    )
  }

  const deleteStrategy = (id: string) => {
    setStrategies((prev) => prev.filter((s) => s.id !== id))
  }

  const activeCount = strategies.filter((s) => s.status !== "inactive").length
  const totalPositions = strategies.reduce((sum, s) => sum + s.positions.length, 0)
  const totalPnl = strategies.reduce((sum, s) => sum + s.totalPnl, 0)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#ffffff10]">
        <div className="flex items-center gap-2">
          <span className="text-[8px] px-1 py-0.5 border border-[#00ffff30] text-[#00ffff]">{activeCount} LIVE</span>
          <span className="text-[8px] px-1 py-0.5 border border-[#ffffff20] text-[#ffffff50]">
            {totalPositions} POS
          </span>
        </div>
        <div className={`text-[11px] font-mono font-bold ${totalPnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
          Σ {totalPnl >= 0 ? "+" : ""}
          {totalPnl.toFixed(2)}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
        {strategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            onToggle={() => toggleStrategy(strategy.id)}
            isExpanded={expandedId === strategy.id}
            onExpand={() => setExpandedId(expandedId === strategy.id ? null : strategy.id)}
            onDelete={() => deleteStrategy(strategy.id)}
          />
        ))}
      </div>
      <div className="flex gap-1 mt-2 pt-1 border-t border-[#ffffff10]">
        <button className="flex-1 py-1 text-[9px] border border-[#22c55e50] text-[#22c55e] hover:bg-[#22c55e15] transition-all">
          [ START ALL ]
        </button>
        <button className="flex-1 py-1 text-[9px] border border-[#ef444450] text-[#ef4444] hover:bg-[#ef444415] transition-all">
          [ STOP ALL ]
        </button>
      </div>
    </div>
  )
}

export function RightPanel() {
  const [activeView, setActiveView] = useState<"confluence" | "funding" | "strategies">("confluence")

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      <div className="flex gap-1">
        <button
          onClick={() => setActiveView("confluence")}
          className={`flex-1 py-1 text-[9px] font-bold border transition-all ${
            activeView === "confluence"
              ? "border-[#00ffff] bg-[#00ffff15] text-[#00ffff]"
              : "border-[#ffffff20] text-[#ffffff40] hover:border-[#ffffff40]"
          }`}
        >
          CONFLUENCE
        </button>
        <button
          onClick={() => setActiveView("funding")}
          className={`flex-1 py-1 text-[9px] font-bold border transition-all ${
            activeView === "funding"
              ? "border-[#facc15] bg-[#facc1515] text-[#facc15]"
              : "border-[#ffffff20] text-[#ffffff40] hover:border-[#ffffff40]"
          }`}
        >
          FUNDING
        </button>
        <button
          onClick={() => setActiveView("strategies")}
          className={`flex-1 py-1 text-[9px] font-bold border transition-all ${
            activeView === "strategies"
              ? "border-[#a855f7] bg-[#a855f715] text-[#a855f7]"
              : "border-[#ffffff20] text-[#ffffff40] hover:border-[#ffffff40]"
          }`}
        >
          STRATEGIES
        </button>
      </div>

      <div className="flex-1 neon-border glass-panel overflow-hidden">
        {activeView === "confluence" && <ConfluencePanel />}
        {activeView === "funding" && <FundingRateMonitor />}
        {activeView === "strategies" && <StrategiesPanel />}
      </div>
    </div>
  )
}
