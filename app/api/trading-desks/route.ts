import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const TRADING_FILE = path.join(process.cwd(), "data", "trading_desks.json")

export async function GET() {
  const raw = await fs.readFile(TRADING_FILE, "utf8")
  const tradingDesks = JSON.parse(raw)
  return NextResponse.json(tradingDesks)
}