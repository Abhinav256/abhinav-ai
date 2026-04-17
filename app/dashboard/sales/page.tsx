"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, BarChart3, CreditCard, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock, XCircle, Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { AIChatWidget } from "@/components/ai-chat-widget"

interface TradingDesk {
  desk_id: string
  desk_name: string
  region: string
  type: string
  status: string
  pnl_reported: number
  pnl_expected: number
  variance: number
  last_updated: string
}

interface Anomaly {
  desk_id: string
  desk_name: string
  issue: string
  reported_pnl: number
  expected_pnl: number
  variance: number
  root_causes: string[]
  severity: string
}

interface Summary {
  totalDesks: number
  reconciled: number
  pending: number
  anomalies: number
}

export default function SalesDashboardPage() {
  const [tradingDesks, setTradingDesks] = useState<TradingDesk[]>([])
  const [summary, setSummary] = useState<Summary>({ totalDesks: 0, reconciled: 0, pending: 0, anomalies: 0 })
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [resolutionResult, setResolutionResult] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTradingDesks()
    fetchAnomalies()
  }, [])

  const fetchTradingDesks = async () => {
    try {
      const response = await fetch('/api/trading-desks')
      const data = await response.json()
      setTradingDesks(data.tradingDesks)
      setSummary(data.summary)
    } catch (error) {
      console.error('Failed to fetch trading desks:', error)
    }
  }

  const fetchAnomalies = async () => {
    try {
      const response = await fetch('/api/anomalies')
      const data = await response.json()
      setAnomalies(data.anomalies)
    } catch (error) {
      console.error('Failed to fetch anomalies:', error)
    }
  }

  const resolveAnomaly = async (deskId: string) => {
    setIsResolving(true)
    try {
      const response = await fetch('/api/resolve-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desk_id: deskId })
      })
      const result = await response.json()
      setResolutionResult(result)
      // Refresh data
      await fetchTradingDesks()
      await fetchAnomalies()

      // Show success toast
      toast({
        title: "Anomaly Resolved",
        description: `${result.desk_name || 'Desk'} P&L updated to $${result.final_pnl.toFixed(1)}M`,
        duration: 5000,
      })
    } catch (error) {
      console.error('Failed to resolve anomaly:', error)
      toast({
        title: "Resolution Failed",
        description: "Failed to resolve the anomaly. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsResolving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Reconciled':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'Anomaly':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reconciled':
        return 'bg-green-500/10 text-green-300'
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-300'
      case 'Anomaly':
        return 'bg-red-500/10 text-red-300'
      default:
        return 'bg-gray-500/10 text-gray-300'
    }
  }

  const metrics = [
    {
      label: "Total Trading Desks",
      value: summary.totalDesks.toString(),
      detail: "Across all regions",
      icon: CreditCard,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Reconciled",
      value: summary.reconciled.toString(),
      detail: "Auto-reconciled today",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Pending Review",
      value: summary.pending.toString(),
      detail: "Awaiting controller sign-off",
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Anomalies Detected",
      value: summary.anomalies.toString(),
      detail: "Requires immediate attention",
      icon: AlertTriangle,
      color: "from-red-500 to-rose-500",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.32em] text-sky-400/80">Enterprise AI Operating System</p>
              <h1 className="text-4xl font-bold tracking-tight text-white">Sales Performance Dashboard</h1>
              <p className="max-w-2xl text-sm text-slate-400">
                Goldman Sachs · Global Sales Floor · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Monitor sales performance, pipeline health, and regional conversion trends across all teams.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" className="rounded-full px-5 py-3">Export CSV</Button>
              <Button className="rounded-full px-5 py-3" onClick={() => { fetchTradingDesks(); fetchAnomalies(); }}>Refresh</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label} className="border-border/30 bg-slate-900/90 shadow-2xl">
                <CardContent className="space-y-4 p-6">
                  <div className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${metric.color} p-3 text-white shadow-lg`}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{metric.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{metric.detail}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {anomalies.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-semibold text-white">Active Anomalies</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {anomalies.map((anomaly) => (
                <Dialog key={anomaly.desk_id}>
                  <DialogTrigger asChild>
                    <Card className="border-red-500/30 bg-red-500/5 hover:bg-red-500/10 cursor-pointer transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-white">{anomaly.desk_name}</h3>
                            <p className="text-sm text-slate-400">{anomaly.issue}</p>
                            <p className="text-lg font-bold text-red-400">${anomaly.variance.toFixed(1)}M variance</p>
                          </div>
                          <Badge className="bg-red-500/10 text-red-300">{anomaly.severity}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Anomaly Analysis: {anomaly.desk_name}</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        AI-powered root cause analysis and automated resolution
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Anomaly Details */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-slate-400">Reported P&L</p>
                            <p className="text-2xl font-bold text-white">${anomaly.reported_pnl.toFixed(1)}M</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-slate-400">Expected P&L</p>
                            <p className="text-2xl font-bold text-green-400">${anomaly.expected_pnl.toFixed(1)}M</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-white">Root Causes Identified:</h4>
                          <ul className="space-y-2">
                            {anomaly.root_causes.map((cause, index) => (
                              <li key={index} className="flex items-start gap-2 text-slate-300">
                                <span className="text-red-400 mt-1">•</span>
                                {cause}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => resolveAnomaly(anomaly.desk_id)}
                            disabled={isResolving}
                            className="flex-1"
                          >
                            {isResolving ? "Resolving..." : "Auto-Resolve"}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1">
                                Ask AI Assistant
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-lg flex items-center gap-2">
                                  <Bot className="w-5 h-5 text-blue-500" />
                                  AI Sales Assistant - {anomaly.desk_name}
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                  Ask questions about this anomaly or request automated resolution
                                </DialogDescription>
                              </DialogHeader>
                              <AIChatWidget
                                deskId={anomaly.desk_id}
                                deskName={anomaly.desk_name}
                                initialContext={`I've detected an anomaly in the ${anomaly.desk_name} desk. The reported P&L is $${anomaly.reported_pnl.toFixed(1)}M but expected $${anomaly.expected_pnl.toFixed(1)}M, showing a $${anomaly.variance.toFixed(1)}M variance.

Root causes identified:
${anomaly.root_causes.map(cause => `- ${cause}`).join('\n')}

How can I help you analyze or resolve this issue?`}
                                onResolution={(data) => {
                                  // Trigger UI refresh when resolution happens via chat
                                  fetchTradingDesks()
                                  fetchAnomalies()
                                  setResolutionResult(data)
                                  toast({
                                    title: "AI Resolution Complete",
                                    description: `${anomaly.desk_name} P&L updated to $${data.final_pnl.toFixed(1)}M`,
                                    duration: 5000,
                                  })
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>

                        {resolutionResult && resolutionResult.desk_id === anomaly.desk_id && (
                          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <h4 className="font-semibold text-green-400 mb-2">Resolution Complete</h4>
                            <p className="text-sm text-slate-300 mb-2">Final P&L: ${resolutionResult.final_pnl.toFixed(1)}M</p>
                            <ul className="text-sm text-slate-400 space-y-1">
                              {resolutionResult.actions_taken.map((action: string, index: number) => (
                                <li key={index}>• {action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-white">Trading Desks Overview</h2>
              <p className="text-sm text-slate-400">Real-time P&L reconciliation status across all desks</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={`rounded-full px-3 py-1 ${getStatusColor('Reconciled')}`}>Reconciled</Badge>
              <Badge className={`rounded-full px-3 py-1 ${getStatusColor('Pending')}`}>Pending</Badge>
              <Badge className={`rounded-full px-3 py-1 ${getStatusColor('Anomaly')}`}>Anomaly</Badge>
            </div>
          </div>

          <Card className="border-border/30 bg-slate-900/90 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-950/80">
                  <TableRow>
                    <TableHead className="text-slate-400">Desk ID</TableHead>
                    <TableHead className="text-slate-400">Desk Name</TableHead>
                    <TableHead className="text-slate-400">Region</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">P&L Reported</TableHead>
                    <TableHead className="text-slate-400">Expected</TableHead>
                    <TableHead className="text-slate-400">Variance</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tradingDesks.map((desk) => (
                    <TableRow key={desk.desk_id} className="border-slate-800">
                      <TableCell className="font-mono text-slate-300">{desk.desk_id}</TableCell>
                      <TableCell className="text-slate-100 font-semibold">{desk.desk_name}</TableCell>
                      <TableCell className="text-slate-300">{desk.region}</TableCell>
                      <TableCell className="text-slate-300">{desk.type}</TableCell>
                      <TableCell className="text-slate-100">${desk.pnl_reported.toFixed(1)}M</TableCell>
                      <TableCell className="text-slate-100">${desk.pnl_expected.toFixed(1)}M</TableCell>
                      <TableCell className={`font-semibold ${desk.variance > 0 ? 'text-red-400' : desk.variance < 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        ${desk.variance.toFixed(1)}M
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(desk.status)}
                          <Badge className={`rounded-full px-2 py-1 text-xs ${getStatusColor(desk.status)}`}>
                            {desk.status}
                          </Badge>
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
