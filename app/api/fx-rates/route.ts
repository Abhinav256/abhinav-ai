import { NextResponse } from "next/server"
import fxRates from "@/data/fx_rates.json"

export async function GET() {
  return NextResponse.json(fxRates)
}