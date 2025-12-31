"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type ThemeStyle = "RETRO" | "PROFESSIONAL"
export type ThemeMode = "DARK" | "LIGHT"

interface ThemeContextType {
  style: ThemeStyle
  mode: ThemeMode
  setStyle: (style: ThemeStyle) => void
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [style, setStyle] = useState<ThemeStyle>("RETRO")
  const [mode, setMode] = useState<ThemeMode>("DARK")

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedStyle = localStorage.getItem("vybe-theme-style") as ThemeStyle | null
    const savedMode = localStorage.getItem("vybe-theme-mode") as ThemeMode | null

    if (savedStyle && ["RETRO", "PROFESSIONAL"].includes(savedStyle)) {
      setStyle(savedStyle)
    }
    if (savedMode && ["DARK", "LIGHT"].includes(savedMode)) {
      setMode(savedMode)
    }
  }, [])

  useEffect(() => {
    // Save theme to localStorage and apply to document
    localStorage.setItem("vybe-theme-style", style)
    localStorage.setItem("vybe-theme-mode", mode)

    // Remove all theme classes
    document.documentElement.classList.remove(
      "theme-retro-dark",
      "theme-retro-light",
      "theme-professional-dark",
      "theme-professional-light",
    )

    const themeClass = `theme-${style.toLowerCase()}-${mode.toLowerCase()}`
    document.documentElement.classList.add(themeClass)
  }, [style, mode])

  return <ThemeContext.Provider value={{ style, mode, setStyle, setMode }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
