"use client"

import { useEffect, useRef } from "react"

interface VybeLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  animate?: boolean
}

export function VybeLogo({ size = "lg", animate = true }: VybeLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const sizeMap = {
    sm: { width: 120, height: 40, fontSize: 24 },
    md: { width: 200, height: 60, fontSize: 36 },
    lg: { width: 400, height: 120, fontSize: 72 },
    xl: { width: 600, height: 180, fontSize: 108 },
  }

  const { width, height, fontSize } = sizeMap[size]

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
      gradient.addColorStop(0, "#1a0a2e") // Deep purple/blue (starry night)
      gradient.addColorStop(0.15, "#2d1b4e") // Purple
      gradient.addColorStop(0.35, "#8b2fc9") // Bright purple
      gradient.addColorStop(0.5, "#ff00ff") // Magenta
      gradient.addColorStop(0.65, "#ff69b4") // Pink
      gradient.addColorStop(0.8, "#ffb6c1") // Light pink
      gradient.addColorStop(0.9, "#e0e0e0") // Silver/chrome
      gradient.addColorStop(1, "#ffffff") // White chrome edge

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
      <canvas ref={canvasRef} width={width} height={height} className="drop-shadow-[0_0_30px_rgba(255,0,255,0.5)]" />
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
export function VybeLogoSVG({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-6xl",
  }

  return (
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
      }}
    >
      VYBE
    </div>
  )
}
