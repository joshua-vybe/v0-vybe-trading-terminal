"use client"

import { useState, useEffect } from "react"
import {
  type DeltaNeutralPosition,
  type AggregatedMarketData,
  getAggregatedMarketData,
  getNextFundingTime,
} from "@/lib/hyperliquid"

// Mock delta neutral positions for demonstration
const MOCK_POSITIONS: DeltaNeutralPosition[] = [
  {
    asset: "ETH",
    spotSize: 10.5,
    perpSize: -10.5,
    spotEntryPrice: 3245.5,
    perpEntryPrice: 3248.2,
    currentSpotPrice: 3312.8,
    currentPerpPrice: 3315.1,
    fundingReceived: 842.35,
    spotPnL: 706.65,
    perpPnL: -701.45,
    totalPnL: 847.55,
    netDelta: 0,
    annualizedYield: 18.4,
  },
  {
    asset: "BTC",
    spotSize: 0.85,
    perpSize: -0.85,
    spotEntryPrice: 42150.0,
    perpEntryPrice: 42180.0,
    currentSpotPrice: 43298.6,
    currentPerpPrice: 43325.4,
    fundingReceived: 1245.8,
    spotPnL: 976.31,
    perpPnL: -973.59,
    totalPnL: 1248.52,
    netDelta: 0,
    annualizedYield: 22.1,
  },
  {
    asset: "SOL",
    spotSize: 150,
    perpSize: -150,
    spotEntryPrice: 98.45,
    perpEntryPrice: 98.62,
    currentSpotPrice: 102.35,
    currentPerpPrice: 102.48,
    fundingReceived: 312.45,
    spotPnL: 585.0,
    perpPnL: -579.0,
    totalPnL: 318.45,
    netDelta: 0,
    annualizedYield: 15.8,
  },
]

type AssetEntropyState = {
  entropy: number
  history: number[]
  flipProb: number
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"
}

