"use client"

import { useState } from "react"

interface User {
  id: string
  walletAddress: string
  createdAt: string
  totalTrades: number
  totalVolumeUsd: number
  totalStrategies: number
  totalPositions: number
  status: "active" | "suspended" | "flagged"
  tierLevel: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND"
}

const mockUsers: User[] = [
  {
    id: "1",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    createdAt: "2024-12-01",
    totalTrades: 1247,
    totalVolumeUsd: 4_230_000,
    totalStrategies: 8,
    totalPositions: 23,
    status: "active",
    tierLevel: "GOLD",
  },
  {
    id: "2",
    walletAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    createdAt: "2024-11-15",
    totalTrades: 2891,
    totalVolumeUsd: 18_500_000,
    totalStrategies: 15,
    totalPositions: 47,
    status: "active",
    tierLevel: "PLATINUM",
  },
  {
    id: "3",
    walletAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    createdAt: "2024-10-20",
    totalTrades: 487,
    totalVolumeUsd: 780_000,
    totalStrategies: 3,
    totalPositions: 12,
    status: "flagged",
    tierLevel: "SILVER",
  },
  {
    id: "4",
    walletAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    createdAt: "2024-12-10",
    totalTrades: 89,
    totalVolumeUsd: 125_000,
    totalStrategies: 1,
    totalPositions: 4,
    status: "active",
    tierLevel: "BRONZE",
  },
]

export function UserManagementDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended" | "flagged">("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }

  return (
    <div className="flex gap-2 h-full">
      {/* User List */}
      <div className="w-2/3 flex flex-col gap-2">
        {/* Search & Filters */}
        <div className="neon-border glass-panel p-2">
          <input
            type="text"
            placeholder="Search by wallet address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#00000040] border border-[#00ffff40] px-3 py-2 text-sm text-[#00ffff] placeholder-[#00ffff60] focus:outline-none focus:border-[#00ffff]"
          />
          <div className="flex gap-2 mt-2">
            {["all", "active", "suspended", "flagged"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`
                  px-3 py-1 text-[10px] font-bold border transition-all
                  ${
                    filterStatus === status
                      ? "border-[#00ffff] bg-[#00ffff15] text-[#00ffff]"
                      : "border-[#ffffff20] text-[#ffffff60] hover:border-[#ffffff40]"
                  }
                `}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="neon-border glass-panel p-2 flex-1 overflow-auto">
          <table className="w-full text-[11px]">
            <thead className="border-b border-[#00ffff40]">
              <tr className="text-[#00ffff]">
                <th className="text-left py-2">WALLET</th>
                <th className="text-right">VOLUME</th>
                <th className="text-right">TRADES</th>
                <th className="text-center">TIER</th>
                <th className="text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`
                    border-b border-[#ffffff10] cursor-pointer transition-colors
                    ${selectedUser?.id === user.id ? "bg-[#00ffff15]" : "hover:bg-[#ffffff05]"}
                  `}
                >
                  <td className="py-2 text-[#00ffff] font-mono text-[10px]">
                    {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                  </td>
                  <td className="text-right text-white">{formatCurrency(user.totalVolumeUsd)}</td>
                  <td className="text-right text-[#ffffff80]">{user.totalTrades.toLocaleString()}</td>
                  <td className="text-center">
                    <span
                      className={`
                      px-2 py-0.5 text-[9px] font-bold rounded
                      ${user.tierLevel === "DIAMOND" ? "bg-purple-500/20 text-purple-400" : ""}
                      ${user.tierLevel === "PLATINUM" ? "bg-gray-400/20 text-gray-300" : ""}
                      ${user.tierLevel === "GOLD" ? "bg-yellow-500/20 text-yellow-400" : ""}
                      ${user.tierLevel === "SILVER" ? "bg-gray-500/20 text-gray-400" : ""}
                      ${user.tierLevel === "BRONZE" ? "bg-orange-700/20 text-orange-500" : ""}
                    `}
                    >
                      {user.tierLevel}
                    </span>
                  </td>
                  <td className="text-center">
                    <span
                      className={`
                      text-[10px]
                      ${user.status === "active" ? "text-green-400" : ""}
                      ${user.status === "suspended" ? "text-red-400" : ""}
                      ${user.status === "flagged" ? "text-yellow-400" : ""}
                    `}
                    >
                      ● {user.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details */}
      <div className="w-1/3 flex flex-col gap-2">
        {selectedUser ? (
          <>
            <div className="neon-border glass-panel p-3">
              <h3 className="text-sm font-bold glow-cyan mb-2">USER DETAILS</h3>
              <div className="space-y-2 text-[10px]">
                <div>
                  <span className="text-[#ffffff60]">Wallet:</span>
                  <div className="text-[#00ffff] font-mono text-[9px] break-all mt-1">{selectedUser.walletAddress}</div>
                </div>
                <div>
                  <span className="text-[#ffffff60]">Joined:</span>
                  <div className="text-white">{selectedUser.createdAt}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#ffffff20]">
                  <div>
                    <div className="text-[#ffffff60]">Total Volume</div>
                    <div className="text-white font-bold">{formatCurrency(selectedUser.totalVolumeUsd)}</div>
                  </div>
                  <div>
                    <div className="text-[#ffffff60]">Total Trades</div>
                    <div className="text-white font-bold">{selectedUser.totalTrades}</div>
                  </div>
                  <div>
                    <div className="text-[#ffffff60]">Strategies</div>
                    <div className="text-white font-bold">{selectedUser.totalStrategies}</div>
                  </div>
                  <div>
                    <div className="text-[#ffffff60]">Positions</div>
                    <div className="text-white font-bold">{selectedUser.totalPositions}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="neon-border glass-panel p-3 flex-1">
              <h3 className="text-sm font-bold glow-cyan mb-2">ACTIONS</h3>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 text-[10px] font-bold border border-[#00ffff40] text-[#00ffff] hover:bg-[#00ffff15] transition-colors">
                  VIEW TRADE HISTORY
                </button>
                <button className="w-full px-3 py-2 text-[10px] font-bold border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                  FLAG FOR REVIEW
                </button>
                <button className="w-full px-3 py-2 text-[10px] font-bold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors">
                  SUSPEND TRADING
                </button>
                <button className="w-full px-3 py-2 text-[10px] font-bold border border-[#ffffff20] text-[#ffffff60] hover:bg-[#ffffff05] transition-colors">
                  EXPORT USER DATA
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="neon-border glass-panel p-3 flex items-center justify-center h-full">
            <div className="text-[#ffffff40] text-sm text-center">Select a user to view details</div>
          </div>
        )}
      </div>
    </div>
  )
}
