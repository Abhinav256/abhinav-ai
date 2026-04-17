"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Shield, Search, LogOut, User, Settings } from "lucide-react"

interface SearchResult {
  id: string
  name: string
  status: "existing" | "new"
}

export function Navbar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState("")

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const sessionId = localStorage.getItem("gs_session_id")
        if (!sessionId) {
          console.log("[NAVBAR] No session ID found")
          return
        }

        const res = await fetch(`/api/sessions?sessionId=${sessionId}`)
        const data = await res.json()
        
        if (data.success && data.session) {
          setUserEmail(data.session.email)
          setUserRole(data.session.role)
          console.log("[NAVBAR] User session loaded:", data.session.email)
        }
      } catch (error) {
        console.error("[NAVBAR] Failed to fetch session:", error)
      }
    }

    fetchUserSession()
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSearchResults(data.results)
      setShowResults(true)
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  const handleResultClick = (companyId: string) => {
    setShowResults(false)
    setSearchQuery("")
    router.push(`/dashboard/client/${companyId}`)
  }

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("gs_session_id")
      if (sessionId) {
        await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', sessionId }),
        })
      }
    } catch (error) {
      console.error("[NAVBAR] Failed to delete session:", error)
    }
    
    localStorage.removeItem("gs_session_id")
    router.push("/")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 glass border-b border-border/60 shadow-xl backdrop-blur-xl">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-white to-gray-50 shadow-lg">
            <img
              src="/Goldman Sachs.jpg"
              alt="Goldman Sachs"
              className="w-full h-full object-contain p-1"
            />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-foreground tracking-tight">Goldman Sachs</h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium">
              360° Customer Intelligence
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search companies, clients, or insights..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="pl-12 pr-4 py-3 bg-background/60 border-border/60 text-foreground placeholder:text-muted-foreground rounded-xl shadow-sm focus:shadow-md transition-all duration-200"
          />
          
          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-3 glass-card rounded-xl border border-border/60 overflow-hidden shadow-xl backdrop-blur-xl">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.id)}
                    className="w-full px-5 py-4 text-left hover:bg-primary/10 transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="text-foreground font-medium group-hover:text-primary transition-colors">{result.name}</span>
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        result.status === "existing"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {result.status === "existing" ? "Existing Client" : "New Client"}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-5 py-4 text-muted-foreground text-sm">
                  No companies found for &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-xl hover:bg-primary/10 transition-all duration-200">
                <Avatar className="h-11 w-11 border-2 border-primary/30 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                    {userEmail.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 glass-card border-border/60 shadow-xl backdrop-blur-xl rounded-xl" align="end">
              <div className="flex items-center justify-start gap-3 p-4 border-b border-border/30">
                <Avatar className="h-12 w-12 border-2 border-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-lg">
                    {userEmail.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-foreground">User Account</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem className="cursor-pointer text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg mx-1 my-1 transition-all duration-200">
                <User className="mr-3 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg mx-1 my-1 transition-all duration-200">
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg mx-1 my-1 transition-all duration-200"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
