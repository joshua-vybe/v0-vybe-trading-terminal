"use client"

export function CircuitLines() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00ffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff00ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal lines */}
        {[10, 25, 40, 60, 75, 90].map((y, i) => (
          <g key={`h-${i}`}>
            <line
              x1="0%"
              y1={`${y}%`}
              x2="100%"
              y2={`${y}%`}
              stroke="url(#circuit-gradient)"
              strokeWidth="0.5"
              strokeDasharray="5,10,2,10"
              className="circuit-flow"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
            {/* Connection nodes */}
            {[20, 45, 70, 85].map((x, j) => (
              <circle
                key={`node-${i}-${j}`}
                cx={`${x}%`}
                cy={`${y}%`}
                r="2"
                fill="#00ffff"
                className="animate-pulse"
                style={{ animationDelay: `${(i + j) * 0.2}s` }}
              />
            ))}
          </g>
        ))}

        {/* Vertical lines */}
        {[15, 35, 55, 80].map((x, i) => (
          <line
            key={`v-${i}`}
            x1={`${x}%`}
            y1="0%"
            x2={`${x}%`}
            y2="100%"
            stroke="rgba(0, 255, 255, 0.2)"
            strokeWidth="0.5"
            strokeDasharray="2,15"
          />
        ))}
      </svg>
    </div>
  )
}
