"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

interface InvestmentBankingData {
  dealsCompleted: number
  ipoHandled: number
  mergers: number
  acquisitions: number
  capitalRaised: string
  advisoryServices: string[]
  details: {
    dealTimeline: Array<{ year: string; deal: string; value: number; type: string }>
    investmentPerformance: Array<{ quarter: string; dealValue: number; fees: number }>
    capitalHistory: Array<{ year: string; raised: number }>
    revenueGeneration: {
      totalFees: string
      advisoryFees: string
      underwritingFees: string
      placementFees: string
    }
  }
}

export function InvestmentBankingCard({ companyId }: { companyId: string }) {
  const [data, setData] = useState<InvestmentBankingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/client/${companyId}`)
      .then((res) => res.json())
      .then((d) => {
        setTimeout(() => {
          setData(d.investmentBanking)
          setIsLoading(false)
        }, 2000)
      })
      .catch(console.error)
  }, [companyId])

  if (isLoading || !data) {
    return (
      <Card className="glass-card border-border/30 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-36" />
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
              <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <CardTitle className="text-base text-foreground">Investment Banking</CardTitle>
                <CardDescription className="text-xs">Deal Activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Deals Completed</p>
                <p className="text-foreground font-semibold text-xl">{data.dealsCompleted}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Capital Raised</p>
                <p className="text-foreground font-semibold">{data.capitalRaised}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/30 rounded-lg p-2">
                <p className="text-foreground font-semibold">{data.ipoHandled}</p>
                <p className="text-muted-foreground text-xs">IPOs</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2">
                <p className="text-foreground font-semibold">{data.mergers}</p>
                <p className="text-muted-foreground text-xs">Mergers</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2">
                <p className="text-foreground font-semibold">{data.acquisitions}</p>
                <p className="text-muted-foreground text-xs">Acquisitions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="glass border-border/50 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-chart-2" />
            Investment Banking Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed investment banking information including deals, capital history, and revenue generation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Deals Completed", value: data.dealsCompleted.toString() },
              { label: "Capital Raised", value: data.capitalRaised },
              { label: "IPOs Handled", value: data.ipoHandled.toString() },
              { label: "M&A Deals", value: (data.mergers + data.acquisitions).toString() },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted/30 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className="text-foreground font-semibold text-lg">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Capital History */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-4">Capital History ($M)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.details.capitalHistory}>
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
                    <Bar dataKey="raised" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quarterly Performance */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-4">Quarterly Performance</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.details.investmentPerformance}>
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
                      dataKey="dealValue" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      name="Deal Value ($M)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="fees" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Fees ($M)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Deal Timeline */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="text-foreground font-medium mb-4">Deal Timeline</h3>
            <div className="space-y-3">
              {data.details.dealTimeline.map((deal, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <span className="text-chart-2 font-medium w-12">{deal.year}</span>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{deal.deal}</p>
                    <p className="text-muted-foreground text-sm">{deal.type}</p>
                  </div>
                  <span className="text-foreground font-semibold">${deal.value}M</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Generation */}
          <div>
            <h3 className="text-foreground font-medium mb-3">Revenue Generation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(data.details.revenueGeneration).map(([key, value]) => (
                <div key={key} className="bg-muted/30 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className="text-foreground font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Advisory Services */}
          <div>
            <h3 className="text-foreground font-medium mb-3">Advisory Services</h3>
            <div className="flex flex-wrap gap-2">
              {data.advisoryServices.map((service) => (
                <span key={service} className="px-3 py-1.5 rounded-full bg-chart-2/10 text-chart-2 text-sm">
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
