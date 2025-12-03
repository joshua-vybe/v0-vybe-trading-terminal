"use client"

import { useState } from "react"

interface OrderEntryProps {
  venue: string
}

type OrderType = "market" | "limit" | "stop-limit" | "stop-market" | "trailing" | "twap"

export function OrderEntry({ venue }: OrderEntryProps) {
  const [side, setSide] = useState<"long" | "short">("long")
  const [size, setSize] = useState("0.00")
  const [price, setPrice] = useState("43292.51")
  const [stopPrice, setStopPrice] = useState("43000.00")
  const [trailPercent, setTrailPercent] = useState("1.0")
  const [orderType, setOrderType] = useState<OrderType>("limit")
  const [leverage, setLeverage] = useState("10")
  const [reduceOnly, setReduceOnly] = useState(false)
  const [postOnly, setPostOnly] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => setIsSubmitting(false), 1500)
  }

  const needsPrice = orderType === "limit" || orderType === "stop-limit"
  const needsStopPrice = orderType === "stop-limit" || orderType === "stop-market"
  const needsTrail = orderType === "trailing"

  return (
    <div className="neon-border glass-panel p-2 text-[9px] h-[200px] flex flex-col">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[#00ffff60]">ORDER • {venue}</span>
        <div className="flex gap-2 text-[8px]">
          <label className="flex items-center gap-0.5 cursor-pointer">
            <input
              type="checkbox"
              checked={reduceOnly}
              onChange={(e) => setReduceOnly(e.target.checked)}
              className="w-2 h-2 accent-[#00ffff]"
            />
            <span className="text-[#ffffff50]">RDC</span>
          </label>
          <label className="flex items-center gap-0.5 cursor-pointer">
            <input
              type="checkbox"
              checked={postOnly}
              onChange={(e) => setPostOnly(e.target.checked)}
              className="w-2 h-2 accent-[#00ffff]"
            />
            <span className="text-[#ffffff50]">PST</span>
          </label>
        </div>
      </div>

      {/* Side Buttons */}
      <div className="flex gap-1 mb-1.5">
        <button
          onClick={() => setSide("long")}
          className={`flex-1 py-1 font-bold border transition-all text-[8px] ${
            side === "long" ? "border-[#00ffff] glow-cyan bg-[#00ffff15]" : "border-[#ffffff20] text-[#ffffff40]"
          }`}
        >
          ▲ LONG
        </button>
        <button
          onClick={() => setSide("short")}
          className={`flex-1 py-1 font-bold border transition-all text-[8px] ${
            side === "short" ? "border-[#ff00ff] glow-magenta bg-[#ff00ff15]" : "border-[#ffffff20] text-[#ffffff40]"
          }`}
        >
          ▼ SHORT
        </button>
      </div>

      {/* Order Type Grid - 2 rows of 3 */}
      <div className="grid grid-cols-3 gap-0.5 mb-1.5">
        {(["market", "limit", "stop-limit", "stop-market", "trailing", "twap"] as OrderType[]).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`py-0.5 border text-[7px] uppercase transition-all ${
              orderType === type
                ? "border-[#00ffff] glow-cyan bg-[#00ffff10]"
                : "border-[#ffffff15] text-[#ffffff50] hover:border-[#ffffff30]"
            }`}
          >
            {type === "stop-limit"
              ? "S-LMT"
              : type === "stop-market"
                ? "S-MKT"
                : type === "trailing"
                  ? "TRAIL"
                  : type.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1 mb-1.5 flex-1">
        {/* Size - always visible */}
        <div>
          <div className="text-[#00ffff40] text-[7px] mb-0.5">SIZE (BTC)</div>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full bg-black border border-[#00ffff30] px-1 py-0.5 text-[9px] glow-cyan focus:border-[#00ffff] focus:outline-none"
          />
        </div>

        {/* Leverage - always visible */}
        <div>
          <div className="text-[#00ffff40] text-[7px] mb-0.5">LEVERAGE</div>
          <input
            type="text"
            value={leverage}
            onChange={(e) => setLeverage(e.target.value)}
            className="w-full bg-black border border-[#00ffff30] px-1 py-0.5 text-[9px] text-center glow-cyan focus:border-[#00ffff] focus:outline-none"
          />
        </div>

        {/* Price / Trigger - context dependent but always present */}
        <div>
          <div
            className={`text-[7px] mb-0.5 ${needsPrice || needsStopPrice ? "text-[#ff00ff80]" : "text-[#ffffff20]"}`}
          >
            {needsStopPrice ? "TRIGGER" : "PRICE"}
          </div>
          <input
            type="text"
            value={needsStopPrice ? stopPrice : price}
            onChange={(e) => (needsStopPrice ? setStopPrice(e.target.value) : setPrice(e.target.value))}
            disabled={!needsPrice && !needsStopPrice}
            className={`w-full bg-black border px-1 py-0.5 text-[9px] focus:outline-none ${
              needsPrice || needsStopPrice
                ? "border-[#ff00ff30] text-[#ff00ff] focus:border-[#ff00ff]"
                : "border-[#ffffff10] text-[#ffffff20] cursor-not-allowed"
            }`}
          />
        </div>

        {/* Limit price for stop-limit OR Trail % OR empty */}
        <div>
          <div
            className={`text-[7px] mb-0.5 ${needsTrail ? "text-[#facc15]" : orderType === "stop-limit" ? "text-[#00ffff60]" : "text-[#ffffff20]"}`}
          >
            {needsTrail ? "TRAIL %" : orderType === "stop-limit" ? "LMT PRICE" : "—"}
          </div>
          <input
            type="text"
            value={needsTrail ? trailPercent : orderType === "stop-limit" ? price : ""}
            onChange={(e) => (needsTrail ? setTrailPercent(e.target.value) : setPrice(e.target.value))}
            disabled={!needsTrail && orderType !== "stop-limit"}
            className={`w-full bg-black border px-1 py-0.5 text-[9px] focus:outline-none ${
              needsTrail
                ? "border-[#facc1530] text-[#facc15] focus:border-[#facc15]"
                : orderType === "stop-limit"
                  ? "border-[#00ffff30] text-[#00ffff] focus:border-[#00ffff]"
                  : "border-[#ffffff10] text-[#ffffff20] cursor-not-allowed"
            }`}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full py-1.5 font-bold border transition-all text-[10px] ${
          side === "long"
            ? "border-[#00ffff] glow-cyan hover:bg-[#00ffff20] text-[#00ffff]"
            : "border-[#ff00ff] glow-magenta hover:bg-[#ff00ff20] text-[#ff00ff]"
        } ${isSubmitting ? "animate-pulse" : ""}`}
      >
        {isSubmitting ? "◎ TRANSMITTING..." : `◉ ${side.toUpperCase()} ${orderType.toUpperCase()}`}
      </button>

      {/* Quick Stats Row */}
      <div className="mt-1 flex justify-between text-[7px] text-[#ffffff40]">
        <span>BAL: 2.45</span>
        <span>FEE: 0.02%</span>
        <span>LIQ: $41.2K</span>
      </div>
    </div>
  )
}
