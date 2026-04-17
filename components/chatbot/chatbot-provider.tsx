"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface AnomalyData {
  desk_id: string
  desk_name: string
  reported_pnl: number
  expected_pnl: number
  variance: number
  issue: string
  root_causes: string[]
  severity: string
}

interface ChatbotContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  pendingAnomaly: AnomalyData | null
  setPendingAnomaly: (anomaly: AnomalyData | null) => void
  sendAnomalyToChat: (anomaly: AnomalyData) => void
  onAnomalyResolved?: () => Promise<void>
  setOnAnomalyResolved: (callback: () => Promise<void>) => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingAnomaly, setPendingAnomaly] = useState<AnomalyData | null>(null)
  const [onAnomalyResolved, setOnAnomalyResolved] = useState<(() => Promise<void>) | undefined>(undefined)

  const sendAnomalyToChat = (anomaly: AnomalyData) => {
    setPendingAnomaly(anomaly)
    setIsOpen(true)
  }

  return (
    <ChatbotContext.Provider value={{ isOpen, setIsOpen, pendingAnomaly, setPendingAnomaly, sendAnomalyToChat, onAnomalyResolved, setOnAnomalyResolved }}>
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider")
  }
  return context
}
