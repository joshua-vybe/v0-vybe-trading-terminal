"use client"

import { useEffect, useState } from "react"

interface RainDrop {
  id: number
  x: number
  delay: number
  duration: number
  opacity: number
  chars: string[]
}

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01"

export function CyberRain({ opacity = 0.15 }: { opacity?: number }) {
  const [drops, setDrops] = useState<RainDrop[]>([])

  useEffect(() => {
    const newDrops: RainDrop[] = []
    for (let i = 0; i < 40; i++) {
      // Each drop is now a stream of characters
      const streamLength = 5 + Math.floor(Math.random() * 10)
      const chars: string[] = []
      for (let j = 0; j < streamLength; j++) {
        chars.push(CHARS[Math.floor(Math.random() * CHARS.length)])
      }

      newDrops.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 15,
        duration: 10 + Math.random() * 15,
        opacity: 0.3 + Math.random() * 0.7,
        chars,
      })
    }
    setDrops(newDrops)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[2]" style={{ opacity }}>
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute flex flex-col text-xs font-mono"
          style={{
            left: `${drop.x}%`,
            opacity: drop.opacity,
            animation: `cyber-fall ${drop.duration}s linear infinite`,
            animationDelay: `${drop.delay}s`,
          }}
        >
          {drop.chars.map((char, idx) => (
            <span
              key={idx}
              className="text-cyan-400"
              style={{
                opacity: 1 - (idx / drop.chars.length) * 0.8,
                textShadow: idx === 0 ? "0 0 10px #00ffff, 0 0 20px #00ffff" : "0 0 5px currentColor",
                color: idx === 0 ? "#ffffff" : undefined,
              }}
            >
              {char}
            </span>
          ))}
        </div>
      ))}
      <style jsx>{`
        @keyframes cyber-fall {
          0% { transform: translateY(-100px); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
