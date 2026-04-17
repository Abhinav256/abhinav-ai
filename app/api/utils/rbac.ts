/**
 * Role-Based Access Control (RBAC) Utility for AI Assistant Queries
 * Ensures strict authorization before processing sensitive queries
 */

// Financial keywords that require Financial role access
const FINANCIAL_KEYWORDS = [
  "p&l",           // Profit & Loss
  "pnl",           // Alternative P&L
  "profit",        // Profit
  "loss",          // Loss
  "revenue",       // Revenue
  "trades",        // Trading data
  "trading",       // Trading
  "trading desk",  // Trading desks
  "aum",           // Assets Under Management
  "valuation",     // Valuation
  "reconcil",      // Reconciliation
  "financial",     // Financial data
  "anomal",        // Anomalies
  "desk",          // Trading desk
  "pnl variance",  // P&L Variance
  "variance",      // Variance
  "reported",      // Reported P&L
  "expected",      // Expected P&L
  "fx rate",       // FX rates
  "market data",   // Market data
]

// Sales keywords that require Sales role access
const SALES_KEYWORDS = [
  "sales",         // Sales data
  "lead",          // Lead generation
  "crm",           // CRM data
  "client",        // Client information (general client queries)
  "prospect",      // Prospect information
  "opportunity",   // Sales opportunities
  "pipeline",      // Sales pipeline
  "customer",      // Customer management
]

/**
 * Detects query type based on content analysis
 * @param query - The user's query text
 * @returns "financial" | "sales" | "general"
 */
export function detectQueryType(query: string): "financial" | "sales" | "general" {
  const lowerQuery = query.toLowerCase()

  // Check for financial keywords
  const hasFinancialKeywords = FINANCIAL_KEYWORDS.some((keyword) =>
    lowerQuery.includes(keyword)
  )

  if (hasFinancialKeywords) {
    return "financial"
  }

  // Check for sales keywords
  const hasSalesKeywords = SALES_KEYWORDS.some((keyword) =>
    lowerQuery.includes(keyword)
  )

  if (hasSalesKeywords) {
    return "sales"
  }

  return "general"
}

/**
 * Authorizes user access based on role and query type
 * @param userRole - User's role ("financial", "sales", or "unknown")
 * @param queryType - Detected query type ("financial", "sales", or "general")
 * @returns { authorized: boolean; error?: string; message?: string; details?: string }
 */
export function authorize(
  userRole: string,
  queryType: "financial" | "sales" | "general"
): {
  authorized: boolean
  error?: string
  message?: string
  details?: string
} {
  // Normalize role
  const normalizedRole = userRole.toLowerCase()

  // General queries are always allowed
  if (queryType === "general") {
    return { authorized: true }
  }

  // Financial queries require "financial" role
  if (queryType === "financial") {
    if (normalizedRole === "financial") {
      return { authorized: true }
    } else {
      return {
        authorized: false,
        error: "Access Restricted",
        message: "You don't have permission to view financial data.",
        details:
          "This information is available only to users with Financial access. Please contact your administrator if you need access.",
      }
    }
  }

  // Sales queries require "sales" role
  if (queryType === "sales") {
    if (normalizedRole === "sales") {
      return { authorized: true }
    } else {
      return {
        authorized: false,
        error: "Access Restricted",
        message: "You don't have permission to view sales data.",
        details:
          "This information is available only to users with Sales access. Please contact your administrator if you need access.",
      }
    }
  }

  return {
    authorized: false,
    error: "Access Restricted",
    message: "Insufficient permissions to access this resource.",
    details: "Please contact your administrator if you believe you should have access.",
  }
}

/**
 * Logs unauthorized access attempts
 * @param userRole - The user's role
 * @param queryType - The detected query type
 * @param query - The actual query text
 */
export function logUnauthorizedAccess(
  userRole: string,
  queryType: string,
  query: string
): void {
  const timestamp = new Date().toISOString()
  const logMessage = `[UNAUTHORIZED ACCESS ATTEMPT] ${timestamp} | Role: ${userRole} | QueryType: ${queryType} | Query: "${query.substring(0, 100)}..."`

  console.warn(logMessage)

  // In production, you could send this to a logging service
  // e.g., Sentry, LogRocket, CloudWatch, etc.
}

/**
 * Full authorization workflow for AI queries
 * @param userRole - User's role
 * @param query - User's query
 * @returns { authorized: boolean; error?: string; message?: string; details?: string; queryType: string }
 */
export function authorizeQuery(userRole: string, query: string) {
  const queryType = detectQueryType(query)
  const authResult = authorize(userRole, queryType)

  if (!authResult.authorized) {
    logUnauthorizedAccess(userRole, queryType, query)
  }

  return {
    authorized: authResult.authorized,
    error: authResult.error,
    message: authResult.message,
    details: authResult.details,
    queryType,
  }
}
