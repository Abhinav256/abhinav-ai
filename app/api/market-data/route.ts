import { NextResponse } from "next/server"
import marketData from "@/data/market_data.json"

export async function GET() {
  return NextResponse.json(marketData)
}