"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

const ADMIN_EMAIL = "admin@goldmansachs.com"
const ADMIN_PASSWORD = "goldmansachs_admin"

// Demo credentials for quick testing
const DEMO_CREDENTIALS = [
  { email: "pranav@goldmansachs.com", password: "pranav123", role: "Sales", name: "Pranav" },
  { email: "abhinav@goldmansachs.com", password: "abhinav123", role: "Financial", name: "Abhinav" },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Admin shortcut: redirect to admin page
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        router.push('/admin')
        return
      }

      // Check demo credentials first
      const demoUser = DEMO_CREDENTIALS.find(d => d.email === email && d.password === password)
      if (demoUser) {
        // Create server-side session for demo user
        const sessionRes = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            email: demoUser.email,
            role: demoUser.role,
            name: demoUser.name,
          }),
        })

        const sessionData = await sessionRes.json()
        if (!sessionData.success) {
          setError('Failed to create session')
          setLoading(false)
          return
        }

        // Store session ID in localStorage for client-side retrieval
        try {
          localStorage.setItem('gs_session_id', sessionData.sessionId)
          console.log(`[LOGIN] Session ID set: ${sessionData.sessionId} for role: ${demoUser.role}`)
        } catch (e) {
          console.error("[LOGIN] Failed to set localStorage:", e)
        }

        // Redirect based on role
        if (demoUser.role.toLowerCase().includes('financial')) {
          router.push('/dashboard/financial')
        } else if (demoUser.role.toLowerCase().includes('sales')) {
          router.push('/dashboard')
        } else {
          router.push('/dashboard')
        }
        return
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!data.success) {
        setError(data.message || 'Invalid credentials')
        setLoading(false)
        return
      }

      // Create server-side session
      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          email,
          role: data.user?.role,
          name: data.user?.name,
        }),
      })

      const sessionData = await sessionRes.json()
      if (!sessionData.success) {
        setError('Failed to create session')
        setLoading(false)
        return
      }

      // Store session ID in localStorage for client-side retrieval
      try {
        localStorage.setItem('gs_session_id', sessionData.sessionId)
        console.log(`[LOGIN] Session ID set: ${sessionData.sessionId} for role: ${data.user?.role}`)
      } catch (e) {
        console.error("[LOGIN] Failed to set localStorage:", e)
      }

      const role = (data.user?.role || '').toLowerCase()

      if (role.includes('financial')) {
        router.push('/dashboard/financial')
      } else if (role.includes('sales')) {
        // Sales users should land on the main dashboard (which links to client pages)
        // The project's Sales client pages live under /dashboard/client/[id]
        router.push('/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#080808] to-gray-900 text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/Goldman Sachs.jpg" 
              alt="Goldman Sachs Logo" 
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold">Goldman Sachs — Enterprise Access</h1>
          <p className="text-sm text-gray-400">Secure sign in</p>
        </div>

        <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-black/40 border border-gray-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="bg-red-900/60 text-red-300 p-2 rounded">{error}</div>}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-[#0b0b0b] border border-gray-700 p-3 outline-none focus:ring-2 focus:ring-amber-400 transition"
                type="email"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-[#0b0b0b] border border-gray-700 p-3 outline-none focus:ring-2 focus:ring-amber-400 transition"
                type="password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:scale-[1.01] transition-transform disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
