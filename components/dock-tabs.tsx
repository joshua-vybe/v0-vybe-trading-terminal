"use client"

import { useState, useEffect } from "react"

interface DockTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "TERMINAL", icon: "◉", hint: "TRADE" },
  { id: "PORTFOLIO", icon: "◈", hint: "ASSETS" },
  { id: "STRATEGIES", icon: "◆", hint: "ALGOS" },
  { id: "BACKTESTER", icon: "◇", hint: "SIMULATE" },
  { id: "SETTINGS", icon: "◎", hint: "CONFIG" },
]

export function DockTabs({ activeTab, onTabChange }: DockTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [activity, setActivity] = useState<Record<string, number>>({
    TERMINAL: 0,
    PORTFOLIO: 0,
    STRATEGIES: 0,
    BACKTESTER: 0,
    SETTINGS: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setActivity((prev) => ({
        ...prev,
        TERMINAL: Math.random() > 0.3 ? prev.TERMINAL + 1 : prev.TERMINAL,
        STRATEGIES: Math.random() > 0.7 ? prev.STRATEGIES + 1 : prev.STRATEGIES,
      }))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-2 neon-border glass-panel relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        style={{
          animation: "dock-scan 4s linear infinite",
        }}
      />

      <div className="flex relative z-10">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            className={`
              flex-1 py-2 text-[11px] font-bold border-r border-[#00ffff20] last:border-r-0
              transition-all duration-500 relative overflow-hidden
              ${
                activeTab === tab.id
                  ? "glow-cyan bg-[#00ffff10]"
                  : "text-[#00ffff60] hover:text-[#00ffff] hover:bg-[#00ffff05]"
              }
            `}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {activeTab === tab.id && (
              <div
                className="absolute inset-0 bg-cyan-400/5 pointer-events-none"
                style={{ animation: "tab-breathe 3s ease-in-out infinite" }}
              />
            )}

            {(tab.id === "TERMINAL" || tab.id === "STRATEGIES") && activity[tab.id] > 0 && (
              <div className="absolute top-1 right-2 flex items-center gap-1">
                <div
                  className="w-1.5 h-1.5 bg-green-400 rounded-full"
                  style={{ animation: "soft-pulse 2s ease-in-out infinite" }}
                />
              </div>
            )}

            {hoveredTab === tab.id && activeTab !== tab.id && (
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none transition-opacity duration-300" />
            )}

            <pre className="leading-tight relative z-10">
              {activeTab === tab.id
                ? `┌${"─".repeat(tab.id.length + 4)}┐
│ ${tab.icon} ${tab.id} │
└${"─".repeat(tab.id.length + 4)}┘`
                : hoveredTab === tab.id
                  ? `╔${"═".repeat(tab.id.length + 4)}╗
║ ${tab.icon} ${tab.id} ║
╚${"═".repeat(tab.id.length + 4)}╝`
                  : `[${tab.icon} ${tab.id}]`}
            </pre>

            {hoveredTab === tab.id && activeTab !== tab.id && (
              <div className="absolute bottom-0 left-0 right-0 text-[9px] text-fuchsia-400/60 tracking-wider">
                {tab.hint}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="h-[2px] w-full bg-black relative overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-cyan-500/50 via-fuchsia-500/50 to-cyan-500/50"
          style={{
            width: "40%",
            animation: "gradient-flow 6s linear infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes dock-scan {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes tab-breathe {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes soft-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes gradient-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  )
}
