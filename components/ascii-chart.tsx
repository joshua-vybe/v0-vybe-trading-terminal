"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts"
import { getVenueColor } from "@/lib/venue-colors"

type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w"

const TIMEFRAMES: { value: Timeframe; label: string; points: number }[] = [
  { value: "1m", label: "1m", points: 60 },
  { value: "5m", label: "5m", points: 60 },
  { value: "15m", label: "15m", points: 60 },
  { value: "30m", label: "30m", points: 60 },
  { value: "1h", label: "1H", points: 60 },
  { value: "4h", label: "4H", points: 60 },
  { value: "1d", label: "1D", points: 60 },
  { value: "1w", label: "1W", points: 52 },
]

const VENUES = [
  { key: "hyperliquid", name: "HL", color: "#00ffff" },
  { key: "aster", name: "AST", color: "#ff00ff" },
  { key: "nado", name: "NAD", color: "#facc15" },
  { key: "orderly", name: "ORD", color: "#22c55e" },
]

interface ChartDataPoint {
  time: number
  timeLabel: string
  hyperliquid: number
  aster: number
  nado: number
  orderly: number
}

interface Position {
  id: string
  type: "long" | "short"
  entry: number
  size: number
  venue: string
  liquidation: number
}

interface Order {
  id: string
  side: "buy" | "sell"
  orderType: "limit" | "market"
  price: number
  size: number
  venue: string
}

