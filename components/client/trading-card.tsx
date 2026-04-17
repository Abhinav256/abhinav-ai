"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Activity } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface TradingData {
  tradeVolume: string
  marketParticipation: string
  equityTrades: string
  derivatives: string
  commodities: string
  forexTrading: string
  details: {
    tradingCharts: Array<{ month: string; volume: number; profit: number }>
    profitLoss: {
      totalProfit: string
      ytdReturn: string
      sharpeRatio: number
      maxDrawdown: string
    }
    marketSegments: Record<string, number>
    tradePerformance: Array<{ quarter: string; trades: number; successRate: number }>
  }
}

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b"]

export function TradingCard({ companyId }: { companyId: string }) {
  const [data, setData] = useState<TradingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/client/${companyId}`)
      .then((res) => res.json())
      .then((d) => {
        setTimeout(() => {
          setData(d.trading)
          setIsLoading(false)
        }, 2000)
      })
      .catch(console.error)
  }, [companyId])

  if (isLoading || !data) {
    return (
      <Card className="glass-card border-border/30 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const segmentData = Object.entries(data.details.marketSegments).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="glass-card border-border/30 glass-hover transition-all duration-300 cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <CardTitle className="text-base text-foreground">Trading</CardTitle>
                <CardDescription className="text-xs">Market Activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Trade Volume</p>
                <p className="text-foreground font-semibold">{data.tradeVolume}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Participation</p>
                <p className="text-chart-3 font-medium">{data.marketParticipation}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted/30 rounded-lg p-2">
                <p className="text-muted-foreground text-xs">Equity</p>
                <p className="text-foreground font-medium">{data.equityTrades}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2">
                <p className="text-muted-foreground text-xs">Derivatives</p>
                <p className="text-foreground font-medium">{data.derivatives}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="glass border-border/50 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-chart-3" />
            Trading Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed trading information including volume, profit/loss, and market segments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Trade Volume", value: data.tradeVolume },
              { label: "Total Profit", value: data.details.profitLoss.totalProfit },
              { label: "YTD Return", value: data.details.profitLoss.ytdReturn },
              { label: "Sharpe Ratio", value: data.details.profitLoss.sharpeRatio.toFixed(2) },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted/30 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className="text-foreground font-semibold text-lg">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Trading Volume Area Chart */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-4">Monthly Trading Volume ($M)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.details.tradingCharts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 41, 82, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Market Segments Pie */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-4">Market Segments</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {segmentData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 41, 82, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Profit Chart */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="text-foreground font-medium mb-4">Monthly Profit ($M)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.details.tradingCharts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 82, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="profit" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Performance */}
          <div>
            <h3 className="text-foreground font-medium mb-3">Quarterly Trade Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.details.tradePerformance.map((perf) => (
                <div key={perf.quarter} className="bg-muted/30 rounded-lg p-3">
                  <p className="text-chart-3 font-medium text-sm">{perf.quarter}</p>
                  <p className="text-foreground font-semibold">{perf.trades.toLocaleString()} trades</p>
                  <p className="text-muted-foreground text-xs">{perf.successRate}% success rate</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Equity Trades", value: data.equityTrades },
              { label: "Derivatives", value: data.derivatives },
              { label: "Commodities", value: data.commodities },
              { label: "Forex", value: data.forexTrading },
            ].map((item) => (
              <div key={item.label} className="bg-muted/30 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">{item.label}</p>
                <p className="text-foreground font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
