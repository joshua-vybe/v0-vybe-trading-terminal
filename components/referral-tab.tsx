"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

// Trader fee tiers
const TRADER_FEE_TIERS = [
  {
    tier: "BRONZE",
    volume: "$0–$1M",
    discount: "0%",
    perpFee: "10 bps",
    spotFee: "100 bps",
    platformShare: "100%",
    color: "text-amber-600",
  },
  {
    tier: "SILVER",
    volume: "$1M–$10M",
    discount: "20%",
    perpFee: "8 bps",
    spotFee: "80 bps",
    platformShare: "80%",
    color: "text-gray-400",
  },
  {
    tier: "GOLD",
    volume: "$10M–$50M",
    discount: "40%",
    perpFee: "6 bps",
    spotFee: "60 bps",
    platformShare: "60%",
    color: "text-yellow-500",
  },
  {
    tier: "PLATINUM",
    volume: "$50M–$250M",
    discount: "60%",
    perpFee: "4 bps",
    spotFee: "40 bps",
    platformShare: "40%",
    color: "text-cyan-400",
  },
  {
    tier: "DIAMOND",
    volume: "$250M+",
    discount: "80%",
    perpFee: "2 bps",
    spotFee: "20 bps",
    platformShare: "20%",
    color: "text-purple-400",
  },
]

// Referral reward tiers
const REFERRAL_REWARD_TIERS = [
  {
    tier: "BRONZE",
    referred: "$0–$100K",
    reward: "20%",
    badge: false,
    color: "text-amber-600",
  },
  {
    tier: "SILVER",
    referred: "$100K–$1M",
    reward: "30%",
    badge: false,
    color: "text-gray-400",
  },
  {
    tier: "GOLD",
    referred: "$1M–$10M",
    reward: "40%",
    badge: false,
    color: "text-yellow-500",
  },
  {
    tier: "DIAMOND",
    referred: "$10M+",
    reward: "50%",
    badge: false,
    color: "text-purple-400",
  },
  {
    tier: "LEGEND",
    referred: "10+ active referrals with >$1M each",
    reward: "60%",
    badge: true,
    color: "text-fuchsia-500",
  },
]

// Mock referral data for detailed tracking
const MOCK_REFERRALS = [
  {
    id: 1,
    code: "ALEX_T",
    tier: "GOLD",
    joinDate: "2025-01-15",
    volume: 12500000,
    fees: 8750,
    yourEarnings: 3500,
    status: "active",
    trades30d: 847,
  },
  {
    id: 2,
    code: "CRYPTO_KING",
    tier: "PLATINUM",
    joinDate: "2024-12-20",
    volume: 87000000,
    fees: 34800,
    yourEarnings: 17400,
    status: "active",
    trades30d: 2104,
  },
  {
    id: 3,
    code: "SARAH_M",
    tier: "SILVER",
    joinDate: "2025-02-01",
    volume: 3200000,
    fees: 2560,
    yourEarnings: 768,
    status: "active",
    trades30d: 412,
  },
  {
    id: 4,
    code: "WHALE_42",
    tier: "DIAMOND",
    joinDate: "2024-11-05",
    volume: 310000000,
    fees: 62000,
    yourEarnings: 31000,
    status: "active",
    trades30d: 1834,
  },
  {
    id: 5,
    code: "DEX_MASTER",
    tier: "GOLD",
    joinDate: "2025-01-28",
    volume: 28000000,
    fees: 16800,
    yourEarnings: 6720,
    status: "active",
    trades30d: 921,
  },
]

const ACTIVITY_TIMELINE = [
  { date: "2025-03-11", event: "WHALE_42 traded $2.8M", earnings: "+$560" },
  { date: "2025-03-11", event: "New referral: DEX_MASTER joined", earnings: "+$0" },
  { date: "2025-03-10", event: "CRYPTO_KING upgraded to PLATINUM", earnings: "+$1,240" },
  { date: "2025-03-10", event: "ALEX_T traded $840K", earnings: "+$336" },
  { date: "2025-03-09", event: "SARAH_M traded $120K", earnings: "+$36" },
]

