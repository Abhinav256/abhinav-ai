"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { History, Calendar, ArrowDown } from "lucide-react"

interface RelationshipHistoryData {
  timeline: Array<{ year: string; event: string; description: string }>
  relationshipManager: string
  clientSince: string
  totalRevenue: string
}

export function RelationshipHistoryCard({ companyId }: { companyId: string }) {
  const [data, setData] = useState<RelationshipHistoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/client/${companyId}`)
      .then((res) => res.json())
      .then((d) => {
        setTimeout(() => {
          setData(d.relationshipHistory)
          setIsLoading(false)
        }, 2000)
      })
      .catch(console.error)
  }, [companyId])

  if (isLoading || !data) {
    return (
      <Card className="glass-card border-border/30 animate-pulse md:col-span-2 lg:col-span-3">
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
    <Card className="glass-card border-border/30 md:col-span-2 lg:col-span-3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <History className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Relationship History</CardTitle>
              <CardDescription className="text-xs">Partnership Timeline</CardDescription>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-muted-foreground text-xs">Total Revenue Generated</p>
            <p className="text-foreground font-semibold">{data.totalRevenue}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-muted/20 rounded-lg">
          <div>
            <p className="text-muted-foreground text-xs">Client Since</p>
            <p className="text-foreground font-medium">{data.clientSince}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Relationship Manager</p>
            <p className="text-foreground font-medium">{data.relationshipManager}</p>
          </div>
          <div className="sm:hidden">
            <p className="text-muted-foreground text-xs">Total Revenue</p>
            <p className="text-foreground font-medium">{data.totalRevenue}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-muted-foreground text-xs">Years of Partnership</p>
            <p className="text-foreground font-medium">
              {new Date().getFullYear() - parseInt(data.clientSince)} years
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border/50" />
          <div className="space-y-4">
            {data.timeline.map((item, index) => (
              <div key={index} className="relative flex gap-4 pl-10">
                <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                {index < data.timeline.length - 1 && (
                  <div className="absolute left-3 top-8 flex items-center justify-center w-4 h-4">
                    <ArrowDown className="w-4 h-4 text-primary opacity-80" />
                  </div>
                )}
                <div className="flex-1 bg-muted/20 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="text-primary font-medium text-sm">{item.year}</span>
                    <span className="text-foreground font-medium">{item.event}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