export function AsciiChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("1m")
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [currentPrice, setCurrentPrice] = useState(43293.51)
  const [priceChange, setPriceChange] = useState(2.34)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartHeight, setChartHeight] = useState(400)

  const tfConfig = useMemo(() => TIMEFRAMES.find((t) => t.value === timeframe)!, [timeframe])

  const positions: Position[] = useMemo(
    () => [
      { id: "p1", type: "long", entry: 43150, size: 0.5, venue: "HL", liquidation: 42100 },
      { id: "p2", type: "short", entry: 43380, size: 0.25, venue: "AST", liquidation: 44500 },
    ],
    [],
  )

  const orders: Order[] = useMemo(
    () => [
      { id: "o1", side: "buy", orderType: "limit", price: 43050, size: 0.3, venue: "HL" },
      { id: "o2", side: "sell", orderType: "limit", price: 43450, size: 0.2, venue: "NAD" },
    ],
    [],
  )

  // Generate initial data
  useEffect(() => {
    const basePrice = 43300
    const data: ChartDataPoint[] = []

    for (let i = 0; i < tfConfig.points; i++) {
      const t = i * 0.15
      const hlPrice = basePrice + Math.sin(t * 0.5) * 150 + Math.sin(t * 1.2) * 50 + Math.cos(t * 0.3) * 80
      const asterPrice =
        basePrice - 30 + Math.sin(t * 0.5 + 0.5) * 140 + Math.sin(t * 1.1) * 45 + Math.cos(t * 0.35) * 70
      const nadoPrice = basePrice - 60 + Math.sin(t * 0.5 + 1) * 130 + Math.sin(t * 1.0) * 40 + Math.cos(t * 0.4) * 60
      const orderlyPrice =
        basePrice - 90 + Math.sin(t * 0.5 + 1.5) * 120 + Math.sin(t * 0.9) * 35 + Math.cos(t * 0.45) * 50

      const time = Date.now() - (tfConfig.points - i) * 1000
      const date = new Date(time)
      const timeLabel =
        timeframe === "1d" || timeframe === "1w"
          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })

      data.push({
        time,
        timeLabel,
        hyperliquid: hlPrice,
        aster: asterPrice,
        nado: nadoPrice,
        orderly: orderlyPrice,
      })
    }

    setChartData(data)
    setCurrentPrice(data[data.length - 1]?.hyperliquid || basePrice)
  }, [timeframe, tfConfig.points])

  // Track chart container height
  useEffect(() => {
    if (chartContainerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setChartHeight(entry.contentRect.height)
        }
      })
      resizeObserver.observe(chartContainerRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [])

  // Live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        if (prev.length === 0) return prev

        const last = prev[prev.length - 1]
        const t = Date.now() * 0.001

        const newHl = last.hyperliquid + Math.sin(t) * 5 + (Math.random() - 0.5) * 3
        const newAster = last.aster + Math.sin(t + 0.5) * 4.5 + (Math.random() - 0.5) * 2.5
        const newNado = last.nado + Math.sin(t + 1) * 4 + (Math.random() - 0.5) * 2
        const newOrderly = last.orderly + Math.sin(t + 1.5) * 3.5 + (Math.random() - 0.5) * 1.5

        const time = Date.now()
        const date = new Date(time)
        const timeLabel =
          timeframe === "1d" || timeframe === "1w"
            ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })

        const newPoint: ChartDataPoint = {
          time,
          timeLabel,
          hyperliquid: newHl,
          aster: newAster,
          nado: newNado,
          orderly: newOrderly,
        }

        setCurrentPrice(newHl)
        setPriceChange(((newHl - 42300) / 42300) * 100)

        return [...prev.slice(1), newPoint]
      })
    }, 500)

    return () => clearInterval(interval)
  }, [timeframe])

  // Calculate Y-axis domain
  const { minY, maxY } = useMemo(() => {
    if (chartData.length === 0) return { minY: 43000, maxY: 43500 }
    const allPrices = chartData.flatMap((d) => [d.hyperliquid, d.aster, d.nado, d.orderly])
    // Include positions and orders in range calculation
    const positionPrices = positions.map((p) => p.entry)
    const orderPrices = orders.map((o) => o.price)
    const all = [...allPrices, ...positionPrices, ...orderPrices]
    const min = Math.min(...all)
    const max = Math.max(...all)
    const padding = (max - min) * 0.15
    return { minY: min - padding, maxY: max + padding }
  }, [chartData, positions, orders])

  const venuePrices = useMemo(() => {
    if (chartData.length === 0) return {}
    const last = chartData[chartData.length - 1]
    return {
      hyperliquid: last.hyperliquid,
      aster: last.aster,
      nado: last.nado,
      orderly: last.orderly,
    }
  }, [chartData])

  const getPnL = (position: Position) => {
    const refPrice = venuePrices.hyperliquid || currentPrice
    if (position.type === "long") {
      return (refPrice - position.entry) * position.size
    }
    return (position.entry - refPrice) * position.size
  }

  const priceToY = (price: number) => {
    const chartTop = 20 // margin top
    const chartBottom = chartHeight - 25 // margin bottom for x-axis
    const availableHeight = chartBottom - chartTop
    const priceRange = maxY - minY
    if (priceRange === 0) return chartTop
    const normalized = (maxY - price) / priceRange
    return chartTop + normalized * availableHeight
  }

  return (
    <div className="flex-1 neon-border glass-panel p-3 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="glow-cyan text-sm font-bold">BTC/USD</span>
          <span className="text-xl glow-cyan glow-pulse font-mono">
            ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xs ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(2)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
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
          <span className="text-[10px] text-cyan-700 tracking-widest ml-4">MULTI-VENUE WIRELINE</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 mb-2 text-[10px]">
        {VENUES.map((venue) => (
          <span key={venue.key} className="flex items-center gap-1">
            <span style={{ color: venue.color }}>●</span> {venue.name}
          </span>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex">
        {/* Chart area */}
        <div className="flex-1 relative" ref={chartContainerRef}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 25 }}>
              <XAxis
                dataKey="timeLabel"
                tick={{ fill: "#0e7490", fontSize: 9 }}
                tickLine={{ stroke: "#164e63" }}
                axisLine={{ stroke: "#164e63" }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={[minY, maxY]}
                tick={{ fill: "#0e7490", fontSize: 9 }}
                tickLine={{ stroke: "#164e63" }}
                axisLine={{ stroke: "#164e63" }}
                tickFormatter={(val) => val.toFixed(0)}
                width={50}
              />

              {/* Position reference lines */}
              {positions.map((pos) => (
                <ReferenceLine
                  key={pos.id}
                  y={pos.entry}
                  stroke={pos.type === "long" ? "#00ffff" : "#ff00ff"}
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
              ))}

              {/* Order reference lines */}
              {orders.map((order) => (
                <ReferenceLine
                  key={order.id}
                  y={order.price}
                  stroke={order.side === "buy" ? "#22c55e" : "#ef4444"}
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                />
              ))}

              {/* Venue lines */}
              <Line
                type="monotone"
                dataKey="hyperliquid"
                stroke="#00ffff"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                filter="drop-shadow(0 0 4px #00ffff)"
              />
              <Line
                type="monotone"
                dataKey="aster"
                stroke="#ff00ff"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                filter="drop-shadow(0 0 4px #ff00ff)"
              />
              <Line
                type="monotone"
                dataKey="nado"
                stroke="#facc15"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                filter="drop-shadow(0 0 4px #facc15)"
              />
              <Line
                type="monotone"
                dataKey="orderly"
                stroke="#22c55e"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                filter="drop-shadow(0 0 4px #22c55e)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="w-36 relative flex-shrink-0 border-l border-cyan-900/30 ml-1">
          {/* Live venue price labels */}
          {VENUES.map((venue) => {
            const price = venuePrices[venue.key as keyof typeof venuePrices]
            if (!price) return null
            const y = priceToY(price)
            return (
              <div
                key={venue.key}
                className="absolute right-0 flex items-center gap-1 transition-all duration-200"
                style={{ top: y, transform: "translateY(-50%)" }}
              >
                <div
                  className="px-1.5 py-0.5 text-[9px] font-mono font-bold"
                  style={{
                    backgroundColor: venue.color,
                    color: "#000",
                    boxShadow: `0 0 8px ${venue.color}`,
                  }}
                >
                  {price.toFixed(2)}
                </div>
              </div>
            )
          })}

          {/* Position labels */}
          {positions.map((pos) => {
            const y = priceToY(pos.entry)
            const pnl = getPnL(pos)
            const isProfit = pnl >= 0
            const venueColor = getVenueColor(pos.venue)
            return (
              <div
                key={pos.id}
                className="absolute right-0 flex flex-col items-end transition-all duration-200"
                style={{ top: y, transform: "translateY(-50%)" }}
              >
                <div
                  className="flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono font-bold"
                  style={{
                    backgroundColor: venueColor.primary,
                    color: "#000",
                    boxShadow: venueColor.glow,
                  }}
                >
                  <span>{pos.type.toUpperCase()}</span>
                  <span>{pos.size}</span>
                  <span className="opacity-70">{pos.venue}</span>
                </div>
                <div className="flex gap-1 text-[7px] font-mono mt-0.5">
                  <span className={isProfit ? "text-green-400" : "text-red-400"}>
                    {isProfit ? "+" : ""}
                    {pnl.toFixed(2)}
                  </span>
                  <span style={{ color: `${venueColor.primary}80` }}>LIQ:{pos.liquidation}</span>
                </div>
              </div>
            )
          })}

          {/* Order labels */}
          {orders.map((order) => {
            const y = priceToY(order.price)
            const venueColor = getVenueColor(order.venue)
            return (
              <div
                key={order.id}
                className="absolute right-0 flex items-center transition-all duration-200"
                style={{ top: y, transform: "translateY(-50%)" }}
              >
                <div
                  className="flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono font-bold border"
                  style={{
                    borderColor: venueColor.primary,
                    color: venueColor.primary,
                    backgroundColor: `${venueColor.primary}20`,
                  }}
                >
                  <span>{order.side === "buy" ? "BUY" : "SELL"}</span>
                  <span>{order.orderType.toUpperCase()}</span>
                  <span>{order.size}</span>
                  <span className="opacity-70">{order.venue}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
