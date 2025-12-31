"use client"

import { useState } from "react"

interface FlaggedActivity {
  id: string
  userId: string
  walletAddress: string
  type: "high_volume" | "suspicious_pattern" | "rapid_trading" | "large_loss"
  description: string
  timestamp: string
  severity: "low" | "medium" | "high" | "critical"
  status: "pending" | "reviewed" | "resolved"
}

const mockFlaggedActivities: FlaggedActivity[] = [
  {
    id: "1",
    userId: "user_123",
    walletAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    type: "suspicious_pattern",
    description: "Unusual trading pattern detected: 47 trades in 2 minutes",
    timestamp: "2024-12-11 13:24:18",
    severity: "high",
    status: "pending",
  },
  {
    id: "2",
    userId: "user_456",
    walletAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    type: "high_volume",
    description: "Volume spike: $4.2M in single trade (10x avg)",
    timestamp: "2024-12-11 12:15:42",
    severity: "medium",
    status: "reviewed",
  },
  {
    id: "3",
    userId: "user_789",
    walletAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    type: "large_loss",
    description: "Large unrealized loss: -$847K (92% of portfolio)",
    timestamp: "2024-12-11 11:08:33",
    severity: "critical",
    status: "pending",
  },
]

export function ComplianceDashboard() {
  const [selectedActivity, setSelectedActivity] = useState<FlaggedActivity | null>(null)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500"
      case "high":
        return "text-orange-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-blue-500"
      default:
        return "text-[#ffffff60]"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-500/20"
      case "reviewed":
        return "text-blue-400 bg-blue-500/20"
      case "resolved":
        return "text-green-400 bg-green-500/20"
      default:
        return "text-[#ffffff60]"
    }
  }

  return (
    <div className="flex gap-2 h-full p-2">
      {/* Flagged Activities List */}
      <div className="w-2/3 flex flex-col gap-2">
        <div className="neon-border glass-panel p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold glow-cyan">FLAGGED ACTIVITIES</h3>
            <div className="flex gap-2 text-[10px]">
              <span className="text-red-500">
                ● {mockFlaggedActivities.filter((a) => a.severity === "critical").length} CRITICAL
              </span>
              <span className="text-yellow-500">
                ● {mockFlaggedActivities.filter((a) => a.status === "pending").length} PENDING
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {mockFlaggedActivities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => setSelectedActivity(activity)}
                className={`
                  border p-3 cursor-pointer transition-all
                  ${
                    selectedActivity?.id === activity.id
                      ? "border-[#00ffff] bg-[#00ffff10]"
                      : "border-[#ffffff20] hover:border-[#ffffff40] hover:bg-[#ffffff05]"
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${getSeverityColor(activity.severity)}`}>
                      ● {activity.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-[#ffffff60]">
                      {activity.type.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${getStatusColor(activity.status)}`}>
                    {activity.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-white mb-2">{activity.description}</div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-[#00ffff] font-mono">{activity.walletAddress.slice(0, 10)}...</span>
                  <span className="text-[#ffffff40]">{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Details & Actions */}
      <div className="w-1/3 flex flex-col gap-2">
        {selectedActivity ? (
          <>
            <div className="neon-border glass-panel p-3">
              <h3 className="text-sm font-bold glow-cyan mb-3">ACTIVITY DETAILS</h3>
              <div className="space-y-2 text-[10px]">
                <div>
                  <span className="text-[#ffffff60]">User ID:</span>
                  <div className="text-white font-mono">{selectedActivity.userId}</div>
                </div>
                <div>
                  <span className="text-[#ffffff60]">Wallet:</span>
                  <div className="text-[#00ffff] font-mono text-[9px] break-all">{selectedActivity.walletAddress}</div>
                </div>
                <div>
                  <span className="text-[#ffffff60]">Type:</span>
                  <div className="text-white">{selectedActivity.type.replace("_", " ").toUpperCase()}</div>
                </div>
                <div>
                  <span className="text-[#ffffff60]">Severity:</span>
                  <div className={`font-bold ${getSeverityColor(selectedActivity.severity)}`}>
                    {selectedActivity.severity.toUpperCase()}
                  </div>
                </div>
                <div>
                  <span className="text-[#ffffff60]">Timestamp:</span>
                  <div className="text-white">{selectedActivity.timestamp}</div>
                </div>
              </div>
            </div>

            <div className="neon-border glass-panel p-3">
              <h3 className="text-sm font-bold glow-cyan mb-3">ACTIONS</h3>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 text-[10px] font-bold border border-[#00ffff40] text-[#00ffff] hover:bg-[#00ffff15] transition-colors">
                  VIEW USER PROFILE
                </button>
                <button className="w-full px-3 py-2 text-[10px] font-bold border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-colors">
                  MARK AS REVIEWED
                </button>
                <button className="w-full px-3 py-2 text-[10px] font-bold border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                  REQUEST MORE INFO
                </button>
                <button className="w-full px-3 py-2 text-[10px] font-bold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors">
                  SUSPEND USER
                </button>
              </div>
            </div>

            <div className="neon-border glass-panel p-3 flex-1">
              <h3 className="text-sm font-bold glow-cyan mb-2">AUDIT NOTES</h3>
              <textarea
                className="w-full h-24 bg-[#00000040] border border-[#00ffff40] px-2 py-2 text-[10px] text-white placeholder-[#00ffff60] focus:outline-none focus:border-[#00ffff] resize-none"
                placeholder="Add investigation notes..."
              />
              <button className="w-full mt-2 px-3 py-2 text-[10px] font-bold border border-[#00ffff40] text-[#00ffff] hover:bg-[#00ffff15] transition-colors">
                SAVE NOTES
              </button>
            </div>
          </>
        ) : (
          <div className="neon-border glass-panel p-3 flex items-center justify-center h-full">
            <div className="text-[#ffffff40] text-sm text-center">Select a flagged activity to review</div>
          </div>
        )}
      </div>
    </div>
  )
}
