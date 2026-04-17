"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type User = { id: string; email: string; password: string; name?: string; role: string }

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "Financial", name: "" })
  const [busyAction, setBusyAction] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const roleCounts = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const u of users) totals[u.role] = (totals[u.role] || 0) + 1
    return totals
  }, [users])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function addUser(e?: React.FormEvent) {
    e?.preventDefault()
    setBusyAction(true)
    setError("")
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to add user')
      setNewUser({ email: '', password: '', role: 'Financial', name: '' })
      setUsers(prev => [data.user, ...prev])
    } catch (err: any) {
      setError(err.message || 'Add user failed')
    } finally {
      setBusyAction(false)
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete user? This cannot be undone.')) return
    setBusyAction(true)
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Delete failed')
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err: any) {
      setError(err.message || 'Delete failed')
    } finally {
      setBusyAction(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#080808] to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Control Dashboard</h1>
            <p className="text-sm text-gray-400">Executive user management</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="px-3 py-1 rounded bg-gray-800/60">Back to login</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded bg-gradient-to-br from-gray-800/60 to-black/40">
            <div className="text-xs text-gray-400">Total users</div>
            <div className="text-2xl font-bold">{users.length}</div>
          </div>
          <div className="p-3 rounded bg-gradient-to-br from-blue-900/60 to-black/40">
            <div className="text-xs text-gray-400">Financial</div>
            <div className="text-2xl font-bold">{roleCounts['Financial'] || 0}</div>
          </div>
          <div className="p-3 rounded bg-gradient-to-br from-green-900/60 to-black/40">
            <div className="text-xs text-gray-400">Sales</div>
            <div className="text-2xl font-bold">{roleCounts['Sales'] || 0}</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-black/40 border border-gray-800 shadow-2xl">
          {error && <div className="bg-red-900/60 text-red-300 p-2 rounded mb-4">{error}</div>}

          <form onSubmit={addUser} className="mb-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="Full name" value={newUser.name} onChange={(e) => setNewUser(s => ({ ...s, name: e.target.value }))} className="p-2 rounded bg-[#0b0b0b] border border-gray-700" required />
              <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser(s => ({ ...s, email: e.target.value }))} className="p-2 rounded bg-[#0b0b0b] border border-gray-700" type="email" required />
              <input placeholder="Password" value={newUser.password} onChange={(e) => setNewUser(s => ({ ...s, password: e.target.value }))} className="p-2 rounded bg-[#0b0b0b] border border-gray-700" type="password" required />
            </div>

            <div className="flex items-center gap-3">
              <select value={newUser.role} onChange={(e) => setNewUser(s => ({ ...s, role: e.target.value }))} className="p-2 rounded bg-[#0b0b0b] border border-gray-700">
                <option>Financial</option>
                <option>Sales</option>
              </select>

              <button disabled={busyAction} className="px-4 py-2 rounded bg-amber-500 text-black font-semibold">Add User</button>
            </div>
          </form>

          <div className="overflow-auto max-h-72">
            <table className="w-full table-auto text-left">
              <thead>
                <tr className="text-xs text-gray-400">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Role</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-gray-800">
                    <td className="px-2 py-3">{u.name || '—'}</td>
                    <td className="px-2 py-3 font-mono text-sm text-gray-300">{u.email}</td>
                    <td className="px-2 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'Financial' ? 'bg-blue-800 text-blue-200' : u.role === 'Sales' ? 'bg-green-800 text-green-200' : 'bg-gray-800 text-gray-200'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <button disabled={busyAction} onClick={() => deleteUser(u.id)} className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 transition">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
