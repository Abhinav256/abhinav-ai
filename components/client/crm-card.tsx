"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Mail, Phone, MapPin } from "lucide-react"

interface CrmData {
  ceo: string
  cfo: string
  cto: string
  keyStakeholders: string[]
  primaryContact: string
  email: string
  phone: string
  headquarters: string
}

export function CrmCard({ companyId }: { companyId: string }) {
  const [data, setData] = useState<CrmData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/client/${companyId}`)
      .then((res) => res.json())
      .then((d) => {
        setTimeout(() => {
          setData(d.crm)
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

  return (
    <Card className="glass-card border-border/30 glass-hover transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base text-foreground">CRM</CardTitle>
            <CardDescription className="text-xs">Contact Information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">CEO</p>
            <p className="text-foreground font-medium">{data.ceo}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">CFO</p>
            <p className="text-foreground font-medium">{data.cfo}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">CTO</p>
            <p className="text-foreground font-medium">{data.cto}</p>
          </div>
        </div>

        <div className="border-t border-border/30 pt-3">
          <p className="text-muted-foreground text-xs mb-1">Key Stakeholders</p>
          <div className="space-y-1">
            {data.keyStakeholders.slice(0, 2).map((stakeholder, i) => (
              <p key={i} className="text-foreground text-sm">{stakeholder}</p>
            ))}
          </div>
        </div>

        <div className="border-t border-border/30 pt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-foreground">{data.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-foreground">{data.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-foreground">{data.headquarters}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
