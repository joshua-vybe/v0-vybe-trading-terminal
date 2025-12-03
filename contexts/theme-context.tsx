"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type ThemeName = "DARK_CRT" | "MATRIX" | "AMBER" | "LIGHT_CRT"

interface ThemeContextType {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>("DARK_CRT")

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("vybe-theme") as ThemeName | null
    if (savedTheme && ["DARK_CRT", "MATRIX", "AMBER", "LIGHT_CRT"].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Save theme to localStorage and apply to document
    localStorage.setItem("vybe-theme", theme)

    // Remove all theme classes
    document.documentElement.classList.remove("theme-dark-crt", "theme-matrix", "theme-amber", "theme-light-crt")

    // Add current theme class
    const themeClass = `theme-${theme.toLowerCase().replace("_", "-")}`
    document.documentElement.classList.add(themeClass)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
