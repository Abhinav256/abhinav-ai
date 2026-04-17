import { NextResponse } from "next/server"
import trades from "@/data/trades.json"

export async function GET() {
  return NextResponse.json(trades)
}