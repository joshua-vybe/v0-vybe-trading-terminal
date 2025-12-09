"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  color: string
}

export function AmbientParticles({ count = 25, opacity = 0.5 }: { count?: number; opacity?: number }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const colors = ["#00ffff", "#ff00ff", "#00ffff", "#00ffff", "#aa00ff"]
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 15 + Math.random() * 25,
        delay: Math.random() * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    setParticles(newParticles)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[2]" style={{ opacity }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `float-drift ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float-drift {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.4;
          }
          25% { 
            transform: translate(20px, -30px) scale(1.3); 
            opacity: 1;
          }
          50% { 
            transform: translate(-25px, -15px) scale(0.7); 
            opacity: 0.6;
          }
          75% { 
            transform: translate(15px, 25px) scale(1.1); 
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}
