"use client"

import { useState } from "react"
import { useTheme, type ThemeName } from "@/contexts/theme-context"

export function SettingsTab() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    scanlines: true,
    flicker: true,
    soundEffects: false,
    notifications: true,
    autoRefresh: true,
    refreshRate: 1000,
  })

  const [apiKeys, setApiKeys] = useState({
    hyperliquid: "hl_****************************",
    aster: "ast_****************************",
    nado: "",
    orderly: "ord_****************************",
  })

  const themes: { id: ThemeName; label: string }[] = [
    { id: "DARK_CRT", label: "DARK_CRT" },
    { id: "MATRIX", label: "MATRIX" },
    { id: "AMBER", label: "AMBER" },
    { id: "LIGHT_CRT", label: "LIGHT_CRT" },
  ]

  return (
    <div className="h-full flex flex-col gap-3 overflow-auto">
      {/* Header */}
      <div className="neon-border glass-panel p-3">
        <pre className="text-[10px] text-[var(--theme-text-dim)]">
          {`╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                    TERMINAL SETTINGS                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝`}
        </pre>
      </div>

      <div className="flex gap-3 flex-1">
        {/* Display Settings */}
        <div className="flex-1 neon-border glass-panel p-3">
          <pre className="text-[10px] glow-primary mb-3">◈ DISPLAY SETTINGS</pre>

          <div className="space-y-3 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--theme-text-dim)]">THEME</span>
              <div className="flex gap-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`px-3 py-1 border transition-all ${
                      theme === t.id
                        ? "border-[var(--theme-primary)] glow-primary"
                        : "border-[var(--theme-border)] text-[var(--theme-text-dim)] hover:border-[var(--theme-primary)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--theme-text-dim)]">SCANLINES</span>
              <button
                onClick={() => setSettings((s) => ({ ...s, scanlines: !s.scanlines }))}
                className={`px-4 py-1 border ${settings.scanlines ? "border-[var(--theme-success)] glow-success" : "border-[var(--theme-danger)] glow-danger"}`}
              >
                {settings.scanlines ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--theme-text-dim)]">VHS FLICKER</span>
              <button
                onClick={() => setSettings((s) => ({ ...s, flicker: !s.flicker }))}
                className={`px-4 py-1 border ${settings.flicker ? "border-[var(--theme-success)] glow-success" : "border-[var(--theme-danger)] glow-danger"}`}
              >
                {settings.flicker ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--theme-text-dim)]">SOUND EFFECTS</span>
              <button
                onClick={() => setSettings((s) => ({ ...s, soundEffects: !s.soundEffects }))}
                className={`px-4 py-1 border ${settings.soundEffects ? "border-[var(--theme-success)] glow-success" : "border-[var(--theme-danger)] glow-danger"}`}
              >
                {settings.soundEffects ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--theme-text-dim)]">NOTIFICATIONS</span>
              <button
                onClick={() => setSettings((s) => ({ ...s, notifications: !s.notifications }))}
                className={`px-4 py-1 border ${settings.notifications ? "border-[var(--theme-success)] glow-success" : "border-[var(--theme-danger)] glow-danger"}`}
              >
                {settings.notifications ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="flex-1 neon-border glass-panel p-3">
          <pre className="text-[10px] glow-secondary mb-3">◈ API CONNECTIONS</pre>

          <div className="space-y-3 text-[10px]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="glow-primary">HYPERLIQUID</span>
                <span className="glow-success">● CONNECTED</span>
              </div>
              <input
                type="password"
                value={apiKeys.hyperliquid}
                className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] px-2 py-1 text-[var(--theme-text-dim)]"
                readOnly
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="glow-secondary">ASTER</span>
                <span className="glow-success">● CONNECTED</span>
              </div>
              <input
                type="password"
                value={apiKeys.aster}
                className="w-full bg-[var(--theme-bg)] border border-[var(--theme-secondary)] px-2 py-1 text-[var(--theme-text-dim)]"
                readOnly
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="glow-accent">NADO</span>
                <span className="glow-danger">● NOT CONNECTED</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter API Key..."
                  className="flex-1 bg-[var(--theme-bg)] border border-[var(--theme-accent)] px-2 py-1 text-[var(--theme-text)] placeholder:text-[var(--theme-text-dim)]"
                />
                <button className="px-3 py-1 border border-[var(--theme-accent)] glow-accent hover:bg-[var(--theme-accent)]/20">
                  CONNECT
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="glow-success">ORDERLY</span>
                <span className="glow-success">● CONNECTED</span>
              </div>
              <input
                type="password"
                value={apiKeys.orderly}
                className="w-full bg-[var(--theme-bg)] border border-[var(--theme-success)] px-2 py-1 text-[var(--theme-text-dim)]"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="neon-border glass-panel p-3">
        <pre className="text-[9px] text-[var(--theme-text-dim)] text-center">
          {`┌────────────────────────────────────────────────────────────────────────────────────────┐
│  VYBE TRADING TERMINAL v3.0.0  │  BUILD: 20240125  │  © 2025 VYBE LABS  │  [SAVE]     │
└────────────────────────────────────────────────────────────────────────────────────────┘`}
        </pre>
      </div>
    </div>
  )
}
