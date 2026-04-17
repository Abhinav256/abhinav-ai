"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  TrendingUp, 
  PieChart, 
  Activity,
  Users,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  AlertTriangle,
  Lock,
  X
} from "lucide-react"

// Restricted modules for Sales users
const RESTRICTED_FOR_SALES = ["Trading", "Risk Management"]

interface Company {
  id: string
  name: string
  status: string
  departments: string[]
}

interface LeadCompany {
  name: string
  industry: string
  service: string
  risk: "Low" | "Medium" | "High"
  href: string
}

interface AccessError {
  title: string
  message: string
  moduleName?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [anomalyCount, setAnomalyCount] = useState(0)
  const [accessError, setAccessError] = useState<AccessError | null>(null)

  const leadCompanies: LeadCompany[] = [
    {
      name: "Apex Technologies",
      industry: "Automotive",
      service: "M&A Advisory",
      risk: "Low",
      href: "/dashboard/client/apex-technologies",
    },
    {
      name: "Airbnb",
      industry: "Hospitality",
      service: "Debt Financing",
      risk: "High",
      href: "/dashboard/client/airbnb",
    },
  ]

  /**
   * Check if a module is restricted for the current user's role
   */
  const isModuleRestricted = (moduleName: string): boolean => {
    return userRole === "Sales" && RESTRICTED_FOR_SALES.includes(moduleName)
  }

  /**
   * Handle restricted module access attempt
   */
  const handleRestrictedAccess = (moduleName: string) => {
    console.warn(`[ACCESS DENIED] Sales user attempted to access restricted module: ${moduleName}`)
    setAccessError({
      title: "Access Restricted",
      message: "🔒 You do not have permission to access this section.",
      moduleName,
    })
  }

  /**
   * Handle safe department navigation
   */
  const handleDepartmentClick = (dept: typeof departments[0]) => {
    if (isModuleRestricted(dept.name)) {
      handleRestrictedAccess(dept.name)
      return
    }
    // Safe to navigate
    router.push(dept.href)
  }

  const handleCheckClient = (company: LeadCompany) => {
    setIsLoading(true)
    setLoadingMessage("Fetching client details...")

    // Simulate intelligent system processing time
    setTimeout(() => {
      setLoadingMessage("Analyzing relationship data...")
      setTimeout(() => {
        setLoadingMessage("Loading client dashboard...")
        setTimeout(() => {
          setIsLoading(false)
          setLoadingMessage("")
          router.push(company.href)
        }, 2000)
      }, 2000)
    }, 1500)
  }

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const sessionId = localStorage.getItem("gs_session_id")
        if (!sessionId) {
          console.log("[SALES DASHBOARD] No session ID found")
          return
        }

        const res = await fetch(`/api/sessions?sessionId=${sessionId}`)
        const data = await res.json()
        
