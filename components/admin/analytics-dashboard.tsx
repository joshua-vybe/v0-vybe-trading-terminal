"use client"

export function AnalyticsDashboard() {
  const platformMetrics = {
    totalUsers: 1247,
    activeUsers: 892,
    totalVolume24h: 47_800_000,
    totalTrades24h: 12_847,
    averageTradeSize: 3_721,
    totalStrategies: 3_241,
    activeStrategies: 1_829,
    aiRequestsToday: 8_472,
    totalAICost: 2_847,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {/* Platform-Wide Metrics */}
      <div className="grid grid-cols-4 gap-2">
        <div className="neon-border glass-panel p-3">
          <div className="text-[10px] text-[#ffffff60]">TOTAL USERS</div>
          <div className="text-2xl font-bold glow-cyan">{platformMetrics.totalUsers.toLocaleString()}</div>
          <div className="text-[9px] text-green-400 mt-1">+127 this month</div>
        </div>
        <div className="neon-border glass-panel p-3">
          <div className="text-[10px] text-[#ffffff60]">ACTIVE USERS (24H)</div>
          <div className="text-2xl font-bold text-green-400">{platformMetrics.activeUsers.toLocaleString()}</div>
          <div className="text-[9px] text-[#ffffff60] mt-1">71.5% engagement</div>
        </div>
        <div className="neon-border glass-panel p-3">
          <div className="text-[10px] text-[#ffffff60]">VOLUME (24H)</div>
          <div className="text-2xl font-bold text-fuchsia-400">{formatCurrency(platformMetrics.totalVolume24h)}</div>
          <div className="text-[9px] text-green-400 mt-1">+12.4% vs yesterday</div>
        </div>
        <div className="neon-border glass-panel p-3">
          <div className="text-[10px] text-[#ffffff60]">TRADES (24H)</div>
          <div className="text-2xl font-bold text-yellow-400">{platformMetrics.totalTrades24h.toLocaleString()}</div>
          <div className="text-[9px] text-[#ffffff60] mt-1">
            Avg: {formatCurrency(platformMetrics.averageTradeSize)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Strategy Metrics */}
        <div className="neon-border glass-panel p-3">
          <h3 className="text-sm font-bold glow-cyan mb-3">STRATEGY PERFORMANCE</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#ffffff60]">Total Strategies</span>
              <span className="text-white font-bold">{platformMetrics.totalStrategies.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#ffffff60]">Currently Active</span>
              <span className="text-green-400 font-bold">{platformMetrics.activeStrategies.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#ffffff60]">Avg Win Rate</span>
              <span className="text-cyan-400 font-bold">64.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#ffffff60]">Top Performer ROI</span>
              <span className="text-fuchsia-400 font-bold">+847%</span>
            </div>
          </div>
        </div>

        {/* AI Usage Metrics */}
        <div className="neon-border glass-panel p-3">
          <h3 className="text-sm font-bold text-purple-400 mb-3">AI NEURAL CORTEX USAGE</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#ffffff60]">Requests Today</span>
              <span className="text-white font-bold">{platformMetrics.aiRequestsToday.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#ffffff60]">Total AI Cost</span>
              <span className="text-yellow-400 font-bold">{formatCurrency(platformMetrics.totalAICost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#ffffff60]">Avg Cost/Request</span>
              <span className="text-cyan-400 font-bold">$0.34</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#ffffff60]">Success Rate</span>
              <span className="text-green-400 font-bold">99.7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Users by Volume */}
      <div className="neon-border glass-panel p-3">
        <h3 className="text-sm font-bold glow-cyan mb-3">TOP 10 USERS BY VOLUME (30 DAYS)</h3>
        <table className="w-full text-[10px]">
          <thead className="border-b border-[#00ffff40]">
            <tr className="text-[#00ffff]">
              <th className="text-left py-2">RANK</th>
              <th className="text-left">WALLET</th>
              <th className="text-right">VOLUME</th>
              <th className="text-right">TRADES</th>
              <th className="text-right">WIN RATE</th>
              <th className="text-right">P&L</th>
            </tr>
          </thead>
          <tbody className="text-[#ffffff80]">
            {[
              { rank: 1, wallet: "0x742d35Cc...", volume: 18_500_000, trades: 2891, winRate: 68.2, pnl: 847_200 },
              { rank: 2, wallet: "0x8f3Cf7ad...", volume: 14_200_000, trades: 1847, winRate: 71.5, pnl: 1_024_500 },
              { rank: 3, wallet: "0x2791Bca1...", volume: 11_800_000, trades: 1492, winRate: 63.8, pnl: 618_900 },
              { rank: 4, wallet: "0xc2132D05...", volume: 9_400_000, trades: 1284, winRate: 69.4, pnl: 732_100 },
              { rank: 5, wallet: "0x7ceB23fD...", volume: 8_100_000, trades: 1057, winRate: 65.1, pnl: 542_800 },
            ].map((user) => (
              <tr key={user.rank} className="border-b border-[#ffffff10]">
                <td className="py-2 text-[#00ffff] font-bold">#{user.rank}</td>
                <td className="font-mono">{user.wallet}</td>
                <td className="text-right text-white">{formatCurrency(user.volume)}</td>
                <td className="text-right">{user.trades.toLocaleString()}</td>
                <td className="text-right text-cyan-400">{user.winRate}%</td>
                <td className="text-right text-green-400 font-bold">+{formatCurrency(user.pnl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
