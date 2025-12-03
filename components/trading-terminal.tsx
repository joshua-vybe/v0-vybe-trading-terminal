"use client"

import { useState, useEffect } from "react"
import { AsciiChart } from "@/components/ascii-chart"
import { RightPanel } from "@/components/right-panel"
import { AITerminal } from "@/components/ai-terminal"
import { DockTabs } from "@/components/dock-tabs"
import { TerminalHeader } from "@/components/terminal-header"
import { PortfolioTab } from "@/components/portfolio-tab"
import { StrategiesTab } from "@/components/strategies-tab"
import { BacktesterTab } from "@/components/backtester-tab"
import { SettingsTab } from "@/components/settings-tab"
import { NeuralNetworkBg } from "./neural-network-bg"
import { CircuitLines } from "./circuit-lines"

export function TradingTerminal() {
  const [selectedVenue, setSelectedVenue] = useState<string>("HYPERLIQUID")
  const [activeTab, setActiveTab] = useState<string>("TERMINAL")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case "TERMINAL":
        return (
          <div className="flex-1 flex gap-2 min-h-0 slide-in-right" style={{ animationDelay: "0.2s" }}>
            <div className="w-[70%] flex flex-col">
              <AsciiChart />
            </div>
            <div className="w-[30%]">
              <RightPanel selectedVenue={selectedVenue} onVenueChange={setSelectedVenue} />
            </div>
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

      {/* Scanlines */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.02) 2px, rgba(0, 255, 255, 0.02) 4px)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <TerminalHeader />
        <div className="flex-1 flex flex-col gap-2 min-h-0 mt-2">{renderTabContent()}</div>
        <AITerminal />
        <DockTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}
