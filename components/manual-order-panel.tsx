"use client"

import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"

type OrderSide = "BUY" | "SELL"
type OrderType =
  | "MARKET"
  | "LIMIT"
  | "STOP_MARKET"
  | "STOP_LIMIT"
  | "TRAILING_STOP"
  | "ICEBERG"
  | "TWAP"
  | "POST_ONLY"
  | "IOC"
  | "FOK"
  | "BRACKET"
  | "OCO"
  | "OSO"

interface OrderFormData {
  side: OrderSide
  orderType: OrderType
  quantity: string
  limitPrice: string
  stopPrice: string
  trailingAmount: string
  icebergVisible: string
  twapDuration: string
  takeProfitPrice: string
  stopLossPrice: string
  reduceOnly: boolean
  postOnly: boolean
  timeInForce: "GTC" | "IOC" | "FOK"
}

export function ManualOrderPanel() {
  const { theme } = useTheme()
  const [formData, setFormData] = useState<OrderFormData>({
    side: "BUY",
    orderType: "LIMIT",
    quantity: "",
    limitPrice: "",
    stopPrice: "",
    trailingAmount: "",
    icebergVisible: "",
    twapDuration: "",
    takeProfitPrice: "",
    stopLossPrice: "",
    reduceOnly: false,
    postOnly: false,
    timeInForce: "GTC",
  })

  const orderTypes = [
    { value: "MARKET", label: "Market" },
    { value: "LIMIT", label: "Limit" },
    { value: "STOP_MARKET", label: "Stop Market" },
    { value: "STOP_LIMIT", label: "Stop Limit" },
    { value: "TRAILING_STOP", label: "Trailing Stop" },
    { value: "ICEBERG", label: "Iceberg" },
    { value: "TWAP", label: "TWAP" },
    { value: "POST_ONLY", label: "Post Only" },
    { value: "IOC", label: "IOC" },
    { value: "FOK", label: "FOK" },
    { value: "BRACKET", label: "Bracket" },
    { value: "OCO", label: "OCO" },
    { value: "OSO", label: "OSO" },
  ]

  const handleSubmit = () => {
    console.log("[v0] Order submitted:", formData)
    // TODO: Connect to actual order submission API
  }

  const needsLimitPrice = ["LIMIT", "STOP_LIMIT", "ICEBERG", "POST_ONLY", "BRACKET", "OCO", "OSO"].includes(
    formData.orderType,
  )
  const needsStopPrice = ["STOP_MARKET", "STOP_LIMIT", "TRAILING_STOP", "OCO"].includes(formData.orderType)
  const needsTrailing = formData.orderType === "TRAILING_STOP"
  const needsIceberg = formData.orderType === "ICEBERG"
  const needsTwap = formData.orderType === "TWAP"
  const needsBracket = formData.orderType === "BRACKET"
  const needsOCO = formData.orderType === "OCO"

  return (
    <div className="h-full flex flex-col gap-2 p-2 overflow-y-auto">
      {/* Order Side */}
      <div className="flex gap-2">
        <button
          onClick={() => setFormData({ ...formData, side: "BUY" })}
          className={`flex-1 py-2 text-xs font-bold border transition-all ${
            formData.side === "BUY"
              ? theme === "RETRO"
                ? "border-[#22c55e] bg-[#22c55e15] text-[#22c55e]"
                : "border-green-500 bg-green-500/10 text-green-500"
              : theme === "RETRO"
                ? "border-[#ffffff20] text-[#ffffff40] hover:border-[#ffffff40]"
                : "border-border text-muted-foreground hover:border-muted"
          }`}
        >
          BUY / LONG
        </button>
        <button
          onClick={() => setFormData({ ...formData, side: "SELL" })}
          className={`flex-1 py-2 text-xs font-bold border transition-all ${
            formData.side === "SELL"
              ? theme === "RETRO"
                ? "border-[#ef4444] bg-[#ef444415] text-[#ef4444]"
                : "border-red-500 bg-red-500/10 text-red-500"
              : theme === "RETRO"
                ? "border-[#ffffff20] text-[#ffffff40] hover:border-[#ffffff40]"
                : "border-border text-muted-foreground hover:border-muted"
          }`}
        >
          SELL / SHORT
        </button>
      </div>

      {/* Order Type Selection */}
      <div>
        <label className="text-[10px] text-muted-foreground mb-1 block">ORDER TYPE</label>
        <select
          value={formData.orderType}
          onChange={(e) => setFormData({ ...formData, orderType: e.target.value as OrderType })}
          className={`w-full text-xs p-2 focus:outline-none transition-colors ${
            theme === "RETRO"
              ? "bg-black border border-[#00ffff] text-[#00ffff] focus:border-[#ff00ff] [&>option]:bg-black [&>option]:text-[#00ffff]"
              : "bg-background border border-primary text-foreground focus:border-accent [&>option]:bg-background [&>option]:text-foreground"
          }`}
        >
          {orderTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div>
        <label className="text-[10px] text-muted-foreground mb-1 block">QUANTITY</label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          placeholder="0.00"
          className="w-full bg-background border border-border text-foreground text-xs p-2 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Limit Price */}
      {needsLimitPrice && (
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">LIMIT PRICE</label>
          <input
            type="number"
            value={formData.limitPrice}
            onChange={(e) => setFormData({ ...formData, limitPrice: e.target.value })}
            placeholder="0.00"
            className="w-full bg-background border border-border text-foreground text-xs p-2 focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Stop Price */}
      {needsStopPrice && (
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">STOP PRICE</label>
          <input
            type="number"
            value={formData.stopPrice}
            onChange={(e) => setFormData({ ...formData, stopPrice: e.target.value })}
            placeholder="0.00"
            className="w-full bg-background border border-border text-foreground text-xs p-2 focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Trailing Amount */}
      {needsTrailing && (
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">TRAILING AMOUNT (%)</label>
          <input
            type="number"
            value={formData.trailingAmount}
            onChange={(e) => setFormData({ ...formData, trailingAmount: e.target.value })}
            placeholder="0.00"
            className="w-full bg-background border border-border text-foreground text-xs p-2 focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Iceberg Visible Amount */}
      {needsIceberg && (
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">VISIBLE QUANTITY</label>
          <input
            type="number"
            value={formData.icebergVisible}
            onChange={(e) => setFormData({ ...formData, icebergVisible: e.target.value })}
            placeholder="0.00"
            className="w-full bg-background border border-border text-foreground text-xs p-2 focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* TWAP Duration */}
      {needsTwap && (
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">DURATION (minutes)</label>
          <input
            type="number"
            value={formData.twapDuration}
            onChange={(e) => setFormData({ ...formData, twapDuration: e.target.value })}
            placeholder="60"
            className="w-full bg-background border border-border text-foreground text-xs p-2 focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Bracket Orders (TP/SL) */}
      {(needsBracket || needsOCO) && (
        <>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">TAKE PROFIT PRICE</label>
            <input
              type="number"
              value={formData.takeProfitPrice}
              onChange={(e) => setFormData({ ...formData, takeProfitPrice: e.target.value })}
              placeholder="0.00"
              className="w-full bg-background border border-border text-foreground text-xs p-2 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">STOP LOSS PRICE</label>
            <input
              type="number"
              value={formData.stopLossPrice}
              onChange={(e) => setFormData({ ...formData, stopLossPrice: e.target.value })}
              placeholder="0.00"
              className="w-full bg-background border border-border text-foreground text-xs p-2 focus:outline-none focus:border-primary"
            />
          </div>
        </>
      )}

      {/* Options */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={formData.reduceOnly}
            onChange={(e) => setFormData({ ...formData, reduceOnly: e.target.checked })}
            className="accent-primary"
          />
          <span className="text-muted-foreground">Reduce Only</span>
        </label>
        {formData.orderType === "LIMIT" && (
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={formData.postOnly}
              onChange={(e) => setFormData({ ...formData, postOnly: e.target.checked })}
              className="accent-primary"
            />
            <span className="text-muted-foreground">Post Only</span>
          </label>
        )}
      </div>

      {/* Time in Force */}
      {!["MARKET", "IOC", "FOK"].includes(formData.orderType) && (
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">TIME IN FORCE</label>
          <select
            value={formData.timeInForce}
            onChange={(e) => setFormData({ ...formData, timeInForce: e.target.value as "GTC" | "IOC" | "FOK" })}
            className={`w-full text-xs p-2 focus:outline-none transition-colors ${
              theme === "RETRO"
                ? "bg-black border border-[#00ffff] text-[#00ffff] focus:border-[#ff00ff] [&>option]:bg-black [&>option]:text-[#00ffff]"
                : "bg-background border border-primary text-foreground focus:border-accent [&>option]:bg-background [&>option]:text-foreground"
            }`}
          >
            <option value="GTC">Good Till Cancel</option>
            <option value="IOC">Immediate or Cancel</option>
            <option value="FOK">Fill or Kill</option>
          </select>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className={`w-full py-3 text-xs font-bold border transition-all mt-2 ${
          formData.side === "BUY"
            ? theme === "RETRO"
              ? "border-[#22c55e] bg-[#22c55e15] text-[#22c55e] hover:bg-[#22c55e25]"
              : "border-green-500 bg-green-500/10 text-green-500 hover:bg-green-500/20"
            : theme === "RETRO"
              ? "border-[#ef4444] bg-[#ef444415] text-[#ef4444] hover:bg-[#ef444425]"
              : "border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20"
        }`}
      >
        SUBMIT {formData.side} ORDER
      </button>

      {/* Order Summary */}
      <div className="text-[9px] text-muted-foreground space-y-1 mt-2 p-2 border border-border">
        <div className="font-bold text-foreground mb-1">ORDER SUMMARY</div>
        <div>Side: {formData.side}</div>
        <div>Type: {orderTypes.find((t) => t.value === formData.orderType)?.label}</div>
        <div>Quantity: {formData.quantity || "—"}</div>
        {needsLimitPrice && <div>Limit: {formData.limitPrice || "—"}</div>}
        {needsStopPrice && <div>Stop: {formData.stopPrice || "—"}</div>}
        {needsTrailing && <div>Trail: {formData.trailingAmount || "—"}%</div>}
        {needsBracket && (
          <>
            <div>TP: {formData.takeProfitPrice || "—"}</div>
            <div>SL: {formData.stopLossPrice || "—"}</div>
          </>
        )}
      </div>
    </div>
  )
}
