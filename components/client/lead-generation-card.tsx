"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Target, TrendingUp, Sparkles } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface LeadGenerationData {
  potentialServices: string[]
  estimatedRevenue: string
  growthProbability: number
  profitPercentage: number
  details: {
    projectedServices: Array<{ service: string; probability: number; revenue: number }>
    revenueForecast: Array<{ year: string; projected: number }>
    growthCurve: Array<{ quarter: string; growth: number }>
    aiPrediction: string
  }
}

export function LeadGenerationCard({ companyId }: { companyId: string }) {
  const [data, setData] = useState<LeadGenerationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/client/${companyId}`)
      .then((res) => res.json())
      .then((d) => {
        setTimeout(() => {
          setData(d.leadGeneration)
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="glass-card border-border/30 glass-hover transition-all duration-300 cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <CardTitle className="text-base text-foreground">Lead Generation</CardTitle>
                <CardDescription className="text-xs">Growth Opportunities</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Est. Revenue</p>
                <p className="text-foreground font-semibold">{data.estimatedRevenue}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Growth Prob.</p>
                <p className="text-chart-4 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {data.growthProbability}%
                </p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Profit Margin</p>
              <div className="w-full bg-muted/50 rounded-full h-2">
                <div 
                  className="bg-chart-4 h-2 rounded-full transition-all"
                  style={{ width: `${data.profitPercentage}%` }}
                />
              </div>
              <p className="text-foreground text-sm mt-1">{data.profitPercentage}%</p>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="glass border-border/50 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-chart-4" />
            Lead Generation Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed lead generation information including revenue forecasts and growth opportunities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Est. Revenue", value: data.estimatedRevenue },
              { label: "Growth Probability", value: `${data.growthProbability}%` },
              { label: "Profit Margin", value: `${data.profitPercentage}%` },
              { label: "Potential Services", value: data.potentialServices.length.toString() },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted/30 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className="text-foreground font-semibold text-lg">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Revenue Forecast */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-4">Revenue Forecast ($M)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.details.revenueForecast}>
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
                    <Bar dataKey="projected" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Growth Curve */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-4">Growth Curve (%)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.details.growthCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="quarter" stroke="#888" fontSize={12} />
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
                      dataKey="growth" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Projected Services */}
          <div>
            <h3 className="text-foreground font-medium mb-3">Projected Services</h3>
            <div className="space-y-3">
              {data.details.projectedServices.map((service) => (
                <div key={service.service} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">{service.service}</span>
                    <span className="text-chart-4 font-semibold">
                      ${(service.revenue / 1000000).toFixed(0)}M potential
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted/50 rounded-full h-2">
                      <div 
                        className="bg-chart-4 h-2 rounded-full transition-all"
                        style={{ width: `${service.probability}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground text-sm w-12">
                      {service.probability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Prediction */}
          <div className="bg-gradient-to-r from-chart-4/10 to-primary/10 rounded-lg p-4 border border-chart-4/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-chart-4" />
              <h3 className="text-foreground font-medium">AI-Generated Prediction</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {data.details.aiPrediction}
            </p>
          </div>

          {/* Potential Services Tags */}
          <div>
            <h3 className="text-foreground font-medium mb-3">Potential Services</h3>
            <div className="flex flex-wrap gap-2">
              {data.potentialServices.map((service) => (
                <span key={service} className="px-3 py-1.5 rounded-full bg-chart-4/10 text-chart-4 text-sm">
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
