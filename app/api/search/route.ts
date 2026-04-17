import { NextResponse } from "next/server"
import companies from "@/data/companies.json"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.toLowerCase() || ""

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  // Search existing companies
  const existingMatches = companies.companies
    .filter((c) => c.name.toLowerCase().includes(query))
    .map((c) => ({
      id: c.id,
      name: c.name,
      status: "existing" as const,
    }))

  // If no existing matches, return the query as a "new" company
  if (existingMatches.length === 0) {
    return NextResponse.json({
      results: [
        {
          id: query.toLowerCase().replace(/\s+/g, "-"),
          name: query.charAt(0).toUpperCase() + query.slice(1),
          status: "new" as const,
        },
      ],
    })
  }

  return NextResponse.json({ results: existingMatches })
}
