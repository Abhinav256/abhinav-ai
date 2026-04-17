import { NextResponse } from "next/server"

// This endpoint simulates the GS AI Assistant resolving an anomaly.
// It returns a scripted response (anomaly, cause, solution, description) without calling external AI.

export async function POST(request: Request) {
  try {
    const { desk_id, desk_name, reported_pnl, expected_pnl, variance, issue, root_causes, severity } = await request.json()

    // Create a structured AI response with issue, root_cause, solution, and description
    const pnl_variance = variance || (reported_pnl - expected_pnl)
    
    const issueText = issue || `${desk_name} showing a ${pnl_variance.toFixed(1)}M variance`
    const rootCause = (root_causes && root_causes.length > 0) ? root_causes[0] : 'Multiple valuation discrepancies detected'
    const solutionText = `Recalculate valuations, refresh market data feeds, and apply updated FX rates for impacted instruments.`

    const descriptionLines = [
      `Detected variance: $${pnl_variance.toFixed(1)}M between reported P&L ($${reported_pnl.toFixed(1)}M) and expected P&L ($${expected_pnl.toFixed(1)}M).`,
      `Severity level: ${severity || 'High'}.`,
      `Likely root cause: ${rootCause}.`,
      `Recommended immediate action: ${solutionText}`,
      `Impact: may affect end-of-day P&L and regulatory reports if not corrected.`,
      `Estimated fix time: automated reconciliation will normalize P&L within minutes.`
    ]

    const response = {
      desk_id,
      desk_name,
      issue: issueText,
      root_cause: rootCause,
      solution: solutionText,
      description: descriptionLines.join('\n'),
      actions_taken: [
        'Identified valuation mismatch',
        'Prepared market data refresh',
        'Queued FX rates update',
        'Ready for automated reconciliation'
      ]
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('AI resolution error:', err)
    return NextResponse.json({ error: 'AI resolution failed' }, { status: 500 })
  }
}

