import { NextResponse } from "next/server"
import companies from "@/data/companies.json"

export async function GET() {
  return NextResponse.json(companies)
}
