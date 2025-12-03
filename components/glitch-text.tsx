"use client"

import { useEffect, useState } from "react"

interface GlitchTextProps {
  text: string
  className?: string
  glitchIntensity?: "low" | "medium" | "high"
}

export function GlitchText({ text, className = "", glitchIntensity = "medium" }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~01"
    const intervalTime = glitchIntensity === "low" ? 5000 : glitchIntensity === "medium" ? 3000 : 1500

    const interval = setInterval(() => {
      setIsGlitching(true)

      let iterations = 0
      const maxIterations = glitchIntensity === "low" ? 3 : glitchIntensity === "medium" ? 5 : 8

      const glitchInterval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char, i) => {
              if (Math.random() < 0.3) {
                return glitchChars[Math.floor(Math.random() * glitchChars.length)]
              }
              return char
            })
            .join(""),
        )

        iterations++
        if (iterations >= maxIterations) {
          clearInterval(glitchInterval)
          setDisplayText(text)
          setIsGlitching(false)
        }
      }, 50)
    }, intervalTime)

    return () => clearInterval(interval)
  }, [text, glitchIntensity])

  return (
    <span
      className={`${className} ${isGlitching ? "glitch-effect" : ""}`}
      style={{
        textShadow: isGlitching ? "2px 0 #ff00ff, -2px 0 #00ffff" : undefined,
      }}
    >
      {displayText}
    </span>
  )
}
