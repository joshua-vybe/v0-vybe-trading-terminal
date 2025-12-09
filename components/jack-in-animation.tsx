"use client"

import { useState, useEffect, useCallback } from "react"
import { VybeLogo } from "./vybe-logo"

interface JackInAnimationProps {
  onComplete: () => void
}

export function JackInAnimation({ onComplete }: JackInAnimationProps) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [glitchIntensity, setGlitchIntensity] = useState(0)
  const [screenTear, setScreenTear] = useState<number[]>([])
  const [corruption, setCorruption] = useState<{ x: number; y: number; w: number; h: number }[]>([])
  const [flashColor, setFlashColor] = useState<string | null>(null)
  const [shakeIntensity, setShakeIntensity] = useState(0)
  const [neuralSurge, setNeuralSurge] = useState(false)
  const [staticNoise, setStaticNoise] = useState(0)

  const phases = [
    ">> BREACHING ICE...",
    ">> BYPASSING NEURAL FIREWALL",
    ">> CONSCIOUSNESS FRAGMENTING",
    ">> SYNAPTIC OVERRIDE",
    ">> ENTERING THE NET",
    ">> JACKING IN...",
    ">> WELCOME TO THE MACHINE",
  ]

  const warningMessages = [
    "NEURAL DAMAGE IMMINENT",
    "BLACK ICE DETECTED",
    "COGNITIVE LOAD: CRITICAL",
    "FLATLINE RISK: 12.7%",
    "SYNAPTIC BLEED DETECTED",
    "MEMORY CORRUPTION",
    "IDENTITY FRAGMENTATION",
    "REALITY ANCHOR: UNSTABLE",
  ]

  // Generate random corruption blocks
  const generateCorruption = useCallback(() => {
    const blocks = []
    const count = Math.floor(Math.random() * 8) + 3
    for (let i = 0; i < count; i++) {
      blocks.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        w: Math.random() * 30 + 5,
        h: Math.random() * 10 + 2,
      })
    }
    return blocks
  }, [])

  useEffect(() => {
    // Progress with acceleration
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        // Accelerate towards end
        const increment = prev < 50 ? 0.8 : prev < 80 ? 1.2 : 2
        return Math.min(prev + increment, 100)
      })
    }, 25)

    // Chaotic phase transitions with increasing chaos
    const phaseTimers = [
      setTimeout(() => {
        setPhase(1)
        setGlitchIntensity(20)
      }, 400),
      setTimeout(() => {
        setPhase(2)
        setGlitchIntensity(40)
        setNeuralSurge(true)
      }, 800),
      setTimeout(() => {
        setNeuralSurge(false)
      }, 1000),
      setTimeout(() => {
        setPhase(3)
        setGlitchIntensity(60)
        setShakeIntensity(5)
      }, 1200),
      setTimeout(() => {
        setPhase(4)
        setGlitchIntensity(80)
        setNeuralSurge(true)
      }, 1600),
      setTimeout(() => {
        setNeuralSurge(false)
        setShakeIntensity(10)
      }, 1800),
      setTimeout(() => {
        setPhase(5)
        setGlitchIntensity(100)
      }, 2000),
      setTimeout(() => {
        setPhase(6)
        setShakeIntensity(20)
      }, 2400),
      setTimeout(() => {
        setFlashColor("#fff")
      }, 2600),
      setTimeout(() => onComplete(), 2800),
    ]

    // Rapid glitch effects
    const glitchInterval = setInterval(() => {
      // Screen tears
      if (Math.random() > 0.5) {
        const tears = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => Math.random() * 100)
        setScreenTear(tears)
        setTimeout(() => setScreenTear([]), 50 + Math.random() * 100)
      }

      // Corruption blocks
      if (Math.random() > 0.6) {
        setCorruption(generateCorruption())
        setTimeout(() => setCorruption([]), 80)
      }

      // Color flashes
      if (Math.random() > 0.85) {
        const colors = ["#ff0040", "#00ff9f", "#00d4ff", "#ff00ff", "#ffff00"]
        setFlashColor(colors[Math.floor(Math.random() * colors.length)])
        setTimeout(() => setFlashColor(null), 30 + Math.random() * 50)
      }

      // Static noise
      setStaticNoise(Math.random())
    }, 40)

    return () => {
      clearInterval(progressInterval)
      clearInterval(glitchInterval)
      phaseTimers.forEach((timer) => clearTimeout(timer))
    }
  }, [onComplete, generateCorruption])

  // Generate chaotic elements
  const dataStreams = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    speed: 0.5 + Math.random() * 2,
    chars: Array.from({ length: 50 }, () =>
      "01アイウエオカキクケコ@#$%^&*()<>{}[]".charAt(Math.floor(Math.random() * 35)),
    ).join(""),
  }))

  const electricArcs = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    startX: 50,
    startY: 50,
    endX: Math.random() * 100,
    endY: Math.random() * 100,
    delay: Math.random() * 2,
  }))

  const hexChars = "0123456789ABCDEF死亡接続脳内侵入"
  const [chaosText, setChaosText] = useState<string[]>([])
  const [warningIdx, setWarningIdx] = useState(0)

  useEffect(() => {
    const textInterval = setInterval(() => {
      setChaosText(
        Array.from({ length: 15 }, () =>
          Array.from({ length: 40 }, () => hexChars.charAt(Math.floor(Math.random() * hexChars.length))).join(""),
        ),
      )
      setWarningIdx((prev) => (prev + 1) % warningMessages.length)
    }, 60)
    return () => clearInterval(textInterval)
  }, [])

  const shakeStyle = {
    transform: `translate(${(Math.random() - 0.5) * shakeIntensity}px, ${(Math.random() - 0.5) * shakeIntensity}px)`,
  }

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden" style={shakeStyle}>
      {/* Base static noise layer */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${0.5 + staticNoise * 0.5}' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
      />

      {/* Chromatic aberration / RGB split effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, rgba(255,0,0,${glitchIntensity * 0.002}) 0%, transparent 10%, transparent 90%, rgba(0,255,255,${glitchIntensity * 0.002}) 100%)`,
        }}
      />

      {/* Screen tear effects */}
      {screenTear.map((y, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 h-1 bg-cyan-500 mix-blend-screen"
          style={{
            top: `${y}%`,
            transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
            opacity: 0.8,
            boxShadow: "0 0 10px #00ffff",
          }}
        />
      ))}

      {/* Corruption blocks */}
      {corruption.map((block, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${block.x}%`,
            top: `${block.y}%`,
            width: `${block.w}%`,
            height: `${block.h}%`,
            background: `linear-gradient(${Math.random() * 360}deg, #ff0040, #00ffff, #ff00ff)`,
            mixBlendMode: "difference",
            opacity: 0.7,
          }}
        />
      ))}

      {/* Vertical data streams - Matrix style but chaotic */}
      {dataStreams.map((stream) => (
        <div
          key={stream.id}
          className="absolute top-0 font-mono text-[8px] leading-none text-green-500 opacity-40 whitespace-pre"
          style={{
            left: `${stream.x}%`,
            animation: `dataFall ${stream.speed}s linear infinite`,
            textShadow: "0 0 5px #00ff00",
            writingMode: "vertical-rl",
          }}
        >
          {stream.chars}
        </div>
      ))}

      {/* Electric arcs */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {electricArcs.map((arc) => (
          <g key={arc.id}>
            <line
              x1={`${arc.startX}%`}
              y1={`${arc.startY}%`}
              x2={`${arc.endX}%`}
              y2={`${arc.endY}%`}
              stroke="#00ffff"
              strokeWidth="1"
              opacity={phase > 2 ? 0.6 : 0}
              style={{
                animation: `electricFlicker 0.1s ease-in-out infinite`,
                animationDelay: `${arc.delay}s`,
                filter: "blur(1px) drop-shadow(0 0 3px #00ffff)",
              }}
            />
          </g>
        ))}
      </svg>

      {/* Chaos text streams - edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 overflow-hidden font-mono text-[9px] text-red-500/60">
        {chaosText.map((line, i) => (
          <div
            key={i}
            className="whitespace-nowrap"
            style={{ transform: `translateX(${Math.sin(Date.now() / 100 + i) * 10}px)` }}
          >
            {line}
          </div>
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-32 overflow-hidden font-mono text-[9px] text-cyan-500/60 text-right">
        {chaosText.map((line, i) => (
          <div
            key={i}
            className="whitespace-nowrap"
            style={{ transform: `translateX(${Math.cos(Date.now() / 100 + i) * 10}px)` }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Neural surge flash */}
      {neuralSurge && <div className="absolute inset-0 bg-cyan-500/30 animate-pulse pointer-events-none" />}

      {/* Warning overlay */}
      {phase >= 2 && phase < 6 && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <div
            className="font-mono text-red-500 text-sm tracking-widest animate-pulse"
            style={{ textShadow: "0 0 10px #ff0000, 0 0 20px #ff0000" }}
          >
            ⚠ {warningMessages[warningIdx]} ⚠
          </div>
        </div>
      )}

      {/* Center vortex effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Spinning chaos rings */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute border rounded-full"
            style={{
              width: `${150 + i * 60}px`,
              height: `${150 + i * 60}px`,
              borderColor: i % 2 === 0 ? "rgba(0,255,255,0.3)" : "rgba(255,0,100,0.3)",
              animation: `spin ${2 + i * 0.5}s linear infinite ${i % 2 === 0 ? "" : "reverse"}`,
              boxShadow: i % 2 === 0 ? "0 0 20px rgba(0,255,255,0.3)" : "0 0 20px rgba(255,0,100,0.3)",
            }}
          />
        ))}

        {/* Pulsing core */}
        <div
          className="absolute w-40 h-40 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,255,255,0.4) 0%, transparent 70%)",
            animation: "corePulse 0.3s ease-in-out infinite",
            boxShadow: "0 0 60px rgba(0,255,255,0.5)",
          }}
        />

        {/* Glitching logo */}
        <div
          className="relative z-10"
          style={{
            filter: `drop-shadow(0 0 30px rgba(0, 255, 255, 0.8)) drop-shadow(${glitchIntensity > 50 ? "3px 0 0 rgba(255,0,0,0.5)" : "0 0 0 transparent"}) drop-shadow(${glitchIntensity > 50 ? "-3px 0 0 rgba(0,255,255,0.5)" : "0 0 0 transparent"})`,
            transform: glitchIntensity > 70 ? `skewX(${(Math.random() - 0.5) * 5}deg)` : "none",
          }}
        >
          <VybeLogo size="xl" glitch={true} />
        </div>
      </div>

      {/* Scanlines - more aggressive */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
          animation: "scanlineMove 0.1s linear infinite",
        }}
      />

      {/* Progress section - cyberpunk style */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[500px]">
        {/* Phase text with glitch */}
        <div className="text-center mb-4 relative">
          <span
            className={`font-mono text-xl tracking-[0.2em] ${phase === 6 ? "text-green-400" : "text-cyan-400"}`}
            style={{
              textShadow: phase === 6 ? "0 0 20px #00ff00, 0 0 40px #00ff00" : "0 0 20px #00ffff, 0 0 40px #00ffff",
              animation: glitchIntensity > 60 ? "textGlitch 0.1s ease-in-out infinite" : "none",
            }}
          >
            {phases[phase]}
          </span>
          {/* Glitch duplicate */}
          {glitchIntensity > 50 && (
            <>
              <span
                className="absolute left-1/2 -translate-x-1/2 font-mono text-xl tracking-[0.2em] text-red-500/50"
                style={{ transform: "translateX(calc(-50% + 2px))" }}
              >
                {phases[phase]}
              </span>
              <span
                className="absolute left-1/2 -translate-x-1/2 font-mono text-xl tracking-[0.2em] text-cyan-500/50"
                style={{ transform: "translateX(calc(-50% - 2px))" }}
              >
                {phases[phase]}
              </span>
            </>
          )}
        </div>

        {/* Progress bar - more aggressive */}
        <div className="relative h-3 bg-gray-900/80 border border-cyan-500/50 overflow-hidden">
          {/* Background pulse */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(90deg, #ff0040, #00ffff, #ff00ff, #00ffff, #ff0040)",
              backgroundSize: "200% 100%",
              animation: "gradientShift 1s linear infinite",
            }}
          />
          {/* Main progress */}
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #00ffff, #00ff9f, #00ffff)",
              boxShadow: "0 0 20px #00ffff, 0 0 40px #00ffff",
              transition: "width 0.05s linear",
            }}
          />
          {/* Glitch segments */}
          {glitchIntensity > 40 &&
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-y-0 bg-white/80"
                style={{
                  left: `${Math.random() * progress}%`,
                  width: "2px",
                  animation: "glitchBar 0.1s ease-in-out infinite",
                }}
              />
            ))}
        </div>

        {/* Stats row */}
        <div className="flex justify-between mt-3 font-mono text-xs">
          <span className="text-red-500">{`NEURAL_LOAD: ${Math.floor(progress * 0.8 + Math.random() * 20)}%`}</span>
          <span className="text-cyan-400">{progress.toFixed(1)}%</span>
          <span className="text-magenta-500">{`SYNC: ${(progress * 0.01).toFixed(3)}ms`}</span>
        </div>

        {/* Chaotic phase indicators */}
        <div className="flex justify-center gap-3 mt-4">
          {phases.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 transition-all duration-100 ${
                i <= phase
                  ? i === phase
                    ? "bg-cyan-400 shadow-[0_0_15px_#00ffff] scale-150"
                    : "bg-green-400 shadow-[0_0_10px_#00ff00]"
                  : "bg-gray-700"
              }`}
              style={{
                transform: i === phase ? `rotate(${(Date.now() / 10) % 360}deg)` : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Color flash overlay */}
      {flashColor && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: flashColor,
            opacity: flashColor === "#fff" ? 0.9 : 0.3,
            animation: flashColor === "#fff" ? "finalFlash 0.3s ease-out forwards" : "none",
          }}
        />
      )}

      {/* Final phase effects */}
      {phase === 6 && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent pointer-events-none animate-pulse" />
          <div
            className="absolute bottom-40 left-1/2 -translate-x-1/2 font-mono text-green-400 text-2xl tracking-[0.5em]"
            style={{ textShadow: "0 0 30px #00ff00, 0 0 60px #00ff00" }}
          >
            NEURAL LINK ESTABLISHED
          </div>
        </>
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes dataFall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes corePulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 1; }
        }
        @keyframes electricFlicker {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0; }
        }
        @keyframes textGlitch {
          0% { transform: translateX(-50%) skewX(0deg); }
          20% { transform: translateX(-50%) skewX(2deg); }
          40% { transform: translateX(calc(-50% + 2px)) skewX(-1deg); }
          60% { transform: translateX(calc(-50% - 2px)) skewX(1deg); }
          80% { transform: translateX(-50%) skewX(-2deg); }
          100% { transform: translateX(-50%) skewX(0deg); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes glitchBar {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes scanlineMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes finalFlash {
          0% { opacity: 0.9; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