export function DeltaNeutralDashboard() {
  const [positions, setPositions] = useState<DeltaNeutralPosition[]>(MOCK_POSITIONS)
  const [marketData, setMarketData] = useState<AggregatedMarketData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [nextFunding, setNextFunding] = useState<Date>(getNextFundingTime())
  const [countdown, setCountdown] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [showNewPosition, setShowNewPosition] = useState(false)

  const [assetEntropy, setAssetEntropy] = useState<Record<string, AssetEntropyState>>({})

  // Initialize per-asset entropy
  useEffect(() => {
    const initialEntropy: Record<string, AssetEntropyState> = {}
    const allAssets = [
      ...MOCK_POSITIONS.map((p) => p.asset),
      "SUPER",
      "MOVE",
      "MELANIA",
      "USUAL",
      "KAITO",
      "WIF",
      "PEPE",
      "DOGE",
    ]
    allAssets.forEach((asset) => {
      const baseEntropy = 0.2 + Math.random() * 0.5
      initialEntropy[asset] = {
        entropy: baseEntropy,
        history: Array(20)
          .fill(0)
          .map(() => baseEntropy + (Math.random() - 0.5) * 0.2),
        flipProb: 5 + baseEntropy * 40,
        riskLevel: baseEntropy > 0.7 ? "HIGH" : baseEntropy > 0.45 ? "MODERATE" : "LOW",
      }
    })
    setAssetEntropy(initialEntropy)
  }, [])

  // Update per-asset entropy periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAssetEntropy((prev) => {
        const updated: Record<string, AssetEntropyState> = {}
        Object.keys(prev).forEach((asset) => {
          const curr = prev[asset]
          const delta = (Math.random() - 0.48) * 0.04
          const newEntropy = Math.max(0, Math.min(1, curr.entropy + delta))
          const newHistory = [...curr.history.slice(-19), newEntropy]
          let riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW"
          let flipProb = 5 + newEntropy * 40

          if (newEntropy > 0.75) {
            riskLevel = "CRITICAL"
            flipProb = 65 + Math.random() * 25
          } else if (newEntropy > 0.55) {
            riskLevel = "HIGH"
            flipProb = 35 + Math.random() * 25
          } else if (newEntropy > 0.35) {
            riskLevel = "MODERATE"
            flipProb = 15 + Math.random() * 15
          }

          updated[asset] = {
            entropy: newEntropy,
            history: newHistory,
            flipProb,
            riskLevel,
          }
        })
        return updated
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  // Fetch market data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const data = await getAggregatedMarketData()
      setMarketData(data)
      setIsLoading(false)
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Update funding countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const next = getNextFundingTime()
      setNextFunding(next)
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

  const totalPnL = positions.reduce((acc, p) => acc + p.totalPnL, 0)
  const totalFunding = positions.reduce((acc, p) => acc + p.fundingReceived, 0)
  const avgYield =
    positions.length > 0 ? positions.reduce((acc, p) => acc + p.annualizedYield, 0) / positions.length : 0

  // Top funding opportunities
  const topOpportunities = marketData
    .filter((m) => m.annualizedFunding && Math.abs(m.annualizedFunding) > 10)
    .slice(0, 5)

  const getEntropyColor = (entropy: number) => {
    if (entropy > 0.75) return "#ef4444"
    if (entropy > 0.55) return "#f97316"
    if (entropy > 0.35) return "#facc15"
    return "#22c55e"
  }

  const getRiskBadgeStyle = (risk: string) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-[#ef4444] text-white animate-pulse"
      case "HIGH":
        return "bg-[#f97316] text-black"
      case "MODERATE":
        return "bg-[#facc15] text-black"
      default:
        return "bg-[#22c55e] text-black"
    }
  }

  const EntropyGauge = ({ asset }: { asset: string }) => {
    const state = assetEntropy[asset]
    if (!state) return null

    return (
      <div className="flex items-center gap-1.5 text-[8px]">
        {/* Entropy value */}
        <span className="text-[#ffffff40]">S:</span>
        <span className="font-mono font-bold" style={{ color: getEntropyColor(state.entropy) }}>
          {state.entropy.toFixed(2)}
        </span>

        {/* Mini sparkline */}
        <div className="h-2.5 w-10 flex items-end gap-px">
          {state.history.slice(-10).map((e, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                height: `${e * 100}%`,
                backgroundColor: getEntropyColor(e),
                opacity: 0.4 + (i / 10) * 0.6,
              }}
            />
          ))}
        </div>

        {/* Flip probability */}
        <span className="text-[#ffffff40]">FLIP:</span>
        <span
          className={`font-mono font-bold ${
            state.flipProb > 50 ? "text-[#ef4444]" : state.flipProb > 25 ? "text-[#facc15]" : "text-[#22c55e]"
          }`}
        >
          {state.flipProb.toFixed(0)}%
        </span>

        {/* Warning icon for high risk */}
        {(state.riskLevel === "HIGH" || state.riskLevel === "CRITICAL") && (
          <span className={`${state.riskLevel === "CRITICAL" ? "text-[#ef4444] animate-pulse" : "text-[#f97316]"}`}>
            ⚠
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ffff] rounded-full animate-pulse" />
          <span className="text-[#00ffff] font-mono text-xs font-bold tracking-wider">DELTA NEUTRAL DASHBOARD</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-[#ffffff60]">
            NEXT FUNDING: <span className="text-[#facc15] font-mono">{countdown}</span>
          </div>
          <button
            onClick={() => setShowNewPosition(true)}
            className="px-2 py-0.5 text-[9px] font-bold border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff15] transition-all"
          >
            + NEW POSITION
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-black/40 border border-[#ffffff10] p-2">
          <div className="text-[9px] text-[#ffffff40] mb-1">TOTAL P&L</div>
          <div className={`text-sm font-bold font-mono ${totalPnL >= 0 ? "text-[#00ffff]" : "text-[#ff00ff]"}`}>
            {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
          </div>
        </div>
        <div className="bg-black/40 border border-[#ffffff10] p-2">
          <div className="text-[9px] text-[#ffffff40] mb-1">FUNDING EARNED</div>
          <div className="text-sm font-bold font-mono text-[#22c55e]">+${totalFunding.toFixed(2)}</div>
        </div>
        <div className="bg-black/40 border border-[#ffffff10] p-2">
          <div className="text-[9px] text-[#ffffff40] mb-1">AVG YIELD (APR)</div>
          <div className="text-sm font-bold font-mono text-[#facc15]">{avgYield.toFixed(1)}%</div>
        </div>
        <div className="bg-black/40 border border-[#ffffff10] p-2">
          <div className="text-[9px] text-[#ffffff40] mb-1">NET DELTA</div>
          <div className="text-sm font-bold font-mono text-[#00ffff]">0.00</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        {/* Active Positions */}
        <div className="flex flex-col min-h-0">
          <div className="text-[10px] text-[#ffffff60] mb-2 flex items-center justify-between">
            <span>ACTIVE DELTA NEUTRAL POSITIONS</span>
            <span className="text-[#00ffff]">{positions.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {positions.map((pos, i) => {
              const entropyState = assetEntropy[pos.asset]
              const borderColor =
                entropyState?.riskLevel === "CRITICAL"
                  ? "border-[#ef4444]"
                  : entropyState?.riskLevel === "HIGH"
                    ? "border-[#f97316]"
                    : selectedAsset === pos.asset
                      ? "border-[#00ffff]"
                      : "border-[#ffffff10]"

              return (
                <div
                  key={pos.asset}
                  onClick={() => setSelectedAsset(selectedAsset === pos.asset ? null : pos.asset)}
                  className={`bg-black/40 border p-2 cursor-pointer transition-all ${borderColor} ${
                    selectedAsset === pos.asset ? "bg-[#00ffff08]" : "hover:border-[#ffffff30]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{pos.asset}</span>
                      <span className="text-[9px] px-1 py-0.5 bg-[#00ffff15] text-[#00ffff] border border-[#00ffff30]">
                        DELTA NEUTRAL
                      </span>
                    </div>
                    <div
                      className={`text-xs font-mono font-bold ${pos.totalPnL >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}
                    >
                      {pos.totalPnL >= 0 ? "+" : ""}${pos.totalPnL.toFixed(2)}
                    </div>
                  </div>

                  <div className="mb-2 py-1 px-1.5 bg-black/40 border border-[#ffffff08]">
                    <EntropyGauge asset={pos.asset} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div>
                      <div className="text-[#22c55e40]">SPOT</div>
                      <div className="text-[#22c55e]">
                        {pos.spotSize > 0 ? "+" : ""}
                        {pos.spotSize} @ ${pos.spotEntryPrice.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#ff00ff40]">PERP</div>
                      <div className="text-[#ff00ff]">
                        {pos.perpSize > 0 ? "+" : ""}
                        {pos.perpSize} @ ${pos.perpEntryPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {selectedAsset === pos.asset && (
                    <div className="mt-2 pt-2 border-t border-[#ffffff10] grid grid-cols-3 gap-2 text-[9px]">
                      <div>
                        <div className="text-[#ffffff40]">SPOT P&L</div>
                        <div className={pos.spotPnL >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}>
                          {pos.spotPnL >= 0 ? "+" : ""}${pos.spotPnL.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#ffffff40]">PERP P&L</div>
                        <div className={pos.perpPnL >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}>
                          {pos.perpPnL >= 0 ? "+" : ""}${pos.perpPnL.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#ffffff40]">FUNDING</div>
                        <div className="text-[#facc15]">+${pos.fundingReceived.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[#ffffff40]">NET DELTA</div>
                        <div className="text-[#00ffff]">{pos.netDelta.toFixed(4)}</div>
                      </div>
                      <div>
                        <div className="text-[#ffffff40]">APR YIELD</div>
                        <div className="text-[#facc15]">{pos.annualizedYield.toFixed(1)}%</div>
                      </div>
                      <div>
                        <button className="w-full py-1 text-[8px] border border-[#ef4444] text-[#ef4444] hover:bg-[#ef444420]">
                          CLOSE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Funding Opportunities */}
        <div className="flex flex-col min-h-0">
          <div className="text-[10px] text-[#ffffff60] mb-2">TOP FUNDING OPPORTUNITIES</div>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-black/80">
                <tr className="text-[#ffffff40] text-left">
                  <th className="pb-2 font-normal">ASSET</th>
                  <th className="pb-2 font-normal">ENTROPY</th>
                  <th className="pb-2 font-normal text-right">FUNDING</th>
                  <th className="pb-2 font-normal text-right">APR</th>
                  <th className="pb-2 font-normal text-right"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-[#ffffff40]">
                      Loading market data...
                    </td>
                  </tr>
                ) : topOpportunities.length > 0 ? (
                  topOpportunities.map((market) => {
                    const entropyState = assetEntropy[market.symbol]
                    return (
                      <tr
                        key={market.symbol}
                        className={`border-t hover:bg-[#ffffff05] ${
                          entropyState?.riskLevel === "CRITICAL"
                            ? "border-[#ef4444] bg-[#ef444410]"
                            : entropyState?.riskLevel === "HIGH"
                              ? "border-[#f9731640]"
                              : "border-[#ffffff08]"
                        }`}
                      >
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <span className="text-white font-medium">{market.symbol}</span>
                            {entropyState?.riskLevel === "CRITICAL" && (
                              <span className="text-[#ef4444] animate-pulse text-[8px]">⚠</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2">
                          <EntropyGauge asset={market.symbol} />
                        </td>
                        <td
                          className={`py-2 text-right font-mono ${
                            (market.funding || 0) >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                          }`}
                        >
                          {(market.funding || 0) >= 0 ? "+" : ""}
                          {((market.funding || 0) * 100).toFixed(4)}%
                        </td>
                        <td
                          className={`py-2 text-right font-mono ${
                            (market.annualizedFunding || 0) >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                          }`}
                        >
                          {(market.annualizedFunding || 0) >= 0 ? "+" : ""}
                          {(market.annualizedFunding || 0).toFixed(1)}%
                        </td>
                        <td className="py-2 text-right">
                          <button className="px-2 py-0.5 text-[8px] border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff15]">
                            OPEN
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  // Fallback mock data if API fails
                  [
                    { symbol: "SUPER", funding: -0.1103, apr: -120.7, oi: 4.5 },
                    { symbol: "MOVE", funding: -0.0541, apr: -59.2, oi: 22.7 },
                    { symbol: "MELANIA", funding: -0.0434, apr: -47.5, oi: 13.1 },
                    { symbol: "USUAL", funding: -0.0369, apr: -40.4, oi: 36.9 },
                    { symbol: "KAITO", funding: -0.0314, apr: -34.4, oi: 3.2 },
                  ].map((market) => {
                    const entropyState = assetEntropy[market.symbol]
                    return (
                      <tr
                        key={market.symbol}
                        className={`border-t hover:bg-[#ffffff05] ${
                          entropyState?.riskLevel === "CRITICAL"
                            ? "border-[#ef4444] bg-[#ef444410]"
                            : entropyState?.riskLevel === "HIGH"
                              ? "border-[#f9731640]"
                              : "border-[#ffffff08]"
                        }`}
                      >
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <span className="text-white font-medium">{market.symbol}</span>
                            {entropyState?.riskLevel === "CRITICAL" && (
                              <span className="text-[#ef4444] animate-pulse text-[8px]">⚠</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2">
                          <EntropyGauge asset={market.symbol} />
                        </td>
                        <td className="py-2 text-right font-mono text-[#ef4444]">{market.funding.toFixed(4)}%</td>
                        <td className="py-2 text-right font-mono text-[#ef4444]">{market.apr.toFixed(1)}%</td>
                        <td className="py-2 text-right">
                          <button className="px-2 py-0.5 text-[8px] border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff15]">
                            OPEN
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>

            {/* Strategy Explanation */}
            <div className="mt-3 p-2 bg-[#00ffff08] border border-[#00ffff20]">
              <div className="text-[9px] text-[#00ffff] font-bold mb-1">DELTA NEUTRAL STRATEGY</div>
              <div className="text-[9px] text-[#ffffff60] leading-relaxed">
                Buy spot + short perp of equal size. Collect funding when rates are positive. Price movements cancel
                out, profit comes from funding payments.
              </div>
            </div>

            {/* Entropy Legend */}
            <div className="mt-2 p-2 bg-[#8b5cf608] border border-[#8b5cf620]">
              <div className="text-[9px] text-[#8b5cf6] font-bold mb-1">ENTANGLEMENT ENTROPY</div>
              <div className="text-[8px] text-[#ffffff50] leading-relaxed">
                S = von Neumann entropy of spot+perp basket. Higher entropy = hidden correlations rising = funding
                likely to flip against you. FLIP% = probability of adverse funding in next 8h.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Position Modal */}
      {showNewPosition && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0f] border border-[#00ffff] p-4 w-96 max-w-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#00ffff] font-mono text-sm font-bold">NEW DELTA NEUTRAL POSITION</span>
              <button onClick={() => setShowNewPosition(false)} className="text-[#ffffff60] hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#ffffff60] block mb-1">ASSET</label>
                <select className="w-full bg-black border border-[#ffffff20] text-white text-sm p-2">
                  <option>ETH</option>
                  <option>BTC</option>
                  <option>SOL</option>
                  <option>ARB</option>
                  <option>OP</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#ffffff60] block mb-1">SIZE (USD)</label>
                <input
                  type="number"
                  className="w-full bg-black border border-[#ffffff20] text-white text-sm p-2"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#ffffff60] block mb-1">LEVERAGE</label>
                <select className="w-full bg-black border border-[#ffffff20] text-white text-sm p-2">
                  <option>1x</option>
                  <option>2x</option>
                  <option>3x</option>
                  <option>5x</option>
                </select>
              </div>

              <button className="w-full py-2 text-sm font-bold bg-[#00ffff15] border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff25]">
                OPEN DELTA NEUTRAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
