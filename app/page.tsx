"use client"

import { useState } from "react"
import { CRTScreen } from "@/components/crt-screen"
import { CLILanding } from "@/components/cli-landing"
import { TradingTerminal } from "@/components/trading-terminal"

export default function VybeTerminal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return (
      <CRTScreen>
        <CLILanding onLogin={() => setIsAuthenticated(true)} />
      </CRTScreen>
    )
  }

  return (
    <CRTScreen>
      <TradingTerminal />
    </CRTScreen>
  )
}
