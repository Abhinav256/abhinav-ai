/**
 * Role-Based Access Control Implementation
 * 
 * Rules:
 * 1. SALES users can only query: companies, CRM, leads, relationships, asset management
 * 2. SALES users CANNOT query: trading desks, P&L, anomalies, trading data, market data
 * 3. TRADER/ADMIN users can query everything
 */

// Keywords that are ONLY for FINANCIAL DASHBOARD users
const FINANCIAL_ONLY_KEYWORDS = [
  // Anomaly keywords
  "anomaly", "anomalies", "anamoly", "anamolies",
  "how many anomalies",
  // P&L keywords
  "pnl", "p&l", "profit and loss", "profit loss",
  // Trading desk keywords
  "trading desk", "trading desks", "desk",
  // Reconciliation keywords
  "reconciliation", "reconciled", "reconciling",
  // Variance keywords
  "variance", "variances",
  // Trading keywords
  "trading", "trades", "trading data",
  // Market keywords
  "market data", "fx rate", "fx rates",
  // Risk keywords
  "risk analysis", "risk exposure",
  // Resolution keywords
  "how many solved", "solved today",
  "resolved anomaly", "resolve anomaly",
  "root cause", "root causes",
  "resolution steps"
];

export function isFinancialOnlyQuery(query: string): boolean {
  const lowerQuery = (query || "").toLowerCase();
  return FINANCIAL_ONLY_KEYWORDS.some((k) => lowerQuery.includes(k));
}

const normalizeRole = (role?: string) => (role || "").toLowerCase()

export function authorize(user: { role: string }, query: string) {
  const role = normalizeRole(user.role)
  const lowerQuery = (query || "").toLowerCase();

  console.log(`[RBAC] Checking authorization - Role: "${role}", Query: "${query.substring(0, 50)}..."`)

  // ===== SALES USERS: Can only access SALES data =====
  if (role === "sales") {
    const isFinancialQuery = isFinancialOnlyQuery(lowerQuery)
    console.log(`[RBAC] Sales user detected. Is financial query: ${isFinancialQuery}`)
    
    if (isFinancialQuery) {
      console.log(`[RBAC] ❌ DENYING access - Sales user trying to access financial data`)
      return {
        allowed: false,
        message: "🔒 Access Restricted: This data is only available in the Financial Dashboard. You do not have permission to access financial data."
      };
    }
  }

  // ===== ALL OTHER ROLES: Full access =====
  console.log(`[RBAC] ✅ ALLOWING access - Role: "${role}"`)
  return { allowed: true };
}