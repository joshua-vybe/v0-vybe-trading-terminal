"use client"

import { useState, useEffect } from "react"
import { getNextFundingTime } from "@/lib/hyperliquid"

interface FundingData {
  symbol: string
  rate: number
  predicted: number
  apr: number
  premium: number
  direction: "long" | "short"
}

// Mock funding data - in production would come from Hyperliquid API
const MOCK_FUNDING: FundingData[] = [
  { symbol: "BTC", rate: 0.0032, predicted: 0.0035, apr: 10.5, premium: 0.12, direction: "long" },
  { symbol: "ETH", rate: 0.0041, predicted: 0.0038, apr: 13.5, premium: 0.18, direction: "long" },
  { symbol: "SOL", rate: 0.0052, predicted: 0.0058, apr: 17.2, premium: 0.25, direction: "long" },
  { symbol: "WIF", rate: 0.0125, predicted: 0.0118, apr: 41.2, premium: 0.85, direction: "long" },
  { symbol: "PEPE", rate: 0.0098, predicted: 0.0102, apr: 32.1, premium: 0.62, direction: "long" },
  { symbol: "DOGE", rate: 0.0076, predicted: 0.0071, apr: 24.8, premium: 0.42, direction: "long" },
  { symbol: "ARB", rate: -0.0015, predicted: -0.0012, apr: -4.9, premium: -0.08, direction: "short" },
  { symbol: "OP", rate: 0.0028, predicted: 0.0031, apr: 9.2, premium: 0.15, direction: "long" },
]

export function FundingRateMonitor() {
  const [fundingData, setFundingData] = useState<FundingData[]>(MOCK_FUNDING)
  const [countdown, setCountdown] = useState("")
  const [sortBy, setSortBy] = useState<"rate" | "apr">("apr")

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const next = getNextFundingTime()
      const diff = next.getTime() - now.getTime()
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const sortedData = [...fundingData].sort((a, b) => {
    if (sortBy === "rate") return Math.abs(b.rate) - Math.abs(a.rate)
    return Math.abs(b.apr) - Math.abs(a.apr)
  })

  return (
    <div className="p-2 h-full flex flex-col text-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-[#facc15] rounded-full animate-pulse" />
          <span className="text-[#facc15] font-mono text-[10px] font-bold">FUNDING RATES</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#ffffff40]">NEXT:</span>
          <span className="text-[#facc15] font-mono font-bold">{countdown}</span>
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setSortBy("apr")}
          className={`px-2 py-0.5 text-[8px] border transition-all ${
            sortBy === "apr" ? "border-[#facc15] text-[#facc15] bg-[#facc1515]" : "border-[#ffffff20] text-[#ffffff40]"
          }`}
        >
          BY APR
        </button>
        <button
          onClick={() => setSortBy("rate")}
          className={`px-2 py-0.5 text-[8px] border transition-all ${
            sortBy === "rate" ? "border-[#facc15] text-[#facc15] bg-[#facc1515]" : "border-[#ffffff20] text-[#ffffff40]"
          }`}
        >
          BY RATE
        </button>
      </div>

      {/* Funding Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full">
          <thead className="sticky top-0 bg-black/90">
            <tr className="text-[#ffffff40] text-[9px]">
              <th className="text-left pb-1 font-normal">ASSET</th>
              <th className="text-right pb-1 font-normal">RATE</th>
              <th className="text-right pb-1 font-normal">APR</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <tr key={item.symbol} className="border-t border-[#ffffff08] hover:bg-[#ffffff05]">
                <td className="py-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-white font-medium">{item.symbol}</span>
                    <span
                      className={`text-[7px] px-1 ${
                        item.direction === "long" ? "text-[#22c55e] bg-[#22c55e15]" : "text-[#ef4444] bg-[#ef444415]"
                      }`}
                    >
                      {item.direction === "long" ? "L PAY" : "S PAY"}
                    </span>
                  </div>
                </td>
                <td className={`py-1.5 text-right font-mono ${item.rate >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  {item.rate >= 0 ? "+" : ""}
                  {(item.rate * 100).toFixed(4)}%
                </td>
                <td
                  className={`py-1.5 text-right font-mono font-bold ${
                    item.apr >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                  }`}
                >
                  {item.apr >= 0 ? "+" : ""}
                  {item.apr.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-[#ffffff10] text-[8px] text-[#ffffff40]">
        <div className="flex justify-between">
          <span>L PAY = Longs pay shorts</span>
          <span>Rates per 8h</span>
        </div>
      </div>
    </div>
  )
}
