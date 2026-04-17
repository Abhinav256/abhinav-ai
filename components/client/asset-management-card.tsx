"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PieChart, TrendingUp } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts"

interface AssetManagementData {
  portfolioValue: string
  assetsManaged: string
  riskLevel: string
  investmentType: string
  returns: string
  managedFunds: string[]
  yearsOfService: number
  details: {
    assetBreakdown: Record<string, number>
    investmentSectors: Record<string, number>
    portfolioGrowth: Array<{ year: string; value: number }>
    historicalPerformance: Array<{ year: string; return: number }>
  }
}

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b"]

export function AssetManagementCard({ companyId }: { companyId: string }) {
  const [data, setData] = useState<AssetManagementData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/client/${companyId}`)
      .then((res) => res.json())
      .then((d) => {
        setTimeout(() => {
          setData(d.assetManagement)
          setIsLoading(false)
        }, 2000)
      })
      .catch(console.error)
  }, [companyId])

  if (isLoading || !data) {
    return (
      <Card className="glass-card border-border/30 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32" />
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

  const assetBreakdownData = Object.entries(data.details.assetBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="glass-card border-border/30 glass-hover transition-all duration-300 cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <CardTitle className="text-base text-foreground">Asset Management</CardTitle>
                <CardDescription className="text-xs">Portfolio Overview</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Portfolio Value</p>
                <p className="text-foreground font-semibold">{data.portfolioValue}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Assets Managed</p>
                <p className="text-foreground font-semibold">{data.assetsManaged}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Risk Level</p>
                <p className={`font-medium ${
                  data.riskLevel === "Low" ? "text-chart-3" : 
                  data.riskLevel === "Moderate" ? "text-chart-4" : "text-destructive"
                }`}>
                  {data.riskLevel}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Returns YTD</p>
                <p className="text-chart-3 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {data.returns}
                </p>
              </div>
            </div>
            <div className="border-t border-border/30 pt-3">
              <p className="text-muted-foreground text-xs mb-1">Years of Service</p>
              <p className="text-foreground font-medium">{data.yearsOfService} years</p>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="glass border-border/50 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground flex items-center gap-2">
            <PieChart className="w-5 h-5 text-chart-1" />
            Asset Management Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed asset management information including portfolio breakdown and historical performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Portfolio Value", value: data.portfolioValue },
              { label: "Assets Managed", value: data.assetsManaged },
              { label: "Risk Level", value: data.riskLevel },
              { label: "Returns YTD", value: data.returns },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted/30 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className="text-foreground font-semibold text-lg">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Asset Breakdown Pie */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-4">Asset Breakdown</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={assetBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {assetBreakdownData.map((_, index) => (
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
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Portfolio Growth Line */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-4">Portfolio Growth ($M)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.details.portfolioGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="year" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 41, 82, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      dot={{ fill: '#6366f1' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Historical Performance */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="text-foreground font-medium mb-4">Historical Performance (%)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.details.historicalPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="year" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 82, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="return" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Managed Funds */}
          <div>
            <h3 className="text-foreground font-medium mb-3">Managed Funds</h3>
            <div className="flex flex-wrap gap-2">
              {data.managedFunds.map((fund) => (
                <span key={fund} className="px-3 py-1.5 rounded-full bg-chart-1/10 text-chart-1 text-sm">
                  {fund}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
