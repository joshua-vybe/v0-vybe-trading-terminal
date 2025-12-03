"use client"

import { useState, useEffect } from "react"
import { VybeLogo } from "./vybe-logo"

interface JackInAnimationProps {
  onComplete: () => void
}

export function JackInAnimation({ onComplete }: JackInAnimationProps) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [glitchActive, setGlitchActive] = useState(false)

  const phases = [
    "INITIATING NEURAL HANDSHAKE",
    "SYNCHRONIZING CONSCIOUSNESS",
    "TRANSFERRING TO NEURAL MATRIX",
    "JACKING IN...",
    "CONNECTED",
  ]

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 1
      })
    }, 30)

    // Phase transitions
    const phaseTimers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2400),
      setTimeout(() => onComplete(), 3200),
    ]

    // Random glitch effects
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 100)
      }
    }, 200)

    return () => {
      clearInterval(progressInterval)
      clearInterval(glitchInterval)
      phaseTimers.forEach((timer) => clearTimeout(timer))
    }
  }, [onComplete])

  // Generate neural network nodes
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: i * 30 * (Math.PI / 180),
    delay: i * 0.1,
  }))

  // Generate hex data streams
  const hexChars = "0123456789ABCDEF"
  const generateHexLine = () => Array.from({ length: 32 }, () => hexChars[Math.floor(Math.random() * 16)]).join("")

  const [hexLines, setHexLines] = useState<string[]>([])

  useEffect(() => {
    const lines = Array.from({ length: 20 }, generateHexLine)
    setHexLines(lines)

    const hexInterval = setInterval(() => {
      setHexLines((prev) => {
        const newLines = [...prev]
        const randomIndex = Math.floor(Math.random() * newLines.length)
        newLines[randomIndex] = generateHexLine()
        return newLines
      })
    }, 50)

    return () => clearInterval(hexInterval)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden ${glitchActive ? "translate-x-[2px]" : ""}`}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
          }}
        />
      </div>

      {/* Hex data streams - left side */}
      <div className="absolute left-4 top-0 bottom-0 w-48 overflow-hidden opacity-30 font-mono text-[10px] text-cyan-500">
        {hexLines.map((line, i) => (
          <div
            key={i}
            className="whitespace-nowrap"
            style={{
              animation: `slideDown 3s linear infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Hex data streams - right side */}
      <div className="absolute right-4 top-0 bottom-0 w-48 overflow-hidden opacity-30 font-mono text-[10px] text-cyan-500 text-right">
        {hexLines.map((line, i) => (
          <div
            key={i}
            className="whitespace-nowrap"
            style={{
              animation: `slideDown 3s linear infinite`,
              animationDelay: `${i * 0.15 + 0.5}s`,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Neural network nodes */}
      <div className="absolute inset-0 flex items-center justify-center">
        {nodes.map((node) => {
          const x = Math.cos(node.angle) * 200
          const y = Math.sin(node.angle) * 200
          return (
            <div
              key={node.id}
              className="absolute w-3 h-3 rounded-full bg-cyan-500"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                animation: `pulse 1s ease-in-out infinite`,
                animationDelay: `${node.delay}s`,
                boxShadow: "0 0 20px rgba(0, 255, 255, 0.8)",
              }}
            >
              {/* Connection line to center */}
              <div
                className="absolute bg-gradient-to-r from-cyan-500 to-transparent h-[1px]"
                style={{
                  width: "200px",
                  transformOrigin: "left center",
                  transform: `rotate(${180 + (node.angle * 180) / Math.PI}deg)`,
                  animation: `fadeIn 0.5s ease-out forwards`,
                  animationDelay: `${node.delay + 0.3}s`,
                  opacity: 0,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Center logo with orbital rings */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div
          className="absolute -inset-16 border border-cyan-500/30 rounded-full"
          style={{ animation: "spin 8s linear infinite" }}
        />
        {/* Middle rotating ring - opposite direction */}
        <div
          className="absolute -inset-12 border border-magenta-500/30 rounded-full"
          style={{ animation: "spin 6s linear infinite reverse" }}
        />
        {/* Inner rotating ring */}
        <div
          className="absolute -inset-8 border border-cyan-500/50 rounded-full"
          style={{ animation: "spin 4s linear infinite" }}
        />

        {/* Logo with glow */}
        <div
          className="relative z-10"
          style={{
            filter: "drop-shadow(0 0 30px rgba(0, 255, 255, 0.8))",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          <VybeLogo size="xl" />
        </div>
      </div>

      {/* Progress section */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-96">
        {/* Phase text */}
        <div className="text-center mb-6">
          <span
            className={`font-mono text-lg tracking-[0.3em] ${phase === 4 ? "text-green-400" : "text-cyan-400"}`}
            style={{
              textShadow: phase === 4 ? "0 0 20px rgba(0, 255, 0, 0.8)" : "0 0 20px rgba(0, 255, 255, 0.8)",
            }}
          >
            {phases[phase]}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-gray-900 border border-cyan-900 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 20px rgba(0, 255, 255, 0.8)",
              transition: "width 0.1s linear",
            }}
          />
          {/* Animated shine effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ animation: "shimmer 1s ease-in-out infinite" }}
          />
        </div>

        {/* Progress percentage */}
        <div className="text-center mt-3 font-mono text-cyan-500 text-sm">{progress}%</div>

        {/* Phase indicators */}
        <div className="flex justify-between mt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= phase ? "bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]" : "bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Flash effect on complete */}
      {phase === 4 && (
        <div
          className="absolute inset-0 bg-white pointer-events-none"
          style={{ animation: "flash 0.5s ease-out forwards" }}
        />
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        @keyframes flash {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
