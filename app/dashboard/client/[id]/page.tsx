"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Users,
  PieChart,
  BarChart3,
  Activity,
  Target,
  Shield,
  History,
  ArrowLeft,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { CrmCard } from "@/components/client/crm-card"
import { AssetManagementCard } from "@/components/client/asset-management-card"
import { InvestmentBankingCard } from "@/components/client/investment-banking-card"
import { TradingCard } from "@/components/client/trading-card"
import { LeadGenerationCard } from "@/components/client/lead-generation-card"
import { RiskAnalysisCard } from "@/components/client/risk-analysis-card"
import { RelationshipHistoryCard } from "@/components/client/relationship-history-card"

interface CompanyData {
  id: string
  name: string
  status: string
  departments: string[]
}

export default function ClientPage() {
  const params = useParams()
  const companyId = params.id as string
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNewClient, setIsNewClient] = useState(false)

  useEffect(() => {
    fetch(`/api/client/${companyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.company) {
          setCompany(data.company)
          setIsNewClient(false)
        } else {
          setIsNewClient(true)
          setCompany({
            id: companyId,
            name: companyId
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
            status: "new",
            departments: [],
          })
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setIsNewClient(true)
      })
  }, [companyId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isNewClient) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <Card className="glass-card border-border/30 max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl text-foreground">{company?.name}</CardTitle>
              <CardDescription className="text-accent">New Client</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Goldman Sachs currently does not provide any services to this company.
              </p>
              <p className="text-sm text-muted-foreground">
                Contact our business development team to explore potential partnership opportunities.
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Initiate Engagement
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const cardConfig = [
    { 
      id: "crm", 
      title: "CRM", 
      icon: Users, 
      description: "Contact Information",
      component: CrmCard,
      always: true
    },
    { 
      id: "asset_management", 
      title: "Asset Management", 
      icon: PieChart, 
      description: "Portfolio Overview",
      component: AssetManagementCard,
      always: false
    },
    { 
      id: "investment_banking", 
      title: "Investment Banking", 
      icon: BarChart3, 
      description: "Deal Activity",
      component: InvestmentBankingCard,
      always: false
    },
    { 
      id: "trading", 
      title: "Trading", 
      icon: Activity, 
      description: "Market Activity",
      component: TradingCard,
      always: false
    },
    { 
      id: "lead_generation", 
      title: "Lead Generation", 
      icon: Target, 
      description: "Growth Opportunities",
      component: LeadGenerationCard,
      always: true
    },
    { 
      id: "risk_analysis", 
      title: "Risk Analysis", 
      icon: Shield, 
      description: "Risk Assessment",
      component: RiskAnalysisCard,
      always: true
    },
    { 
      id: "relationship_history", 
      title: "Relationship History", 
      icon: History, 
      description: "Partnership Timeline",
      component: RelationshipHistoryCard,
      always: true
    },
  ]

  const activeCards = cardConfig.filter(
    (card) => card.always || company?.departments.includes(card.id)
  )

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-2 -ml-3 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{company?.name}</h1>
                <p className="text-sm text-accent">Existing Client</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {company?.departments.map((dept) => (
              <span
                key={dept}
                className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {dept.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCards.map((card) => (
            <card.component key={card.id} companyId={companyId} />
          ))}
        </div>
      </div>
    </div>
  )
}
