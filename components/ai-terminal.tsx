"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { GlitchText } from "./glitch-text"
import { StatusIndicator } from "./status-indicator"

interface Message {
  type: "user" | "ai"
  content: string
}

export function AITerminal() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [neuralActivity, setNeuralActivity] = useState(0)
  const [processingStage, setProcessingStage] = useState("")

  useEffect(() => {
    const timer = setInterval(() => setCursorVisible((v) => !v), 530)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralActivity((prev) => {
        const change = (Math.random() - 0.5) * 20
        return Math.max(10, Math.min(100, prev + change))
      })
    }, 200)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input
    setInput("")
    setMessages((prev) => [...prev, { type: "user", content: userMessage }])
    setIsTyping(true)

    setProcessingStage("PARSING QUERY")
    setTimeout(() => setProcessingStage("ANALYZING MARKET DATA"), 400)
    setTimeout(() => setProcessingStage("GENERATING STRATEGY"), 800)
    setTimeout(() => setProcessingStage("RUNNING SIMULATIONS"), 1200)

    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage)
      setMessages((prev) => [...prev, { type: "ai", content: aiResponse.short }])
      setIsTyping(false)
      setProcessingStage("")

      if (aiResponse.detailed) {
        setModalContent(aiResponse.detailed)
        setShowModal(true)
      }
    }, 1500)
  }

  const generateAIResponse = (query: string): { short: string; detailed?: string } => {
    if (query.toLowerCase().includes("strategy")) {
      return {
        short: "◈ STRATEGY SYNTHESIS COMPLETE. NEURAL ANALYSIS READY...",
        detailed: `
╔══════════════════════════════════════════════════════════════════════════════╗
║  ██╗   ██╗██╗   ██╗██████╗ ███████╗     █████╗ ██╗                           ║
║  ██║   ██║╚██╗ ██╔╝██╔══██╗██╔════╝    ██╔══██╗██║                           ║
║  ██║   ██║ ╚████╔╝ ██████╔╝█████╗      ███████║██║                           ║
║  ╚██╗ ██╔╝  ╚██╔╝  ██╔══██╗██╔══╝      ██╔══██║██║                           ║
║   ╚████╔╝    ██║   ██████╔╝███████╗    ██║  ██║██║                           ║
║    ╚═══╝     ╚═╝   ╚═════╝ ╚══════╝    ╚═╝  ╚═╝╚═╝                           ║
║                                                                              ║
║                    NEURAL STRATEGY ANALYSIS v3.0                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  QUERY: "${query}"                                                           ║
║  NEURAL CONFIDENCE: ████████████████░░░░ 82%                                ║
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ ◈ RECOMMENDED STRATEGY: MOMENTUM SCALPING                               │ ║
║  │                                                                         │ ║
║  │ ENTRY CONDITIONS:                                                       │ ║
║  │   ├── RSI(14) crosses above 30 from oversold                           │ ║
║  │   ├── Price above VWAP                                                  │ ║
║  │   └── Volume > 1.5x 20-period average                                  │ ║
║  │                                                                         │ ║
║  │ EXIT CONDITIONS:                                                        │ ║
║  │   ├── Take profit: +0.8%                                               │ ║
║  │   ├── Stop loss: -0.4%                                                 │ ║
║  │   └── Trailing stop: 0.3% after +0.5%                                  │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ◇ BACKTEST RESULTS (90 DAYS):                                              ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ Total Trades: 247    │ Win Rate: 68.4%    │ Profit Factor: 2.14       │ ║
║  │ Avg Win: +0.72%      │ Avg Loss: -0.38%   │ Max Drawdown: -4.2%       │ ║
║  │ Sharpe: 2.31         │ Sortino: 3.45      │ Total Return: +34.7%      │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  RISK ASSESSMENT: ████████░░░░░░░░░░░░ MEDIUM                               ║
║  MARKET FIT: █████████████████░░░ HIGH                                      ║
║                                                                              ║
║  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐           ║
║  │  ◈ DEPLOY NOW    │  │ ◇ RUN BACKTEST   │  │   ◆ MODIFY       │           ║
║  └──────────────────┘  └──────────────────┘  └──────────────────┘           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝`,
      }
    }
    return { short: "◈ NEURAL ANALYSIS COMPLETE. DATA SYNTHESIZED." }
  }

  const activityBars = Array.from({ length: 8 }, (_, i) => {
    const height = Math.min(100, Math.max(20, neuralActivity + (Math.random() - 0.5) * 40))
    return height
  })

  return (
    <>
      <div className="mt-2 neon-border glass-panel p-3 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${50 + Math.sin(Date.now() / 1000) * 20}% 50%, rgba(0, 255, 136, 0.3), transparent 70%)`,
          }}
        />

        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <StatusIndicator status="online" showPulse />
            <span className="text-[10px] text-[#00ff88]">
              <GlitchText text="VYBE NEURAL CORTEX v3.0" glitchIntensity="low" />
            </span>
            <span className="text-[10px] text-[#00ffff40]">│</span>
            <span className="text-[10px] text-[#00ffff40]">SYNAPTIC LINK ACTIVE</span>
          </div>

          <div className="flex items-end gap-[2px] h-3">
            {activityBars.map((height, i) => (
              <div
                key={i}
                className="w-[3px] bg-gradient-to-t from-cyan-500 to-green-400 transition-all duration-200"
                style={{ height: `${height}%`, opacity: 0.6 + height / 200 }}
              />
            ))}
            <span className="text-[8px] text-cyan-400/60 ml-1 tabular-nums">{neuralActivity.toFixed(0)}%</span>
          </div>
        </div>

        {/* Messages */}
        <div className="max-h-[60px] overflow-auto mb-2 relative z-10">
          {messages.slice(-3).map((msg, i) => (
            <div
              key={i}
              className={`text-[10px] fade-in-up ${msg.type === "user" ? "text-[#00ffff60]" : "glow-green"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-[#00ffff40]">{msg.type === "user" ? "◈" : "◄"}</span> {msg.content}
            </div>
          ))}
          {isTyping && (
            <div className="text-[10px] glow-green flex items-center gap-2">
              <span className="animate-pulse">◄</span>
              <span>{processingStage}</span>
              <span className="flex gap-[2px]">
                <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span
                  className="w-1 h-1 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1 h-1 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative z-10">
          <span className="glow-green text-sm">◈</span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Interface with the neural cortex..."
              className="w-full bg-transparent border-none outline-none text-[11px] glow-green placeholder:text-[#00ff8840]"
            />
            <span
              className={`absolute top-0 text-[#00ff88] pointer-events-none ${cursorVisible ? "opacity-100" : "opacity-0"}`}
              style={{
                left: input.length === 0 ? "0px" : `${Math.min(input.length * 6.6, 400)}px`,
              }}
            >
              █
            </span>
          </div>
        </form>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] bg-black/98 flex items-center justify-center p-8">
          {/* Modal background effects */}
          <div className="absolute inset-0 opacity-20 pointer-events-none neural-grid" />
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0, 255, 136, 0.2), transparent 70%)",
            }}
          />

          <div className="crt-screen w-full max-w-4xl max-h-[90vh] overflow-auto zoom-in">
            <div className="neon-border glass-panel p-6 relative">
              {/* Scan line effect */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50"
                style={{ animation: "grid-scan 2s linear infinite" }}
              />

              <pre className="text-[11px] glow-green whitespace-pre-wrap font-mono">{modalContent}</pre>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-[#00ff88] glow-green text-[11px] hover:bg-[#00ff8820] transition-all neon-border"
                >
                  [ CLOSE INTERFACE ]
                </button>
                <button className="px-6 py-2 border border-[#00ffff] glow-cyan text-[11px] hover:bg-[#00ffff20] transition-all">
                  [ DEPLOY TO MAINNET ]
                </button>
                <button className="px-6 py-2 border border-[#ff00ff] glow-magenta text-[11px] hover:bg-[#ff00ff20] transition-all">
                  [ RUN SIMULATION ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
