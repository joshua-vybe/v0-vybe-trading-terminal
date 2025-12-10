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

export function DeltaNeutralDashboard() {
  const [positions, setPositions] = useState<DeltaNeutralPosition[]>(MOCK_POSITIONS)
  const [marketData, setMarketData] = useState<AggregatedMarketData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [nextFunding, setNextFunding] = useState<Date>(getNextFundingTime())
  const [countdown, setCountdown] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [showNewPosition, setShowNewPosition] = useState(false)

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

  return (
    <div className="neon-border glass-panel p-3 h-full flex flex-col">
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
            {positions.map((pos, i) => (
              <div
                key={pos.asset}
                onClick={() => setSelectedAsset(selectedAsset === pos.asset ? null : pos.asset)}
                className={`bg-black/40 border p-2 cursor-pointer transition-all ${
                  selectedAsset === pos.asset
                    ? "border-[#00ffff] bg-[#00ffff08]"
                    : "border-[#ffffff10] hover:border-[#ffffff30]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
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
            ))}
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
                  <th className="pb-2 font-normal text-right">FUNDING</th>
                  <th className="pb-2 font-normal text-right">APR</th>
                  <th className="pb-2 font-normal text-right">OI</th>
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
                  topOpportunities.map((market) => (
                    <tr key={market.symbol} className="border-t border-[#ffffff08] hover:bg-[#ffffff05]">
                      <td className="py-2 text-white font-medium">{market.symbol}</td>
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
                      <td className="py-2 text-right text-[#ffffff60] font-mono">
                        ${((market.openInterest || 0) / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-2 text-right">
                        <button className="px-2 py-0.5 text-[8px] border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff15]">
                          OPEN
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Fallback mock data if API fails
                  [
                    { symbol: "WIF", funding: 0.0125, apr: 41.2, oi: 48.5 },
                    { symbol: "PEPE", funding: 0.0098, apr: 32.1, oi: 35.2 },
                    { symbol: "DOGE", funding: 0.0076, apr: 24.8, oi: 62.1 },
                    { symbol: "SOL", funding: 0.0052, apr: 17.2, oi: 185.4 },
                    { symbol: "ETH", funding: 0.0041, apr: 13.5, oi: 420.8 },
                  ].map((market) => (
                    <tr key={market.symbol} className="border-t border-[#ffffff08] hover:bg-[#ffffff05]">
                      <td className="py-2 text-white font-medium">{market.symbol}</td>
                      <td className="py-2 text-right font-mono text-[#22c55e]">
                        +{(market.funding * 100).toFixed(4)}%
                      </td>
                      <td className="py-2 text-right font-mono text-[#22c55e]">+{market.apr.toFixed(1)}%</td>
                      <td className="py-2 text-right text-[#ffffff60] font-mono">${market.oi.toFixed(1)}M</td>
                      <td className="py-2 text-right">
                        <button className="px-2 py-0.5 text-[8px] border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff15]">
                          OPEN
                        </button>
                      </td>
                    </tr>
                  ))
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
          </div>
        </div>
      </div>

      {/* New Position Modal */}
      {showNewPosition && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-[#00ffff] p-4 w-[400px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#00ffff] font-bold text-sm">OPEN DELTA NEUTRAL POSITION</span>
              <button onClick={() => setShowNewPosition(false)} className="text-[#ffffff60] hover:text-white">
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#ffffff60] block mb-1">ASSET</label>
                <select className="w-full bg-black border border-[#ffffff30] text-white p-2 text-sm">
                  <option>ETH</option>
                  <option>BTC</option>
                  <option>SOL</option>
                  <option>WIF</option>
                  <option>PEPE</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#ffffff60] block mb-1">SIZE (USD VALUE)</label>
                <input
                  type="text"
                  placeholder="10000"
                  className="w-full bg-black border border-[#ffffff30] text-white p-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 bg-[#22c55e10] border border-[#22c55e30]">
                  <div className="text-[#22c55e60]">SPOT BUY</div>
                  <div className="text-[#22c55e]">+X.XX @ MARKET</div>
                </div>
                <div className="p-2 bg-[#ff00ff10] border border-[#ff00ff30]">
                  <div className="text-[#ff00ff60]">PERP SHORT</div>
                  <div className="text-[#ff00ff]">-X.XX @ MARKET</div>
                </div>
              </div>
              <button className="w-full py-2 bg-[#00ffff15] border border-[#00ffff] text-[#00ffff] font-bold text-sm hover:bg-[#00ffff25]">
                EXECUTE DELTA NEUTRAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
