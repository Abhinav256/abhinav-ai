"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, CheckCircle, Clock, XCircle, Lock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Anomaly {
  id: string
  title: string
  reportedPnL: number
  expectedPnL: number
  rootCause?: string
  status: "open" | "resolving" | "resolved"
}

const initialAnomalies: Anomaly[] = [
  {
    id: "1",
    title: "Equity Derivatives Variance",
    reportedPnL: 15.2,
    expectedPnL: 12.8,
    status: "open"
  },
  {
    id: "2",
    title: "FX Trading Desk Discrepancy",
    reportedPnL: 8.7,
    expectedPnL: 9.1,
    status: "open"
  }
]

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(initialAnomalies)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [resolvingStep, setResolvingStep] = useState<string>("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Check user role on mount
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const sessionId = localStorage.getItem("gs_session_id")
        if (!sessionId) {
          setUserRole("unknown")
          setIsLoading(false)
          return
        }

        const res = await fetch(`/api/sessions?sessionId=${sessionId}`)
        const data = await res.json()

        if (data.success && data.session) {
          setUserRole(data.session.role)
        } else {
          setUserRole("unknown")
        }
      } catch (error) {
        console.error("[ANOMALIES] Error fetching user role:", error)
        setUserRole("unknown")
      } finally {
        setIsLoading(false)
      }
    }

    checkUserRole()
  }, [])

  // Reset anomalies on mount (no persistence)
  useEffect(() => {
    setAnomalies(initialAnomalies)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'resolving':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <XCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500/10 text-red-300'
      case 'resolving':
        return 'bg-yellow-500/10 text-yellow-300'
      case 'resolved':
        return 'bg-green-500/10 text-green-300'
      default:
        return 'bg-gray-500/10 text-gray-300'
    }
  }

  const handleAutoResolve = async (id: string) => {
    setResolvingId(id)
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: "resolving" } : a))

    const steps = [
      "Analyzing root cause...",
      "Validating market data...",
      "Recalculating P&L...",
      "Updating records..."
    ]

    for (const step of steps) {
      setResolvingStep(step)
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    // Remove the anomaly
    setAnomalies(prev => prev.filter(a => a.id !== id))
    setResolvingId(null)
    setResolvingStep("")

    toast({
      title: "Anomaly Resolved",
      description: "The anomaly has been successfully resolved and removed.",
      duration: 3000,
    })
  }

  const handleManualResolve = async (anomaly: Anomaly) => {
    // Instantly resolve the anomaly
    setAnomalies(prev => prev.filter(a => a.id !== anomaly.id))
    
    toast({
      title: "Anomaly Resolved",
      description: `"${anomaly.title}" has been manually resolved and removed.`,
      duration: 3000,
    })
  }

  const activeAnomalies = anomalies.filter(a => a.status !== "resolved")

  // Check if user has access to anomalies
  const hasAccess = userRole?.toLowerCase() !== "sales"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Card className="border-red-600/30 bg-red-950/60 max-w-md">
            <CardContent className="p-8 text-center">
              <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-100 mb-2">Access Restricted</h2>
              <p className="text-red-100/90">🔒 You do not have permission to view financial data.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.32em] text-sky-400 dark:text-sky-400/80">Anomaly Management</p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Active Anomalies</h1>
              <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Monitor and resolve P&L anomalies across trading desks. {activeAnomalies.length} active anomal{activeAnomalies.length !== 1 ? 'ies' : 'y'} detected.
              </p>
            </div>
          </div>

          {/* Anomaly Count */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{activeAnomalies.length}</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">Active Anomal{activeAnomalies.length !== 1 ? 'ies' : 'y'}</span>
            </div>
          </div>
        </section>

        {/* Anomaly Cards */}
        {activeAnomalies.length > 0 && (
          <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeAnomalies.map((anomaly) => (
                <Card
                  key={anomaly.id}
                  className="border-red-500/30 bg-red-500/5 dark:bg-red-500/5 hover:bg-red-500/10 dark:hover:bg-red-500/10 cursor-pointer transition-colors border border-red-300 dark:border-red-500/30"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{anomaly.title}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(anomaly.status)}
                          <Badge className={`rounded-full px-2 py-1 text-xs ${getStatusColor(anomaly.status)}`}>
                            {anomaly.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Reported P&L</p>
                          <p className="font-semibold text-slate-900 dark:text-white">${anomaly.reportedPnL.toFixed(1)}M</p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Expected P&L</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">${anomaly.expectedPnL.toFixed(1)}M</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAutoResolve(anomaly.id)}
                          disabled={resolvingId === anomaly.id}
                        >
                          {resolvingId === anomaly.id ? "Resolving..." : "Auto Resolve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleManualResolve(anomaly)}
                        >
                          Resolve Manually
                        </Button>
                      </div>

                      {resolvingId === anomaly.id && (
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">
                          {resolvingStep}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Anomalies Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Anomalies Overview</h2>

          <Card className="border-border/30 bg-white dark:bg-slate-900/90 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-100 dark:bg-slate-950/80">
                  <TableRow className="border-slate-200 dark:border-slate-700">
                    <TableHead className="text-slate-700 dark:text-slate-400">ID</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-400">Title</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-400">Reported P&L</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-400">Expected P&L</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-400">Variance</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAnomalies.map((anomaly) => (
                    <TableRow key={anomaly.id} className="border-slate-200 dark:border-slate-800">
                      <TableCell className="font-mono text-slate-700 dark:text-slate-300">{anomaly.id}</TableCell>
                      <TableCell className="text-slate-900 dark:text-slate-100 font-semibold">{anomaly.title}</TableCell>
                      <TableCell className="text-slate-900 dark:text-slate-100">${anomaly.reportedPnL.toFixed(1)}M</TableCell>
                      <TableCell className="text-slate-900 dark:text-slate-100">${anomaly.expectedPnL.toFixed(1)}M</TableCell>
                      <TableCell className={`font-semibold ${anomaly.reportedPnL - anomaly.expectedPnL > 0 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        ${(anomaly.reportedPnL - anomaly.expectedPnL).toFixed(1)}M
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(anomaly.status)}
                          <Badge className={`rounded-full px-2 py-1 text-xs ${getStatusColor(anomaly.status)}`}>
                            {anomaly.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAutoResolve(anomaly.id)}
                            disabled={resolvingId === anomaly.id}
                          >
                            {resolvingId === anomaly.id ? "Resolving..." : "Auto Resolve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManualResolve(anomaly)}
                          >
                            Resolve Manually
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}