"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import * as LightweightCharts from "lightweight-charts"
import { useConfluence, TIMEFRAMES } from "@/contexts/confluence-context"

interface Position {
  id: string
  type: "long" | "short"
  entry: number
  size: number
  liquidation: number
  strategy: string
  pnl: number
  pnlPercent: number
}

interface Order {
  id: string
  side: "buy" | "sell"
  orderType: "limit" | "market"
  price: number
  size: number
  strategy?: string
}

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export function TradingViewChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<LightweightCharts.IChartApi | null>(null)
  const candleSeriesRef = useRef<any>(null)
  const { timeframe, setTimeframe, totalConfluence, currentAction, isQuantumEnhanced } = useConfluence()
  const [currentPrice, setCurrentPrice] = useState(43293.51)
  const [priceChange, setPriceChange] = useState(2.34)

  const getScoreColor = (score: number) => {
    if (score >= 88) return "#22c55e"
    if (score >= 78) return "#facc15"
    return "#ef4444"
  }

  const getScoreText = (score: number) => {
    if (score >= 88) return "FULL SIZE"
    if (score >= 78) return "REGULAR"
    return "NO TRADE"
  }

  const positions: Position[] = useMemo(
    () => [
      {
        id: "p1",
        type: "long",
        entry: 43150,
        size: 0.5,
        liquidation: 42100,
        strategy: "MOMENTUM_SCALPER",
        pnl: 234.5,
        pnlPercent: 2.34,
      },
      {
        id: "p2",
        type: "short",
        entry: 43380,
        size: 0.25,
        liquidation: 44500,
        strategy: "MEAN_REVERSION",
        pnl: -87.25,
        pnlPercent: -1.12,
      },
      {
        id: "p3",
        type: "long",
        entry: 43050,
        size: 0.15,
        liquidation: 41800,
        strategy: "BREAKOUT_V2",
        pnl: 156.8,
        pnlPercent: 3.45,
      },
    ],
    [],
  )

  const orders: Order[] = useMemo(
    () => [
      { id: "o1", side: "buy", orderType: "limit", price: 43050, size: 0.3, strategy: "MOMENTUM_SCALPER" },
      { id: "o2", side: "sell", orderType: "limit", price: 43450, size: 0.2, strategy: "MEAN_REVERSION" },
    ],
    [],
  )

  // Generate initial candle data
  const generateCandleData = (numCandles: number): CandleData[] => {
    const data: CandleData[] = []
    let basePrice = 43000
    const now = Math.floor(Date.now() / 1000)

    for (let i = numCandles; i > 0; i--) {
      const time = now - i * 60
      const volatility = 50 + Math.random() * 100
      const trend = Math.sin(i * 0.05) * 30

      const open = basePrice + trend
      const close = open + (Math.random() - 0.48) * volatility
      const high = Math.max(open, close) + Math.random() * volatility * 0.5
      const low = Math.min(open, close) - Math.random() * volatility * 0.5

      data.push({ time, open, high, low, close })
      basePrice = close
    }

    return data
  }

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = LightweightCharts.createChart(chartContainerRef.current, {
      layout: {
        background: { type: LightweightCharts.ColorType.Solid, color: "transparent" },
        textColor: "#0e7490",
        fontFamily: "'IBM Plex Mono', monospace",
      },
      grid: {
        vertLines: { color: "#164e6320" },
        horzLines: { color: "#164e6320" },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: { color: "#00ffff50", width: 1, style: LightweightCharts.LineStyle.Dashed },
        horzLine: { color: "#00ffff50", width: 1, style: LightweightCharts.LineStyle.Dashed },
      },
      rightPriceScale: {
        borderColor: "#164e63",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "#164e63",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    })

    let candleSeries: any

    // Try v4+ API first, fall back to v3 API
    if (typeof (chart as any).addCandlestickSeries === "function") {
      candleSeries = (chart as any).addCandlestickSeries({
        upColor: "#00ffff",
        downColor: "#ff00ff",
        borderUpColor: "#00ffff",
        borderDownColor: "#ff00ff",
        wickUpColor: "#00ffff",
        wickDownColor: "#ff00ff",
      })
    } else if (typeof chart.addSeries === "function") {
      // v5 API
      candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
        upColor: "#00ffff",
        downColor: "#ff00ff",
        borderUpColor: "#00ffff",
        borderDownColor: "#ff00ff",
        wickUpColor: "#00ffff",
        wickDownColor: "#ff00ff",
      })
    }

    if (!candleSeries) {
      console.error("[v0] Could not create candlestick series")
      return
    }

    positions.forEach((pos) => {
      const pnlSign = pos.pnl >= 0 ? "+" : ""

      candleSeries.createPriceLine({
        price: pos.entry,
        color: pos.type === "long" ? "#00ffff" : "#ff00ff",
        lineWidth: 2,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true,
        title: `${pos.type.toUpperCase()} ${pos.size} | ${pos.strategy} | ${pnlSign}$${Math.abs(pos.pnl).toFixed(0)} (${pnlSign}${pos.pnlPercent.toFixed(1)}%)`,
      })

      candleSeries.createPriceLine({
        price: pos.liquidation,
        color: "#ef444480",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dotted,
        axisLabelVisible: true,
        title: "LIQ",
      })
    })

    orders.forEach((order) => {
      candleSeries.createPriceLine({
        price: order.price,
        color: order.side === "buy" ? "#22c55e80" : "#ef444480",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: `${order.side.toUpperCase()} ${order.size}${order.strategy ? ` | ${order.strategy}` : ""}`,
      })
    })

    // Set initial data
    const initialData = generateCandleData(100)
    candleSeries.setData(initialData as any)
    setCurrentPrice(initialData[initialData.length - 1].close)

    chartRef.current = chart
    candleSeriesRef.current = candleSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainerRef.current)
    handleResize()

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [positions, orders])

  // Live updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!candleSeriesRef.current) return

      const now = Math.floor(Date.now() / 1000)
      const volatility = 20 + Math.random() * 30
      const newPrice = currentPrice + (Math.random() - 0.48) * volatility

      const candle: CandleData = {
        time: now,
        open: currentPrice,
        high: Math.max(currentPrice, newPrice) + Math.random() * 10,
        low: Math.min(currentPrice, newPrice) - Math.random() * 10,
        close: newPrice,
      }

      candleSeriesRef.current.update(candle as any)
      setCurrentPrice(newPrice)
      setPriceChange(((newPrice - 42300) / 42300) * 100)
    }, 1000)

    return () => clearInterval(interval)
  }, [currentPrice])

  return (
    <div className="flex-1 neon-border glass-panel p-3 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-cyan-600 tracking-wider">HYPERLIQUID</span>
          <span className="glow-cyan text-sm font-bold">BTC-PERP</span>
          <span className="text-xl glow-cyan glow-pulse font-mono">
            ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xs ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(2)}%
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1 border rounded ${isQuantumEnhanced ? "quantum-glow" : ""}`}
            style={{
              borderColor: isQuantumEnhanced ? "#8b5cf6" : getScoreColor(totalConfluence),
              backgroundColor: isQuantumEnhanced ? "rgba(139, 92, 246, 0.1)" : `${getScoreColor(totalConfluence)}10`,
            }}
          >
            <div
              className="text-lg font-bold font-mono"
              style={{
                color: isQuantumEnhanced ? "#8b5cf6" : getScoreColor(totalConfluence),
                textShadow: `0 0 10px ${isQuantumEnhanced ? "#8b5cf680" : getScoreColor(totalConfluence) + "80"}`,
              }}
            >
              {totalConfluence.toFixed(1)}
            </div>
            <div className="text-left">
              <div
                className="text-[9px] font-bold tracking-wider"
                style={{ color: isQuantumEnhanced ? "#8b5cf6" : getScoreColor(totalConfluence) }}
              >
                {getScoreText(totalConfluence)}
                {isQuantumEnhanced && " Q+"}
              </div>
              <div className="text-[8px] text-cyan-500 opacity-80">{currentAction}</div>
            </div>
          </div>

          <div className="flex gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-2 py-0.5 text-[10px] font-mono border transition-all ${
                  timeframe === tf.value
                    ? "border-cyan-400 text-cyan-400 bg-cyan-400/10 glow-cyan"
                    : "border-cyan-800/50 text-cyan-700 hover:border-cyan-600 hover:text-cyan-500"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0" ref={chartContainerRef} />
    </div>
  )
}
