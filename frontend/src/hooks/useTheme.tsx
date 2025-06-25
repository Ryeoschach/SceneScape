import React, { createContext, useContext, useEffect, useState } from 'react'
import { Theme, ThemeContextType } from '../types'
import { STORAGE_KEYS, DEFAULT_CONFIG } from '../constants'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme
    return savedTheme || DEFAULT_CONFIG.THEME
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // 移除之前的主题类
    root.classList.remove('light', 'dark')
    
    // 添加当前主题类
    root.classList.add(theme)
    
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const value: ThemeContextType = {
    theme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
