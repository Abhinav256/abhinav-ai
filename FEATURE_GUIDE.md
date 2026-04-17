# Anomaly Resolution with GS AI Assistant - Feature Guide

## Quick Start

When you open the Financial Dashboard at `/dashboard/financial`:

1. **Locate an anomaly card** in the "Active Anomalies" section
2. **Click "Resolve with AI"** button on the card
3. **View AI Analysis** in the chat widget:
   - Issue summary
   - Root cause identification
   - Recommended solution
   - Detailed description
4. **Click "Solve Anomaly"** button to execute resolution
5. **Watch the progress bar** update (X/547 issues resolved)

## What's New

### Anomaly Resolution Dialog

When you click "Resolve with AI", a modal opens with:

```
┌─────────────────────────────────────────┐
│ AI Finance Assistant - [Desk Name]      │
├─────────────────────────────────────────┤
│                                         │
│ Resolution Progress                     │
│ 1/547 issues resolved [50%]             │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░    │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ GS AI Assistant Chat Widget       │  │
│ │                                   │  │
│ │ Issue: [AI Analysis]              │  │
│ │ Root Cause: [Root Cause]          │  │
│ │ Solution: [Recommended Action]    │  │
│ │ Description: [Detailed Info]      │  │
│ │                                   │  │
│ │ [Solve Anomaly] ✓ Button          │  │
│ │                                   │  │
│ │ ✓ Anomaly successfully resolved!  │  │
│ │   (After clicking Solve)          │  │
│ │                                   │  │
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Progress Tracking

**Format**: `X/547 issues resolved`

- **Current Progress**: Shows which anomaly # you're on
- **Percentage**: Calculated as `(X / 547) * 100`
- **Progress Bar**: Animated gradient (cyan → blue)
  - Updates smoothly when you resolve each anomaly
  - Like Advanced Technologies progress bars

**Example:**
- Resolve 1st anomaly: `1/547` (0.18%)
- Resolve 5th anomaly: `5/547` (0.91%)
- Resolve 100th anomaly: `100/547` (18.29%)

### AI Analysis Format

When the chat widget loads, it automatically fetches AI analysis with:

#### Issue
- Summary of the P&L variance
- Example: "Equity Derivatives showing a 15.2M variance"

#### Root Cause
- Identified reason for the anomaly
- Example: "FX rate mismatch on hedged positions"

#### Solution
- Recommended action to fix
- Example: "Recalculate valuations, refresh market data, update FX rates"

#### Description
- Detailed multi-line explanation
  - Variance amount and specifics
  - Impact analysis
  - Estimated fix time
  - Risk assessment

## Feature Components

### 1. Progress Bar
- **Location**: Top of the "Resolve with AI" dialog
- **Style**: Advanced Technologies-inspired gradient
- **Animation**: Smooth width transition
- **Responsive**: Updates in real-time as anomalies are solved

### 2. AI Chat Widget
- **Auto-initialization**: Automatically sends anomaly for analysis
- **Structured Responses**: Organized issue/cause/solution/description
- **Interactive**: Ask follow-up questions about the anomaly
- **Solve Button**: One-click resolution execution

### 3. Anomaly Reduction
- **Automatic**: When you click "Solve Anomaly", the count decreases
- **Real-time**: Dashboard refreshes immediately
- **Toast Notification**: Confirms successful resolution
- **Progress Update**: Your progress increments by 1

## Example Walkthrough

### Step 1: Anomaly Detected
```
Active Anomalies Card:
┌─────────────────────────┐
│ Equity Derivatives      │
│ FX rate mismatch        │
│ $15.2M variance     [H] │
└─────────────────────────┘
          ↓
[Resolve manually] [Resolve with AI] ← Click here
```

### Step 2: Dialog Opens
```
AI Finance Assistant - Equity Derivatives
─────────────────────────────────────────
Resolution Progress
1/547 issues resolved [0.18%]
████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

[Chat Widget loads and fetches AI analysis...]
```

### Step 3: AI Analysis Appears
```
GS AI Assistant:

Issue: Equity Derivatives showing a 15.2M variance

Root Cause: FX rate mismatch on hedged positions

Solution: Recalculate valuations, refresh market data, 
update FX rates for affected instruments

Description:
- Detected variance: $15.2M between reported and expected P&L
- Severity level: High
- Likely root cause: FX rate mismatch on hedged positions
- Impact: May affect EOD P&L and regulatory reports
- Estimated fix: Automated reconciliation within minutes

[Solve Anomaly] ← Click to execute
```

### Step 4: Anomaly Resolved
```
GS AI Assistant:
✓ Anomaly successfully resolved! The P&L variance 
  has been corrected and the anomaly count has been updated.

