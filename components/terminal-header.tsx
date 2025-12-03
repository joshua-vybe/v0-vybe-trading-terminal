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

  return (
    <div className="flex items-center justify-between px-3 py-2 neon-border glass-panel relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none data-stream-bg" />

      <div className="flex items-center gap-4 relative z-10">
        <VybeLogoSVG size="sm" />
        <span className="text-[9px] text-cyan-500/50 tracking-wider">
          <GlitchText text="NEURAL v3.0" glitchIntensity="low" />
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1 border border-[#00ffff40] relative z-10 neural-pulse">
        <span className="text-[10px] text-[#00ffff60]">BTC-USD</span>
        <span className="text-[14px] glow-cyan font-bold tabular-nums">${price.toFixed(2)}</span>
        <span className={`text-[10px] ${priceChange >= 0 ? "glow-green" : "glow-crimson"}`}>
          {priceChange >= 0 ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}%
        </span>
      </div>

      <div className="flex items-center gap-6 text-[10px] relative z-10">
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
          <div className="text-[9px] text-[#00ffff60]">SYNC TIME</div>
          <div className="text-sm glow-cyan font-bold tracking-wider tabular-nums">{formatTime(time)}</div>
        </div>

        {connected && (
          <div className="flex flex-col items-end px-2 py-1 border border-[#00ff8840] fade-in-up">
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-[#00ff8880]">BTC</span>
              <span className="glow-green font-bold tabular-nums">{walletBalance.btc.toFixed(4)}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-[#00ff8880]">USD</span>
              <span className="glow-green tabular-nums">
                ${walletBalance.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => setConnected(!connected)}
          className={`px-3 py-2 text-[10px] transition-all duration-300 ${
            connected
              ? "glow-green border border-[#00ff88] hover:bg-[#00ff8820] neon-border"
              : "glow-cyan border border-[#00ffff] hover:bg-[#00ffff20] neon-border hologram"
          }`}
        >
          {connected ? <span>◉ 0x7f...3a2b</span> : <span>[ JACK IN ]</span>}
        </button>
      </div>
    </div>
  )
}
