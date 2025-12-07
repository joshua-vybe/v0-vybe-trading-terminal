"use client"

import { useState } from "react"

type OrderType = "market" | "limit" | "stop-limit" | "stop-market" | "trailing" | "twap"

const LEVERAGE_PRESETS = [1, 5, 10, 20, 50, 100]

export function OrderEntry() {
  const [side, setSide] = useState<"long" | "short">("long")
  const [size, setSize] = useState("0.00")
  const [price, setPrice] = useState("43292.51")
  const [stopPrice, setStopPrice] = useState("43000.00")
  const [trailPercent, setTrailPercent] = useState("1.0")
  const [orderType, setOrderType] = useState<OrderType>("limit")
  const [leverage, setLeverage] = useState(10)
  const [reduceOnly, setReduceOnly] = useState(false)
  const [postOnly, setPostOnly] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLeverageSelector, setShowLeverageSelector] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => setIsSubmitting(false), 1500)
  }

  const needsPrice = orderType === "limit" || orderType === "stop-limit"
  const needsStopPrice = orderType === "stop-limit" || orderType === "stop-market"
  const needsTrail = orderType === "trailing"

  return (
    <div className="neon-border glass-panel p-2 text-[11px] h-[260px] flex flex-col relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[#00ffff60]">ORDER • ORDERLY</span>
        <div className="flex gap-2 text-[10px]">
          <label className="flex items-center gap-0.5 cursor-pointer">
            <input
              type="checkbox"
              checked={reduceOnly}
              onChange={(e) => setReduceOnly(e.target.checked)}
              className="w-2.5 h-2.5 accent-[#00ffff]"
            />
            <span className="text-[#ffffff50]">RDC</span>
          </label>
          <label className="flex items-center gap-0.5 cursor-pointer">
            <input
              type="checkbox"
              checked={postOnly}
              onChange={(e) => setPostOnly(e.target.checked)}
              className="w-2.5 h-2.5 accent-[#00ffff]"
            />
            <span className="text-[#ffffff50]">PST</span>
          </label>
        </div>
      </div>

      {/* Side Buttons */}
      <div className="flex gap-1 mb-1">
        <button
          onClick={() => setSide("long")}
          className={`flex-1 py-1 font-bold border transition-all text-[10px] ${
            side === "long" ? "border-[#00ffff] glow-cyan bg-[#00ffff15]" : "border-[#ffffff20] text-[#ffffff40]"
          }`}
        >
          ▲ LONG
        </button>
        <button
          onClick={() => setSide("short")}
          className={`flex-1 py-1 font-bold border transition-all text-[10px] ${
            side === "short" ? "border-[#ff00ff] glow-magenta bg-[#ff00ff15]" : "border-[#ffffff20] text-[#ffffff40]"
          }`}
        >
          ▼ SHORT
        </button>
      </div>

      {/* Order Type Grid - 2 rows of 3 */}
      <div className="grid grid-cols-3 gap-0.5 mb-1">
        {(["market", "limit", "stop-limit", "stop-market", "trailing", "twap"] as OrderType[]).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`py-0.5 border text-[9px] uppercase transition-all ${
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

      <div className="grid grid-cols-2 gap-1 mb-1">
        {/* Size */}
        <div>
          <div className="text-[#00ffff40] text-[9px] mb-0.5">SIZE (BTC)</div>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full bg-black border border-[#00ffff30] px-1 py-0.5 text-[11px] glow-cyan focus:border-[#00ffff] focus:outline-none"
          />
        </div>

        {/* Leverage Selector Button */}
        <div>
          <div className="text-[#facc1580] text-[9px] mb-0.5">LEVERAGE</div>
          <button
            type="button"
            onClick={() => setShowLeverageSelector(!showLeverageSelector)}
            className="w-full bg-black border border-[#facc1550] px-1 py-0.5 text-[11px] text-[#facc15] font-bold hover:border-[#facc15] hover:bg-[#facc1510] transition-all flex items-center justify-center gap-1"
          >
            <span>{leverage}x</span>
            <span className="text-[8px]">▼</span>
          </button>
        </div>
      </div>

      {showLeverageSelector && (
        <div className="absolute left-2 right-2 top-[115px] z-50 bg-black/95 border border-[#facc15] p-2 shadow-lg shadow-[#facc1520]">
          <div className="text-[9px] text-[#facc15] mb-2">SELECT LEVERAGE</div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-6 gap-1 mb-2">
            {LEVERAGE_PRESETS.map((lev) => (
              <button
                key={lev}
                type="button"
                onClick={() => {
                  setLeverage(lev)
                  setShowLeverageSelector(false)
                }}
                className={`py-1 border text-[10px] font-mono transition-all ${
                  leverage === lev
                    ? "border-[#facc15] bg-[#facc15]/20 text-[#facc15]"
                    : "border-[#ffffff20] text-[#ffffff60] hover:border-[#facc1550] hover:text-[#facc15]"
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="mb-2">
            <input
              type="range"
              min={1}
              max={100}
              value={leverage}
              onChange={(e) => setLeverage(Number.parseInt(e.target.value))}
              className="w-full h-1 accent-[#facc15] cursor-pointer"
              style={{
                background: `linear-gradient(to right, #facc15 0%, #facc15 ${leverage}%, #333 ${leverage}%, #333 100%)`,
              }}
            />
            <div className="flex justify-between text-[8px] text-[#ffffff40] mt-1">
              <span>1x</span>
              <span className="text-[#facc15] font-bold">{leverage}x</span>
              <span>100x</span>
            </div>
          </div>

          {/* Risk Warning */}
          <div
            className={`text-[8px] text-center py-1 border ${
              leverage >= 50
                ? "border-red-500/50 text-red-400 bg-red-500/10"
                : leverage >= 20
                  ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                  : "border-green-500/50 text-green-400 bg-green-500/10"
            }`}
          >
            {leverage >= 50 ? "⚠ EXTREME RISK" : leverage >= 20 ? "⚡ HIGH RISK" : "✓ MODERATE RISK"}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setShowLeverageSelector(false)}
            className="w-full mt-2 py-1 border border-[#ffffff20] text-[#ffffff60] text-[9px] hover:border-[#ffffff40]"
          >
            CLOSE
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1 mb-1">
        {/* Price / Trigger */}
        <div>
          <div
            className={`text-[9px] mb-0.5 ${needsPrice || needsStopPrice ? "text-[#ff00ff80]" : "text-[#ffffff20]"}`}
          >
            {needsStopPrice ? "TRIGGER" : "PRICE"}
          </div>
          <input
            type="text"
            value={needsStopPrice ? stopPrice : price}
            onChange={(e) => (needsStopPrice ? setStopPrice(e.target.value) : setPrice(e.target.value))}
            disabled={!needsPrice && !needsStopPrice}
            className={`w-full bg-black border px-1 py-0.5 text-[11px] focus:outline-none ${
              needsPrice || needsStopPrice
                ? "border-[#ff00ff30] text-[#ff00ff] focus:border-[#ff00ff]"
                : "border-[#ffffff10] text-[#ffffff20] cursor-not-allowed"
            }`}
          />
        </div>

        {/* Limit price for stop-limit OR Trail % OR empty */}
        <div>
          <div
            className={`text-[9px] mb-0.5 ${needsTrail ? "text-[#facc15]" : orderType === "stop-limit" ? "text-[#00ffff60]" : "text-[#ffffff20]"}`}
          >
            {needsTrail ? "TRAIL %" : orderType === "stop-limit" ? "LMT PRICE" : "—"}
          </div>
          <input
            type="text"
            value={needsTrail ? trailPercent : orderType === "stop-limit" ? price : ""}
            onChange={(e) => (needsTrail ? setTrailPercent(e.target.value) : setPrice(e.target.value))}
            disabled={!needsTrail && orderType !== "stop-limit"}
            className={`w-full bg-black border px-1 py-0.5 text-[11px] focus:outline-none ${
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
        className={`w-full py-1.5 font-bold border transition-all text-[11px] mt-auto ${
          side === "long"
            ? "border-[#00ffff] glow-cyan hover:bg-[#00ffff20] text-[#00ffff]"
            : "border-[#ff00ff] glow-magenta hover:bg-[#ff00ff20] text-[#ff00ff]"
        } ${isSubmitting ? "animate-pulse" : ""}`}
      >
        {isSubmitting ? "◎ TRANSMITTING..." : `◉ ${side.toUpperCase()} ${leverage}x ${orderType.toUpperCase()}`}
      </button>

      {/* Quick Stats Row */}
      <div className="mt-1 flex justify-between text-[9px] text-[#ffffff40]">
        <span>BAL: 2.45 BTC</span>
        <span>FEE: 0.02%</span>
        <span>LIQ: ${(43292 - (43292 / leverage) * 0.9).toFixed(0)}</span>
      </div>
    </div>
  )
}
