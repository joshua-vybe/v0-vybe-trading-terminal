"use client"

import { useEffect, useState } from "react"

interface DataRainProps {
  density?: number
  speed?: number
  opacity?: number
}

export function DataRain({ density = 30, speed = 1, opacity = 0.15 }: DataRainProps) {
  const [columns, setColumns] = useState<Array<{ chars: string[]; x: number; delay: number; speed: number }>>([])

  useEffect(() => {
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
    const newColumns = Array.from({ length: density }, (_, i) => ({
      chars: Array.from(
        { length: Math.floor(Math.random() * 20) + 10 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ),
      x: (i / density) * 100,
      delay: Math.random() * 5,
      speed: (Math.random() * 0.5 + 0.5) * speed,
    }))
    setColumns(newColumns)
  }, [density, speed])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ opacity }}>
      {columns.map((col, i) => (
        <div
          key={i}
          className="absolute top-0 text-[10px] font-mono leading-tight"
          style={{
            left: `${col.x}%`,
            animation: `data-rain ${3 / col.speed}s linear infinite`,
            animationDelay: `${col.delay}s`,
          }}
        >
          {col.chars.map((char, j) => (
            <div
              key={j}
              className="text-cyan-500"
              style={{
                opacity: 1 - (j / col.chars.length) * 0.8,
                textShadow: j === 0 ? "0 0 10px #00ffff, 0 0 20px #00ffff" : "none",
                color: j === 0 ? "#ffffff" : undefined,
              }}
            >
              {char}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
