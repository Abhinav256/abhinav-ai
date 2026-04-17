"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Shield, Sparkles, CheckCircle } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts"

interface RiskAnalysisData {
  riskScore: string
  riskScoreNum: number
  creditRisk: string
  creditRiskNum: number
  marketRisk: string
  marketRiskNum: number
  operationalRisk: string
  operationalRiskNum: number
  complianceScore: number
  details: {
    riskProfile: {
      overall: string
      volatility: string
      liquidityRisk: string
      concentrationRisk: string
      regulatoryRisk: string
    }
    riskTrendGraph: Array<{ month: string; risk: number }>
    mitigationStrategies: string[]
    aiAnalysis: string
  }
}

export function RiskAnalysisCard({ companyId }: { companyId: string }) {
  const [data, setData] = useState<RiskAnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/client/${companyId}`)
      .then((res) => res.json())
      .then((d) => {
        setTimeout(() => {
          setData(d.riskAnalysis)
          setIsLoading(false)
        }, 2000)
      })
      .catch(console.error)
  }, [companyId])

  if (isLoading || !data) {
    return (
      <Card className="glass-card border-border/30 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-28" />
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

  const getRiskColor = (score: number) => {
    if (score <= 35) return "text-chart-3"
    if (score <= 55) return "text-chart-4"
    return "text-destructive"
  }

  const radarData = [
    { subject: "Credit", value: data.creditRiskNum },
    { subject: "Market", value: data.marketRiskNum },
    { subject: "Operational", value: data.operationalRiskNum },
    { subject: "Overall", value: data.riskScoreNum },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="glass-card border-border/30 glass-hover transition-all duration-300 cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-chart-5" />
              </div>
              <div>
                <CardTitle className="text-base text-foreground">Risk Analysis</CardTitle>
                <CardDescription className="text-xs">Risk Assessment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Risk Score</p>
                <p className={`font-semibold text-lg ${getRiskColor(data.riskScoreNum)}`}>
                  {data.riskScore}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs">Compliance</p>
                <p className="text-chart-3 font-semibold text-lg">{data.complianceScore}%</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-muted/30 rounded-lg p-2">
                <p className={`font-medium ${getRiskColor(data.creditRiskNum)}`}>{data.creditRisk}</p>
                <p className="text-muted-foreground text-xs">Credit</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2">
                <p className={`font-medium ${getRiskColor(data.marketRiskNum)}`}>{data.marketRisk}</p>
                <p className="text-muted-foreground text-xs">Market</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2">
                <p className={`font-medium ${getRiskColor(data.operationalRiskNum)}`}>{data.operationalRisk}</p>
                <p className="text-muted-foreground text-xs">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="glass border-border/50 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-chart-5" />
            Risk Analysis Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed risk analysis information including risk scores, compliance, and mitigation strategies
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Risk Score", value: data.riskScore, num: data.riskScoreNum },
              { label: "Credit Risk", value: data.creditRisk, num: data.creditRiskNum },
              { label: "Market Risk", value: data.marketRisk, num: data.marketRiskNum },
              { label: "Compliance", value: `${data.complianceScore}%`, num: 100 - data.complianceScore },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted/30 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className={`font-semibold text-lg ${getRiskColor(stat.num)}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Risk Radar */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-4">Risk Profile</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" stroke="#888" fontSize={12} />
                    <Radar
                      name="Risk"
                      dataKey="value"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 41, 82, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Trend */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-4">Risk Trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.details.riskTrendGraph}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 41, 82, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="risk" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={{ fill: '#a855f7' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Risk Profile Details */}
          <div>
            <h3 className="text-foreground font-medium mb-3">Risk Profile Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(data.details.riskProfile).map(([key, value]) => (
                <div key={key} className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-xs capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className={`font-medium ${
                    value === "Low" || value === "Very Low" || value === "Conservative" ? "text-chart-3" :
                    value === "Medium" || value === "Moderate" ? "text-chart-4" : "text-destructive"
                  }`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mitigation Strategies */}
          <div>
            <h3 className="text-foreground font-medium mb-3">Mitigation Strategies</h3>
            <div className="space-y-2">
              {data.details.mitigationStrategies.map((strategy, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-chart-3 mt-0.5 shrink-0" />
                  <span className="text-foreground text-sm">{strategy}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-gradient-to-r from-chart-5/10 to-primary/10 rounded-lg p-4 border border-chart-5/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-chart-5" />
              <h3 className="text-foreground font-medium">AI-Generated Analysis</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {data.details.aiAnalysis}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
