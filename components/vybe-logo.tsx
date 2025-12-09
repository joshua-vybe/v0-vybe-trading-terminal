"use client"

import { useEffect, useRef, useState } from "react"

interface VybeLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  animate?: boolean
  glitch?: boolean
}

export function VybeLogo({ size = "lg", animate = true, glitch = true }: VybeLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [glitchActive, setGlitchActive] = useState(false)
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0, skew: 0 })

  const sizeMap = {
    sm: { width: 120, height: 40, fontSize: 24 },
    md: { width: 200, height: 60, fontSize: 36 },
    lg: { width: 400, height: 120, fontSize: 72 },
    xl: { width: 600, height: 180, fontSize: 108 },
  }

  const { width, height, fontSize } = sizeMap[size]

  useEffect(() => {
    if (!glitch) return

    const triggerGlitch = () => {
      // Random chance to glitch (roughly every 3-8 seconds on average)
      const nextGlitch = 3000 + Math.random() * 5000

      setTimeout(() => {
        setGlitchActive(true)
        setGlitchOffset({
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 4,
          skew: (Math.random() - 0.5) * 5,
        })

        // Glitch duration (50-200ms)
        const glitchDuration = 50 + Math.random() * 150

        // Sometimes do multiple rapid glitches
        const multiGlitch = Math.random() > 0.6
        if (multiGlitch) {
          setTimeout(() => {
            setGlitchOffset({
              x: (Math.random() - 0.5) * 15,
              y: (Math.random() - 0.5) * 6,
              skew: (Math.random() - 0.5) * 8,
            })
          }, glitchDuration / 2)
        }

        setTimeout(() => {
          setGlitchActive(false)
          setGlitchOffset({ x: 0, y: 0, skew: 0 })
          triggerGlitch() // Schedule next glitch
        }, glitchDuration)
      }, nextGlitch)
    }

    triggerGlitch()
  }, [glitch])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrame: number
    let starOffset = 0

    const stars: { x: number; y: number; size: number; brightness: number }[] = []
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.6,
        size: Math.random() * 1.5 + 0.5,
        brightness: Math.random(),
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Create gradient for text
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, "#1a0a2e")
      gradient.addColorStop(0.15, "#2d1b4e")
      gradient.addColorStop(0.35, "#8b2fc9")
      gradient.addColorStop(0.5, "#ff00ff")
      gradient.addColorStop(0.65, "#ff69b4")
      gradient.addColorStop(0.8, "#ffb6c1")
      gradient.addColorStop(0.9, "#e0e0e0")
      gradient.addColorStop(1, "#ffffff")

      // Draw main text
      ctx.font = `900 ${fontSize}px "Arial Black", "Impact", sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Chrome outline/3D effect
      ctx.strokeStyle = "#ff69b4"
      ctx.lineWidth = 3
      ctx.strokeText("VYBE", width / 2, height / 2 + 2)

      // Fill with gradient
      ctx.fillStyle = gradient
      ctx.fillText("VYBE", width / 2, height / 2)

      // Add chrome highlight on top
      const highlightGradient = ctx.createLinearGradient(0, 0, 0, height * 0.3)
      highlightGradient.addColorStop(0, "rgba(255,255,255,0.4)")
      highlightGradient.addColorStop(1, "rgba(255,255,255,0)")

      ctx.save()
      ctx.globalCompositeOperation = "source-atop"
      ctx.fillStyle = highlightGradient
      ctx.fillRect(0, 0, width, height * 0.4)
      ctx.restore()

      // Draw stars in the top portion
      if (animate) {
        starOffset += 0.02
      }

      ctx.save()
      ctx.globalCompositeOperation = "source-atop"
      stars.forEach((star) => {
        const twinkle = animate ? Math.sin(starOffset + star.brightness * 10) * 0.5 + 0.5 : star.brightness
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.restore()

      // Add glow effect
      ctx.shadowColor = "#ff00ff"
      ctx.shadowBlur = 20
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      if (animate) {
        animationFrame = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [width, height, fontSize, animate])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="drop-shadow-[0_0_30px_rgba(255,0,255,0.5)]"
        style={{
          transform: glitchActive
            ? `translate(${glitchOffset.x}px, ${glitchOffset.y}px) skewX(${glitchOffset.skew}deg)`
            : "none",
          transition: glitchActive ? "none" : "transform 0.1s ease-out",
        }}
      />

      {glitchActive && (
        <>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute top-0 left-0 opacity-70"
            style={{
              transform: `translate(${glitchOffset.x * 1.5}px, ${-glitchOffset.y}px)`,
              filter: "hue-rotate(90deg)",
              mixBlendMode: "screen",
              clipPath: `inset(${30 + Math.random() * 20}% 0 ${30 + Math.random() * 20}% 0)`,
            }}
          />
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute top-0 left-0 opacity-50"
            style={{
              transform: `translate(${-glitchOffset.x * 2}px, ${glitchOffset.y * 1.5}px)`,
              filter: "hue-rotate(-90deg)",
              mixBlendMode: "screen",
              clipPath: `inset(${20 + Math.random() * 30}% 0 ${20 + Math.random() * 30}% 0)`,
            }}
          />
        </>
      )}

      {/* Reflection effect */}
      <div
        className="absolute left-0 right-0 h-8 opacity-30 blur-sm"
        style={{
          top: height,
          background: "linear-gradient(to bottom, rgba(255,0,255,0.3), transparent)",
        }}
      />
    </div>
  )
}

// SVG-based logo for places where canvas isn't ideal
export function VybeLogoSVG({ size = "md", glitch = true }: { size?: "sm" | "md" | "lg"; glitch?: boolean }) {
  const [glitchActive, setGlitchActive] = useState(false)
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0, skew: 0 })

  const sizeMap = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-6xl",
  }

  useEffect(() => {
    if (!glitch) return

    const triggerGlitch = () => {
      const nextGlitch = 2000 + Math.random() * 6000

      setTimeout(() => {
        setGlitchActive(true)
        setGlitchOffset({
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 2,
          skew: (Math.random() - 0.5) * 4,
        })

        const glitchDuration = 50 + Math.random() * 100

        setTimeout(() => {
          setGlitchActive(false)
          setGlitchOffset({ x: 0, y: 0, skew: 0 })
          triggerGlitch()
        }, glitchDuration)
      }, nextGlitch)
    }

    triggerGlitch()
  }, [glitch])

  return (
    <div className="relative">
      <div
        className={`font-black ${sizeMap[size]} tracking-wider relative`}
        style={{
          background:
            "linear-gradient(180deg, #1a0a2e 0%, #8b2fc9 30%, #ff00ff 50%, #ff69b4 70%, #e0e0e0 90%, #ffffff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 20px rgba(255,0,255,0.5)) drop-shadow(0 2px 0 #ff69b4)",
          textShadow: "0 0 40px rgba(255,0,255,0.8)",
          transform: glitchActive
            ? `translate(${glitchOffset.x}px, ${glitchOffset.y}px) skewX(${glitchOffset.skew}deg)`
            : "none",
          transition: glitchActive ? "none" : "transform 0.1s ease-out",
        }}
      >
        VYBE
      </div>

      {glitchActive && (
        <>
          <div
            className={`font-black ${sizeMap[size]} tracking-wider absolute top-0 left-0 opacity-70`}
            style={{
              background: "linear-gradient(180deg, #00ffff 0%, #00ffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              transform: `translate(${glitchOffset.x + 2}px, ${glitchOffset.y - 1}px)`,
              clipPath: `inset(${30 + Math.random() * 40}% 0 ${10 + Math.random() * 20}% 0)`,
            }}
          >
            VYBE
          </div>
          <div
            className={`font-black ${sizeMap[size]} tracking-wider absolute top-0 left-0 opacity-70`}
            style={{
              background: "linear-gradient(180deg, #ff0000 0%, #ff0000 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              transform: `translate(${glitchOffset.x - 2}px, ${glitchOffset.y + 1}px)`,
              clipPath: `inset(${10 + Math.random() * 20}% 0 ${30 + Math.random() * 40}% 0)`,
            }}
          >
            VYBE
          </div>
        </>
      )}
    </div>
  )
}