Progress bar updates:
2/547 issues resolved [0.37%]
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Toast notification:
✓ Anomaly Resolved
  Successfully resolved. 2/547 issues resolved
```

## Technical Architecture

### Data Flow

```
Financial Dashboard (page.tsx)
    ↓
[Click "Resolve with AI"]
    ↓
Dialog + AIChatWidget opens
    ↓
anomalyData prop passed
    ↓
AIChatWidget auto-initializes
    ↓
sendAnomalyAnalysis() called
    ↓
POST /api/ai-resolve
    ↓
Structured Response (issue/cause/solution/description)
    ↓
Chat Widget displays analysis
    ↓
[User clicks "Solve Anomaly"]
    ↓
onSolveAnomaly() callback
    ↓
POST /api/resolve-anomaly
    ↓
Backend updates data
    ↓
solvedCount increments
    ↓
Progress bar animates
    ↓
Dashboard refreshes
    ↓
Toast confirmation
```

### State Management

```javascript
// Financial Dashboard
const [solvedCount, setSolvedCount] = useState(0)
const [anomalies, setAnomalies] = useState<Anomaly[]>([])
const [summary, setSummary] = useState<Summary>()

// When Solve Anomaly clicked:
setSolvedCount(prev => prev + 1)  // Increment counter
await fetchAnomalies()             // Refresh list
await fetchTradingDesks()          // Update summary
toast({ description: `${solvedCount + 1}/547...` })
```

## API Endpoints Used

### 1. GET /api/anomalies
**Returns**: List of all detected anomalies
```json
{
  "anomalies": [
    {
      "desk_id": "desk_001",
      "desk_name": "Equity Derivatives",
      "issue": "FX rate mismatch",
      "reported_pnl": 110.0,
      "expected_pnl": 125.2,
      "variance": 15.2,
      "root_causes": ["FX rate mismatch"],
      "severity": "High"
    }
  ]
}
```

### 2. POST /api/ai-resolve
**Input**: Anomaly details
**Returns**: Structured AI analysis
```json
{
  "issue": "Equity Derivatives showing a 15.2M variance",
  "root_cause": "FX rate mismatch on hedged positions",
  "solution": "Recalculate valuations, refresh market data...",
  "description": "Multi-line detailed analysis"
}
```

### 3. POST /api/resolve-anomaly
**Input**: { desk_id }
**Returns**: Resolution confirmation
```json
{
  "desk_id": "desk_001",
  "desk_name": "Equity Derivatives",
  "final_pnl": 125.2,
  "actions_taken": [...]
}
```

### 4. GET /api/trading-desks
**Returns**: Updated desk summary with reduced anomaly count

## Styling & UI

### Progress Bar
- **Container**: `w-full bg-slate-800 rounded-full h-2`
- **Fill**: `bg-gradient-to-r from-cyan-500 to-blue-500`
- **Animation**: `transition-all duration-300`
- **Label**: Shows `X/547` and percentage above bar

### Chat Widget
- **Height**: `h-[400px]` (responsive)
- **Color Scheme**: Slate + Blue (matches dashboard)
- **AI Messages**: Light blue background
- **User Messages**: Bright blue background
- **Success Messages**: Green border + background

### Dialog
- **Width**: `max-w-3xl` (wide for chat widget)
- **Height**: `max-h-[90vh]` (scrollable if needed)
- **Background**: `bg-slate-900`
- **Border**: `border-slate-700`
- **Text**: `text-white`

## Keyboard Shortcuts

| Action | Keyboard |
|--------|----------|
| Send message in chat | Enter |
| Cancel dialog | Escape |
| Trigger "Solve Anomaly" | Tab to button + Enter |

## Troubleshooting

### Progress bar not updating?
- Check browser console for errors
- Verify `/api/resolve-anomaly` returns status 200
- Check that `setSolvedCount` is called after resolution

### AI analysis not appearing?
- Check `/api/ai-resolve` response
- Verify anomaly data is passed correctly
- Check network tab for 200 status

### Dialog won't close?
- Click outside the dialog (click on dark background)
- Press Escape key
- Refresh the page

## Performance Notes

- **Progress bar animation**: Smooth 300ms transitions
- **Chat widget**: Lazy loads AI analysis on modal open
- **Data refresh**: Concurrent fetches using Promise.all
- **Toast notification**: Appears for 5 seconds then auto-dismiss

## Future Enhancements

- [ ] Batch resolve multiple anomalies
- [ ] Save favorite resolutions
- [ ] AI model selection
- [ ] Historical trend analysis
- [ ] Custom resolution templates
- [ ] Real-time anomaly stream
- [ ] Team collaboration features

---

**For issues or questions, contact**: GS AI Support Team
