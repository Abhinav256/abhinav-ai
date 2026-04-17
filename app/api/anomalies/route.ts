import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import trades from "@/data/trades.json"
import marketData from "@/data/market_data.json"
import fxRates from "@/data/fx_rates.json"

const TRADING_FILE = path.join(process.cwd(), "data", "trading_desks.json")

export async function GET() {
  const anomalies = []
  const tradingData = await fs.readFile(TRADING_FILE, "utf8")
  const tradingDesks = JSON.parse(tradingData)

  // Check each trading desk for anomalies
  for (const desk of tradingDesks.tradingDesks) {
    if (desk.status === "Anomaly") {
      // Find related trades for this desk
      const deskTrades = trades.trades.filter(trade => trade.desk_id === desk.desk_id)

      const rootCauses = []

      // Check market data status for each trade
      for (const trade of deskTrades) {
        const marketInfo = marketData.marketData.find(md => md.instrument === trade.instrument)
        if (marketInfo && marketInfo.status === "STALE") {
          rootCauses.push(`Stale market data used for ${trade.instrument} valuation`)
        }

        // Check FX rates if currency conversion is needed
        if (trade.currency !== "USD") {
          const fxPair = trade.currency === "EUR" ? "EUR/USD" : "USD/JPY"
          const fxInfo = fxRates.fxRates.find(fx => fx.currency_pair === fxPair && fx.status === "OLD")
          if (fxInfo) {
            rootCauses.push(`Old ${fxPair} FX rate applied`)
          }
        }
      }

      const anomaly = {
        desk_id: desk.desk_id,
        desk_name: desk.desk_name,
        issue: "P&L Variance",
        reported_pnl: desk.pnl_reported,
        expected_pnl: desk.pnl_expected,
        variance: desk.variance,
        root_causes: rootCauses.length > 0 ? rootCauses : ["Multiple valuation discrepancies detected"],
        severity: Math.abs(desk.variance) > 10 ? "HIGH" : "MEDIUM"
      }

      anomalies.push(anomaly)
    }
  }

  return NextResponse.json({ anomalies })
}