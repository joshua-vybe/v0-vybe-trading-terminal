"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { VybeLogo } from "./vybe-logo"
import { DataRain } from "./data-rain"
import { NeuralNetworkBg } from "./neural-network-bg"
import { CircuitLines } from "./circuit-lines"
import { GlitchText } from "./glitch-text"
import { StatusIndicator } from "./status-indicator"

const BOOT_SEQUENCE = [
  { text: "VYBE NEURAL TRADING SYSTEMS v3.0.7", delay: 0 },
  { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", delay: 100 },
  { text: "", delay: 200 },
  { text: "[CORE] Initializing neural mesh...", delay: 300 },
  { text: "[CORE] Loading synaptic trading modules...", delay: 600 },
  { text: "[CORE] Establishing quantum-encrypted channels...", delay: 900 },
  { text: "[NET] Connecting to Hyperliquid...", delay: 1200 },
  { text: "  └── HYPERLIQUID    [████████████] SYNCED", delay: 1500 },
  { text: "", delay: 1700 },
  { text: "[SYS] Market data streams: ACTIVE", delay: 1800 },
  { text: "[SYS] AI strategy cortex: ONLINE", delay: 2000 },
  { text: "[SYS] Risk mitigation protocols: ENGAGED", delay: 2200 },
  { text: "[SYS] Neural link bandwidth: 847 Tb/s", delay: 2400 },
  { text: "", delay: 2600 },
  { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", delay: 2700 },
  { text: "", delay: 2800 },
  { text: "NEURAL AUTHENTICATION REQUIRED", delay: 2900 },
  { text: "", delay: 3000 },
  { text: "Type 'connect' to initialize neural handshake...", delay: 3100 },
]

interface CLILandingProps {
  onLogin: () => void
}

export function CLILanding({ onLogin }: CLILandingProps) {
  const [bootLines, setBootLines] = useState<string[]>([])
  const [bootComplete, setBootComplete] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [cursorVisible, setCursorVisible] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [systemTime, setSystemTime] = useState(new Date())
  const [networkStats, setNetworkStats] = useState({ latency: 12, packets: 0, bandwidth: 847 })
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setSystemTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats((prev) => ({
        latency: Math.max(8, Math.min(20, prev.latency + (Math.random() - 0.5) * 2)),
        packets: prev.packets + Math.floor(Math.random() * 100),
        bandwidth: Math.max(800, Math.min(900, prev.bandwidth + (Math.random() - 0.5) * 10)),
      }))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    BOOT_SEQUENCE.forEach((line, index) => {
      const timer = setTimeout(() => {
        setBootLines((prev) => [...prev, line.text])
        if (index === BOOT_SEQUENCE.length - 1) {
          setBootComplete(true)
        }
      }, line.delay)
      timers.push(timer)
    })

    return () => timers.forEach((t) => clearTimeout(t))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [bootLines, commandHistory])

  useEffect(() => {
    if (bootComplete && inputRef.current) {
      inputRef.current.focus()
    }
  }, [bootComplete])

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()
    const newHistory = [...commandHistory, `vybe@neural:~$ ${cmd}`]

    if (trimmed === "help") {
      setCommandHistory([
        ...newHistory,
        "",
        "╔══════════════════════════════════════════════════════╗",
        "║  VYBE NEURAL INTERFACE - COMMAND REFERENCE           ║",
        "╠══════════════════════════════════════════════════════╣",
        "║  help      Display this help message                 ║",
        "║  status    Show neural link status                   ║",
        "║  connect   Initialize neural handshake               ║",
        "║  scan      Scan for available networks               ║",
        "║  clear     Clear terminal buffer                     ║",
        "║  version   Display system version                    ║",
        "╚══════════════════════════════════════════════════════╝",
        "",
      ])
    } else if (trimmed === "status") {
      setCommandHistory([
        ...newHistory,
        "",
        "┌─ NEURAL LINK STATUS ─────────────────────────────────┐",
        `│  CPU CORES:     16 @ 4.2 GHz     [████████████] 12%  │`,
        `│  NEURAL MEM:    128 GB           [████████░░░░] 67%  │`,
        `│  BANDWIDTH:     ${networkStats.bandwidth.toFixed(0)} Tb/s          [████████████] OK   │`,
        `│  LATENCY:       ${networkStats.latency.toFixed(0)}ms             [████████████] OK   │`,
        `│  VENUE:         HYPERLIQUID      [████████████] 100% │`,
        `│  UPTIME:        47d 12h 33m 21s                      │`,
        "└───────────────────────────────────────────────────────┘",
        "",
      ])
    } else if (trimmed === "scan") {
      setCommandHistory([...newHistory, "", "[SCAN] Initializing neural scanner..."])
      setTimeout(() => setCommandHistory((prev) => [...prev, "[SCAN] Scanning frequency bands..."]), 300)
      setTimeout(() => setCommandHistory((prev) => [...prev, "[SCAN] Connected to Hyperliquid"]), 800)
      setTimeout(() => setCommandHistory((prev) => [...prev, "[SCAN] Found 2,847 connected traders"]), 1200)
      setTimeout(() => setCommandHistory((prev) => [...prev, "[SCAN] Network health: OPTIMAL"]), 1600)
      setTimeout(() => setCommandHistory((prev) => [...prev, ""]), 2000)
    } else if (trimmed === "version") {
      setCommandHistory([
        ...newHistory,
        "",
        "╔══════════════════════════════════════════════════════╗",
        "║  VYBE NEURAL TRADING INTERFACE                       ║",
        "║  Version:    3.0.7-neural-beta                       ║",
        "║  Build:      2024.12.01.2147                         ║",
        "║  Protocol:   v2.1.0-quantum                          ║",
        "║  Neural SDK: 4.2.0                                   ║",
        "╚══════════════════════════════════════════════════════╝",
        "",
      ])
    } else if (trimmed === "clear") {
      setCommandHistory([])
    } else if (trimmed === "connect") {
      setCommandHistory([
        ...newHistory,
        "",
        "[NEURAL] Initializing neural handshake...",
        "[NEURAL] Establishing encrypted tunnel...",
        "[CRYPTO] Verifying authentication...",
        "[NEURAL] ████████████████████ 100%",
        "",
        "[SUCCESS] Neural link established!",
        "[SUCCESS] Welcome, Netrunner.",
        "",
        ">>> Launching trading interface...",
      ])
      setIsConnecting(true)
      setTimeout(() => {
        onLogin()
      }, 2000)
    } else if (trimmed === "") {
      setCommandHistory(newHistory)
    } else {
      setCommandHistory([
        ...newHistory,
        `[ERROR] Unknown command: ${trimmed}`,
        "[HINT] Type 'help' for available commands.",
      ])
    }

    setCurrentInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isConnecting) {
      handleCommand(currentInput)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col font-mono overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <NeuralNetworkBg nodeCount={40} opacity={0.15} />
      <DataRain density={25} speed={0.8} opacity={0.08} />
      <CircuitLines />

      {/* Scanlines overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.5]"
        style={{ background: "radial-gradient(ellipse at center, transparent 0%, black 100%)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-4 md:p-8">
        <div className="flex justify-between items-center text-[10px] border-b border-cyan-500/20 pb-2 mb-6">
          <div className="flex gap-6 items-center">
            <StatusIndicator status="online" label="NODE: US-EAST-1" />
            <span className="text-cyan-500/60">
              LATENCY: <span className="text-cyan-400">{networkStats.latency.toFixed(0)}ms</span>
            </span>
            <span className="text-cyan-500/60">
              PACKETS: <span className="text-green-400">{networkStats.packets.toLocaleString()}</span>
            </span>
          </div>
          <div className="flex gap-6 items-center">
            <span className="text-cyan-500/60">
              BANDWIDTH: <span className="text-cyan-400">{networkStats.bandwidth.toFixed(0)} Tb/s</span>
            </span>
            <span className="text-cyan-500/60">
              VOL 24H: <span className="text-fuchsia-400">$847.2M</span>
            </span>
            <span className="text-cyan-400 tabular-nums">{systemTime.toISOString()}</span>
          </div>
        </div>

        {/* Main content area */}
        <div
          ref={terminalRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-cyan-500/20"
        >
          <div className="flex flex-col items-center mb-8 fade-in-up">
            <VybeLogo size="lg" animate={true} />
            <div className="mt-4 text-center">
              <div className="text-fuchsia-400/80 text-xs tracking-[0.5em] uppercase">
                <GlitchText text="NEURAL TRADING INTERFACE" glitchIntensity="low" />
              </div>
              <div className="flex items-center gap-2 mt-3 justify-center text-[10px]">
                <span className="text-cyan-500/40">◄◄</span>
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-cyan-500/50" />
                <span className="text-cyan-400 tracking-[0.3em]">DECENTRALIZED PERPETUALS</span>
                <div className="w-24 h-[1px] bg-gradient-to-l from-transparent via-fuchsia-500/50 to-cyan-500/50" />
                <span className="text-cyan-500/40">►►</span>
              </div>
            </div>
          </div>

          {/* Boot sequence with staggered animations */}
          {bootLines.map((line, i) => (
            <div
              key={i}
              className={`text-xs md:text-sm leading-relaxed fade-in-up ${
                line.includes("[CORE]")
                  ? "text-fuchsia-400/70"
                  : line.includes("[NET]")
                    ? "text-cyan-400/70"
                    : line.includes("SYNCED")
                      ? "text-green-400/90"
                      : line.includes("[SYS]")
                        ? "text-cyan-500/70"
                        : line.includes("AUTHENTICATION") || line.includes("NEURAL AUTHENTICATION")
                          ? "text-yellow-400 font-bold neural-pulse"
                          : line.includes("━")
                            ? "text-cyan-500/30"
                            : "text-gray-400"
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {line}
            </div>
          ))}

          {/* Command history */}
          {commandHistory.map((line, i) => (
            <div
              key={`cmd-${i}`}
              className={`text-xs md:text-sm leading-relaxed ${
                line.startsWith("vybe@neural")
                  ? "text-green-400"
                  : line.includes("[NEURAL]") || line.includes("[CRYPTO]")
                    ? "text-fuchsia-400/80"
                    : line.includes("[SUCCESS]")
                      ? "text-green-400 font-bold"
                      : line.includes("[ERROR]")
                        ? "text-red-400"
                        : line.includes("[HINT]")
                          ? "text-yellow-400/60"
                          : line.includes("[SCAN]")
                            ? "text-cyan-400/80"
                            : line.includes(">>>")
                              ? "text-fuchsia-400 font-bold hologram"
                              : line.includes("╔") ||
                                  line.includes("║") ||
                                  line.includes("╚") ||
                                  line.includes("╠") ||
                                  line.includes("┌") ||
                                  line.includes("│") ||
                                  line.includes("└")
                                ? "text-cyan-500/60"
                                : "text-gray-300"
              }`}
            >
              {line}
            </div>
          ))}

          {/* Command prompt */}
          {bootComplete && !isConnecting && (
            <div className="flex items-center text-xs md:text-sm mt-2">
              <span className="text-fuchsia-400 mr-1">vybe</span>
              <span className="text-gray-500">@</span>
              <span className="text-cyan-400 mr-1">neural</span>
              <span className="text-gray-500">:~$</span>
              <span className="text-cyan-300 ml-2">{currentInput}</span>
              <span
                className={`w-2 h-4 bg-cyan-400 ml-0.5 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                style={{ boxShadow: "0 0 5px #00ffff, 0 0 10px #00ffff" }}
              />
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="opacity-0 absolute pointer-events-none"
            autoFocus
            disabled={isConnecting}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-cyan-500/20 pt-3 mt-4">
          <div className="flex justify-between items-center text-[10px] text-gray-500">
            <div>
              <span className="text-cyan-500/60">TIP:</span> Type{" "}
              <span className="text-fuchsia-400 font-bold">connect</span> to initialize neural handshake
            </div>
            <div className="flex gap-4 items-center">
              <StatusIndicator status="syncing" label="NEURAL MESH" showPulse />
              <span className="text-fuchsia-400/60">VYBE SYSTEMS</span>
              <span className="text-cyan-400/60">v3.0.7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
