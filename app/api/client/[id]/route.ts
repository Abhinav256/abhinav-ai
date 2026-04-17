import { NextResponse } from "next/server"
import companies from "@/data/companies.json"
import crm from "@/data/crm.json"
import assetManagement from "@/data/asset_management.json"
import investmentBanking from "@/data/investment_banking.json"
import trading from "@/data/trading.json"
import leadGeneration from "@/data/lead_generation.json"
import riskAnalysis from "@/data/risk_analysis.json"
import relationshipHistory from "@/data/relationship_history.json"

type CompanyId = "apex-technologies" | "zenith-energy" | "bluestone-industries"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const company = companies.companies.find((c) => c.id === id)

  if (!company) {
    return NextResponse.json({ company: null })
  }

  const companyId = id as CompanyId

  const asRecord = <T extends Record<string, any>>(obj: T) => obj as Record<string, any>

  return NextResponse.json({
    company,
    crm: asRecord(crm)[companyId] || null,
    assetManagement: asRecord(assetManagement)[companyId] || null,
    investmentBanking: asRecord(investmentBanking)[companyId] || null,
    trading: asRecord(trading)[companyId] || null,
    leadGeneration: asRecord(leadGeneration)[companyId] || null,
    riskAnalysis: asRecord(riskAnalysis)[companyId] || null,
    relationshipHistory: asRecord(relationshipHistory)[companyId] || null,
  })
}