export function ReferralTab() {
  const [copiedCode, setCopiedCode] = useState(false)
  const [currentTier, setCurrentTier] = useState("GOLD")
  const [referralVolume, setReferralVolume] = useState(0.7)
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState<number | null>(null)

  const referralCode = "VYBE_NEURAL_X9Z2"

  useEffect(() => {
    const interval = setInterval(() => {
      setReferralVolume((prev) => prev + Math.random() * 0.01)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden p-2">
      {/* Header Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="neon-border glass-panel p-2">
          <div className="text-[9px] text-[#00ffff60] mb-1">TOTAL REFERRALS</div>
          <div className="text-2xl font-bold text-[#00ffff]">247</div>
          <div className="text-[8px] text-[#00ffff40]">+12 this month</div>
        </div>
        <div className="neon-border glass-panel p-2">
          <div className="text-[9px] text-[#00ffff60] mb-1">ACTIVE (30D)</div>
          <div className="text-2xl font-bold text-[#22c55e]">183</div>
          <div className="text-[8px] text-[#22c55e60]">74% active rate</div>
        </div>
        <div className="neon-border glass-panel p-2">
          <div className="text-[9px] text-[#00ffff60] mb-1">TOTAL VOLUME</div>
          <div className="text-2xl font-bold text-yellow-500">${referralVolume.toFixed(2)}M</div>
          <div className="text-[8px] text-yellow-500/60">+$84K today</div>
        </div>
        <div className="neon-border glass-panel p-2">
          <div className="text-[9px] text-[#00ffff60] mb-1">TOTAL EARNED</div>
          <div className="text-2xl font-bold text-purple-400">$127.8K</div>
          <div className="text-[8px] text-purple-400/60">+$2.1K today</div>
        </div>
      </div>

      {/* Referral Code & Tier Info */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 neon-border glass-panel p-2">
          <div className="text-[10px] text-[#00ffff60] mb-1">YOUR REFERRAL CODE</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 neon-border glass-panel p-2 bg-[#00ffff05]">
              <div className="text-lg font-mono glow-cyan">{referralCode}</div>
            </div>
            <button
              onClick={copyReferralCode}
              className="neon-border glass-panel px-3 py-2 text-[10px] font-bold hover:bg-[#00ffff10] transition-all"
            >
              {copiedCode ? "✓ COPIED" : "[ COPY ]"}
            </button>
          </div>
        </div>
        <div className="neon-border glass-panel p-2">
          <div className="text-[10px] text-[#00ffff60] mb-1">YOUR TIER</div>
          <div className="text-2xl font-bold text-yellow-500 mb-1">{currentTier}</div>
          <div className="text-[8px] text-[#00ffff40]">40% reward rate</div>
        </div>
      </div>

      {/* Tier Info Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowFeeModal(true)}
          className="flex-1 neon-border glass-panel p-2 text-[10px] font-bold hover:bg-[#00ffff05] transition-all"
        >
          [ VIEW TRADER FEE TIERS ]
        </button>
        <button
          onClick={() => setShowRewardModal(true)}
          className="flex-1 neon-border glass-panel p-2 text-[10px] font-bold hover:bg-[#22c55e05] transition-all text-[#22c55e]"
        >
          [ VIEW REFERRAL REWARD TIERS ]
        </button>
      </div>

      {/* Main Content: Referrals List & Activity */}
      <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
        {/* Top 5 Referrals */}
        <div className="col-span-2 neon-border glass-panel p-2 flex flex-col min-h-0">
          <div className="text-[11px] font-bold text-[#00ffff] mb-2 border-b border-[#00ffff20] pb-2">
            TOP 5 REFERRALS BY EARNINGS
          </div>
          <div className="flex-1 overflow-auto space-y-1">
            {MOCK_REFERRALS.map((ref) => (
              <div
                key={ref.id}
                className="neon-border glass-panel p-2 hover:bg-[#00ffff05] cursor-pointer transition-all"
                onClick={() => setSelectedReferral(ref.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-bold text-[#00ffff]">{ref.code}</div>
                    <div className="text-[8px] px-1 py-0.5 bg-yellow-500/20 text-yellow-500 border border-yellow-500/40">
                      {ref.tier}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-[#22c55e]">+${ref.yourEarnings.toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[8px]">
                  <div>
                    <div className="text-[#00ffff40]">VOLUME</div>
                    <div className="text-[#00ffff]">${(ref.volume / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-[#00ffff40]">FEES PAID</div>
                    <div className="text-[#00ffff]">${ref.fees.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[#00ffff40]">30D TRADES</div>
                    <div className="text-[#00ffff]">{ref.trades30d}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="neon-border glass-panel p-2 flex flex-col min-h-0">
          <div className="text-[11px] font-bold text-purple-400 mb-2 border-b border-purple-400/20 pb-2">
            RECENT ACTIVITY
          </div>
          <div className="flex-1 overflow-auto space-y-2">
            {ACTIVITY_TIMELINE.map((activity, idx) => (
              <div key={idx} className="pb-2 border-b border-[#00ffff10]">
                <div className="text-[8px] text-[#00ffff40] mb-0.5">{activity.date}</div>
                <div className="text-[9px] text-[#00ffff] mb-1">{activity.event}</div>
                <div className="text-[9px] font-bold text-[#22c55e]">{activity.earnings}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="neon-border glass-panel p-4 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-[#00ffff]">TRADER FEE TIERS</div>
              <button
                onClick={() => setShowFeeModal(false)}
                className="text-[#00ffff] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {TRADER_FEE_TIERS.map((tier) => (
                <div key={tier.tier} className="neon-border glass-panel p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-sm font-bold ${tier.color}`}>{tier.tier}</div>
                    <div className="text-sm text-[#00ffff]">{tier.discount} DISCOUNT</div>
                  </div>
                  <div className="text-xs text-[#00ffff80] mb-2">{tier.volume} volume</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-[#00ffff40]">PERP FEE</div>
                      <div className="text-[#00ffff] font-bold">{tier.perpFee}</div>
                    </div>
                    <div>
                      <div className="text-[#00ffff40]">SPOT FEE</div>
                      <div className="text-[#00ffff] font-bold">{tier.spotFee}</div>
                    </div>
                    <div>
                      <div className="text-[#00ffff40]">PLATFORM</div>
                      <div className="text-[#00ffff] font-bold">{tier.platformShare}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRewardModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="neon-border glass-panel p-4 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-[#22c55e]">REFERRAL REWARD TIERS</div>
              <button
                onClick={() => setShowRewardModal(false)}
                className="text-[#22c55e] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {REFERRAL_REWARD_TIERS.map((tier) => (
                <div
                  key={tier.tier}
                  className={`neon-border glass-panel p-3 ${tier.badge ? "border-fuchsia-500/40" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-sm font-bold ${tier.color}`}>{tier.tier}</div>
                    <div className="text-sm font-bold text-[#22c55e]">{tier.reward} REWARD</div>
                  </div>
                  <div className="text-xs text-[#00ffff80] mb-2">{tier.referred} referred</div>
                  {tier.badge && (
                    <div className="flex gap-2 mt-2">
                      <div className="text-xs px-2 py-1 bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40">
                        BADGE
                      </div>
                      <div className="text-xs px-2 py-1 bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40">
                        HOMEPAGE FEATURE
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