        if (data.success && data.session) {
          setUserName(data.session.name || data.session.email.split("@")[0])
          setUserRole(data.session.role)
          console.log("[SALES DASHBOARD] User session loaded:", data.session.name, "Role:", data.session.role)
        }
      } catch (error) {
        console.error("[SALES DASHBOARD] Failed to fetch session:", error)
      }
    }

    fetchUserSession()

    // Fetch companies
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data.companies))
      .catch(console.error)

    // Fetch anomalies
    fetch("/api/anomalies")
      .then((res) => res.json())
      .then((data) => setAnomalyCount(data.anomalies.length))
      .catch(console.error)
  }, [])

  const stats = [
    { label: "Total Clients", value: "3", icon: Building2, color: "text-primary" },
    { label: "AUM", value: "$7.5B", icon: DollarSign, color: "text-accent" },
    { label: "Active Trades", value: "$11B", icon: Activity, color: "text-chart-3" },
    { label: "Growth", value: "+12.4%", icon: TrendingUp, color: "text-chart-4" },
  ]

  const departments = [
    { name: "Asset Management", icon: PieChart, clients: 3, aum: "$7.5B", href: "/dashboard/client" },
    { name: "Investment Banking", icon: BarChart3, clients: 2, deals: "30", href: "/dashboard/client" },
    { name: "Trading", icon: Activity, clients: 2, volume: "$11B", href: "/dashboard/financial" },
    { name: "Risk Management", icon: AlertTriangle, clients: 2, issues: `${anomalyCount} Anomal${anomalyCount === 1 ? 'y' : 'ies'}`, href: "/dashboard/anomalies" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Welcome Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-1 h-12 bg-gradient-to-b from-primary to-accent rounded-full"></div>
            <div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight">
                Welcome to Goldman Sachs 360° Customer Intelligence Platform
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {userName}. Here&apos;s your comprehensive client overview.
              </p>
            </div>
          </div>
        </div>

        {/* Lead Company Cards Row */}
        <div>
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full"></div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Lead Company Cards</h2>
                <p className="text-muted-foreground">Track priority leads and quickly verify client relationships.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {leadCompanies.map((company) => (
              <Card key={company.name} className="glass-card border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-xl group h-full">
                <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Company</p>
                    <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mt-2">{company.name}</p>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/20 rounded-xl">
                      <span className="text-muted-foreground font-medium">Industry</span>
                      <span className="text-foreground font-semibold">{company.industry}</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/20 rounded-xl">
                      <span className="text-muted-foreground font-medium">Requested Service</span>
                      <span className="text-foreground font-semibold">{company.service}</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/20 rounded-xl">
                      <span className="text-muted-foreground font-medium">Risk Profile</span>
                      <span
                        className={
                          company.risk === "Low"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm px-2 py-1 rounded-full"
                            : company.risk === "Medium"
                            ? "bg-amber-100 text-amber-700 border-amber-200 shadow-sm px-2 py-1 rounded-full"
                            : "bg-red-100 text-red-700 border-red-200 shadow-sm px-2 py-1 rounded-full"
                        }
                      >
                        {company.risk}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full py-2.5 rounded-xl font-semibold shadow-sm border border-border/40 hover:shadow-md transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50"
                    onClick={() => handleCheckClient(company)}
                  >
                    Check Client
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="glass-card border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <stat.icon className={`w-7 h-7 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Access Error Alert */}
        {accessError && (
          <div className="mb-8">
            <Card className="border-red-600/30 bg-gradient-to-r from-red-950/60 to-red-950/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Lock className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-red-100 mb-1">{accessError.title}</h3>
                      <p className="text-red-100/90 text-sm mb-2">{accessError.message}</p>
                      {accessError.moduleName && (
                        <p className="text-red-100/70 text-xs">
                          Module: <span className="font-mono font-medium">{accessError.moduleName}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setAccessError(null)}
                    className="flex-shrink-0 text-red-100/60 hover:text-red-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Departments Section */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
            <h2 className="text-2xl font-bold text-foreground">Departments Overview</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {departments.map((dept) => {
              const isRestricted = isModuleRestricted(dept.name)
              return (
                <Card 
                  key={dept.name} 
                  className={`glass-card border-border/40 ${
                    isRestricted 
                      ? "opacity-60 cursor-not-allowed border-red-600/20" 
                      : "hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  } transition-all duration-300 group`}
                  onClick={() => handleDepartmentClick(dept)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        {isRestricted ? (
                          <Lock className="w-7 h-7 text-red-400" />
                        ) : (
                          <dept.icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                        )}
                      </div>
                      <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">{dept.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">{dept.clients} Active Clients</span>
                      <span className="text-accent font-bold text-lg">
                        {dept.aum || dept.deals + " Deals" || dept.volume || dept.issues}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Client Cards */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full"></div>
            <h2 className="text-2xl font-bold text-foreground">Client Portfolio</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Link key={company.id} href={`/dashboard/client/${company.id}`}>
                <Card className="glass-card border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer group h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <Building2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                            {company.name}
                          </CardTitle>
                          <CardDescription className="text-accent font-medium">
                            Existing Client
                          </CardDescription>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:scale-110" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {company.departments.map((dept) => (
                        <span
                          key={dept}
                          className="text-xs px-3 py-1.5 rounded-full bg-muted/60 text-muted-foreground font-medium border border-border/30"
                        >
                          {dept.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-xl z-50 flex items-center justify-center">
          <Card className="glass-card border-border/60 p-8 max-w-md mx-4 shadow-2xl">
            <CardContent className="text-center space-y-6">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-lg"></div>
              <div className="space-y-3">
                <p className="text-xl font-bold text-foreground">Processing Request</p>
                <p className="text-muted-foreground font-medium">{loadingMessage}</p>
              </div>
              <div className="w-full bg-muted/60 rounded-full h-3 shadow-inner">
                <div className="bg-gradient-to-r from-primary to-accent h-3 rounded-full animate-pulse shadow-sm"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
