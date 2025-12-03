"use client"

import { useState } from "react"
import { CRTScreen } from "@/components/crt-screen"
import { CLILanding } from "@/components/cli-landing"
import { TradingTerminal } from "@/components/trading-terminal"
import { JackInAnimation } from "@/components/jack-in-animation"

export default function VybeTerminal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showJackIn, setShowJackIn] = useState(false)

  const handleLogin = () => {
    setShowJackIn(true)
  }

  const handleJackInComplete = () => {
    setShowJackIn(false)
    setIsAuthenticated(true)
  }

  if (showJackIn) {
    return <JackInAnimation onComplete={handleJackInComplete} />
  }

  if (!isAuthenticated) {
    return (
      <CRTScreen>
        <CLILanding onLogin={handleLogin} />
      </CRTScreen>
    )
  }

  return (
    <CRTScreen>
      <TradingTerminal />
    </CRTScreen>
  )
}
