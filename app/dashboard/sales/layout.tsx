"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setTheme } = useTheme()

  // Force dark theme only for sales page
  useEffect(() => {
    setTheme("dark")
  }, [setTheme])

  return (
    <div className="dark">
      {children}
    </div>
  )
}
