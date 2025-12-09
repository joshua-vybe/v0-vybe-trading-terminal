"use client"

import { useState, useEffect } from "react"
import { VybeLogoSVG } from "./vybe-logo"
import { StatusIndicator } from "./status-indicator"
import { GlitchText } from "./glitch-text"

export function TerminalHeader() {
  const [time, setTime] = useState(new Date())
  const [price, setPrice] = useState(43293.51)
  const [priceChange, setPriceChange] = useState(2.34)
  const [pnl, setPnl] = useState(345.25)
  const [connected, setConnected] = useState(false)
  const [isJackingIn, setIsJackingIn] = useState(false)
  const [jackInPhase, setJackInPhase] = useState(0)
  const [walletBalance, setWalletBalance] = useState({
    btc: 1.2453,
    usd: 53892.45,
  })
  const [networkStats, setNetworkStats] = useState({ latency: 12, block: 19847293, txPool: 847 })
  const [dataPackets, setDataPackets] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
      setPrice((p) => p + (Math.random() - 0.5) * 10)
      setPnl((p) => p + (Math.random() - 0.5) * 5)
      setNetworkStats((prev) => ({
        latency: Math.max(8, Math.min(20, prev.latency + (Math.random() - 0.5) * 2)),
        block: prev.block + (Math.random() > 0.7 ? 1 : 0),
        txPool: Math.max(500, Math.min(1200, prev.txPool + Math.floor((Math.random() - 0.5) * 50))),
      }))
      setDataPackets((prev) => prev + Math.floor(Math.random() * 50))
      if (connected) {
        setWalletBalance((prev) => ({
          ...prev,
          usd: prev.btc * price,
        }))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [connected, price])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const handleJackIn = () => {
    if (connected) {
      setConnected(false)
      return
    }

    setIsJackingIn(true)
    setJackInPhase(1)

    // Phase 1: Initial pulse
    setTimeout(() => setJackInPhase(2), 300)
    // Phase 2: Neural sync
    setTimeout(() => setJackInPhase(3), 700)
    // Phase 3: Data stream
    setTimeout(() => setJackInPhase(4), 1100)
    // Phase 4: Connected
    setTimeout(() => {
      setJackInPhase(0)
      setIsJackingIn(false)
      setConnected(true)
    }, 1500)
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 neon-border glass-panel relative overflow-hidden">
      {isJackingIn && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {/* Expanding rings */}
          <div className="absolute right-[100px] top-1/2 -translate-y-1/2">
            <div
              className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400"
              style={{
                animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
                boxShadow: "0 0 20px #00ffff",
              }}
            />
            <div
              className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400"
              style={{
                animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite 0.2s",
                boxShadow: "0 0 20px #00ffff",
              }}
            />
            <div
              className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400"
              style={{
                animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite 0.4s",
                boxShadow: "0 0 20px #00ffff",
              }}
            />
          </div>

          {/* Scanning line */}
          <div
            className="absolute h-full w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60"
            style={{
              animation: "scan-line 0.8s ease-in-out infinite",
              boxShadow: "0 0 15px #00ffff",
            }}
          />

          {/* Neural connection lines */}
          {jackInPhase >= 2 && (
            <svg className="absolute inset-0 w-full h-full">
              <line
                x1="0%"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="#00ffff"
                strokeWidth="1"
                strokeDasharray="5,5"
                style={{
                  animation: "dash 0.5s linear infinite",
                  filter: "drop-shadow(0 0 5px #00ffff)",
                }}
              />
              <line
                x1="50%"
                y1="0%"
                x2="50%"
                y2="100%"
                stroke="#00ffff"
                strokeWidth="1"
                strokeDasharray="5,5"
                style={{
                  animation: "dash 0.5s linear infinite 0.1s",
                  filter: "drop-shadow(0 0 5px #00ffff)",
                }}
              />
            </svg>
          )}

          {/* Data particles */}
          {jackInPhase >= 3 && (
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float-particle 0.5s ease-out forwards`,
                    animationDelay: `${i * 0.05}s`,
                    boxShadow: "0 0 6px #00ffff",
                  }}
                />
              ))}
            </div>
          )}

          {/* Flash on connect */}
          {jackInPhase === 4 && (
            <div
              className="absolute inset-0 bg-cyan-400"
              style={{
                animation: "flash-connect 0.4s ease-out forwards",
              }}
            />
          )}
        </div>
      )}

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none data-stream-bg" />

      <div className="flex items-center gap-4 relative z-10">
        <VybeLogoSVG size="sm" glitch={true} />
        <span className="text-[10px] text-cyan-500/50 tracking-wider">
          <GlitchText text="NEURAL v3.0" glitchIntensity="low" />
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1 border border-[#00ffff40] relative z-10 neural-pulse">
        <span className="text-[11px] text-[#00ffff60]">BTC-USD</span>
        <span className="text-[14px] glow-cyan font-bold tabular-nums">${price.toFixed(2)}</span>
        <span className={`text-[11px] ${priceChange >= 0 ? "glow-green" : "glow-crimson"}`}>
          {priceChange >= 0 ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}%
        </span>
      </div>

      <div className="flex items-center gap-6 text-[11px] relative z-10">
        <StatusIndicator status="online" label="NEURAL LINK" />
        <div className="flex items-center gap-1">
          <span className="text-[#00ffff60]">LAT:</span>
          <span className="glow-cyan tabular-nums">{networkStats.latency.toFixed(0)}ms</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#00ffff60]">BLK:</span>
          <span className="glow-cyan tabular-nums">#{networkStats.block.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#00ffff60]">TX:</span>
          <span className="glow-magenta tabular-nums">{networkStats.txPool}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 border border-[#00ffff40]">
          <span className="text-[#00ffff60]">PNL:</span>
          <span className={`tabular-nums ${pnl >= 0 ? "glow-green" : "glow-crimson"}`}>
            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Right: Time + Wallet */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="text-right">
          <div className="text-[10px] text-[#00ffff60]">SYNC TIME</div>
          <div className="text-sm glow-cyan font-bold tracking-wider tabular-nums">{formatTime(time)}</div>
        </div>

        {connected && (
          <div className="flex flex-col items-end px-2 py-1 border border-[#00ff8840] fade-in-up">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-[#00ff8880]">BTC</span>
              <span className="glow-green font-bold tabular-nums">{walletBalance.btc.toFixed(4)}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-[#00ff8880]">USD</span>
              <span className="glow-green tabular-nums">
                ${walletBalance.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleJackIn}
          disabled={isJackingIn}
          className={`px-3 py-2 text-[11px] transition-all duration-300 relative overflow-hidden ${
            isJackingIn
              ? "border border-cyan-400 bg-cyan-400/20"
              : connected
                ? "glow-green border border-[#00ff88] hover:bg-[#00ff8820] neon-border"
                : "glow-cyan border border-[#00ffff] hover:bg-[#00ffff20] neon-border hologram"
          }`}
        >
          {isJackingIn ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span style={{ animation: "glitch-text 0.1s infinite" }}>
                {jackInPhase === 1 && "INITIATING..."}
                {jackInPhase === 2 && "SYNCING..."}
                {jackInPhase === 3 && "LINKING..."}
                {jackInPhase === 4 && "CONNECTED"}
              </span>
            </span>
          ) : connected ? (
            <span>◉ 0x7f...3a2b</span>
          ) : (
            <span>[ JACK IN ]</span>
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes scan-line {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes dash {
          to { stroke-dashoffset: -10; }
        }
        @keyframes float-particle {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(2) translateY(-10px); opacity: 0; }
        }
        @keyframes flash-connect {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes glitch-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; transform: translateX(1px); }
        }
      `}</style>
    </div>
  )
}
