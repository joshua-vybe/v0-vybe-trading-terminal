"use client"

import { useState, useEffect } from "react"
import { TradingViewChart } from "@/components/tradingview-chart"
import { RightPanel } from "@/components/right-panel"
import { AITerminal } from "@/components/ai-terminal"
import { DockTabs } from "@/components/dock-tabs"
import { TerminalHeader } from "@/components/terminal-header"
import { PortfolioTab } from "@/components/portfolio-tab"
import { StrategiesTab } from "@/components/strategies-tab"
import { BacktesterTab } from "@/components/backtester-tab"
import { ReferralTab } from "@/components/referral-tab"
import { SettingsTab } from "@/components/settings-tab"
import { DeltaNeutralDashboard } from "@/components/delta-neutral-dashboard"
import { NeuralNetworkBg } from "./neural-network-bg"
import { CircuitLines } from "./circuit-lines"
import { CyberRain } from "./cyber-rain"
import { AmbientParticles } from "./ambient-particles"

export function TradingTerminal() {
  const [activeTab, setActiveTab] = useState<string>("TERMINAL")
  const [terminalMode, setTerminalMode] = useState<"chart" | "delta">("chart")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case "TERMINAL":
        return (
          <div className="flex-1 flex flex-col gap-2 min-h-0 slide-in-right" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <button
                  onClick={() => setTerminalMode("chart")}
                  className={`px-3 py-1 text-[10px] font-bold border transition-all ${
                    terminalMode === "chart"
                      ? "border-[#00ffff] bg-[#00ffff15] text-[#00ffff]"
                      : "border-[#ffffff20] text-[#ffffff40] hover:border-[#ffffff40]"
                  }`}
                >
                  PRICE CHART
                </button>
                <button
                  onClick={() => setTerminalMode("delta")}
                  className={`px-3 py-1 text-[10px] font-bold border transition-all ${
                    terminalMode === "delta"
                      ? "border-[#22c55e] bg-[#22c55e15] text-[#22c55e]"
                      : "border-[#ffffff20] text-[#ffffff40] hover:border-[#ffffff40]"
                  }`}
                >
                  DELTA NEUTRAL
                </button>
              </div>
              <div className="flex-1" />
              <div className="text-[9px] text-[#ffffff40] flex items-center gap-2">
                <span className="text-[#00ffff]">●</span> HYPERLIQUID CONNECTED
              </div>
            </div>

            {terminalMode === "chart" ? (
              <div className="flex-1 flex gap-2 min-h-0">
                <div className="w-[70%] flex flex-col">
                  <TradingViewChart />
                </div>
                <div className="w-[30%]">
                  <RightPanel />
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0">
                <DeltaNeutralDashboard />
              </div>
            )}
          </div>
        )
      case "PORTFOLIO":
        return (
          <div className="flex-1 min-h-0 fade-in-up">
            <PortfolioTab />
          </div>
        )
      case "STRATEGIES":
        return (
          <div className="flex-1 min-h-0 fade-in-up">
            <StrategiesTab />
          </div>
        )
      case "BACKTESTER":
        return (
          <div className="flex-1 min-h-0 fade-in-up">
            <BacktesterTab />
          </div>
        )
      case "REFERRAL":
        return (
          <div className="flex-1 min-h-0 fade-in-up">
            <ReferralTab />
          </div>
        )
      case "SETTINGS":
        return (
          <div className="flex-1 min-h-0 fade-in-up">
            <SettingsTab />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`h-screen w-screen flex flex-col bg-black p-2 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
    >
      <NeuralNetworkBg nodeCount={30} opacity={0.08} />
      <CircuitLines />
      <CyberRain opacity={0.15} />
      <AmbientParticles count={25} opacity={0.6} />

      <div
        className="pointer-events-none fixed inset-0 z-[5] opacity-[0.008]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)",
        }}
      />

      <div
        className="pointer-events-none fixed top-0 left-0 w-96 h-96 z-[1]"
        style={{
          background: "radial-gradient(circle at top left, rgba(0, 255, 255, 0.03), transparent 70%)",
          animation: "ambient-breathe 6s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 right-0 w-96 h-96 z-[1]"
        style={{
          background: "radial-gradient(circle at bottom right, rgba(255, 0, 255, 0.03), transparent 70%)",
          animation: "ambient-breathe 6s ease-in-out infinite 3s",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <TerminalHeader />
        <div className="flex-1 flex flex-col gap-2 min-h-0 mt-2">{renderTabContent()}</div>
        <AITerminal />
        <DockTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <style jsx>{`
        @keyframes ambient-breathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
