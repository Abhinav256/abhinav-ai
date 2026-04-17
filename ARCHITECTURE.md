# Financial Dashboard Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Financial Dashboard UI                        │
│                  (app/dashboard/financial/page.tsx)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Header Section                                          │   │
│  │  ┌─────────────────┐  ┌──────────┐  ┌──────────┐       │   │
│  │  │  Theme Toggle   │  │ Export   │  │ Refresh  │       │   │
│  │  │  (Sun/Moon)     │  │   CSV    │  │  Button  │       │   │
│  │  └─────────────────┘  └──────────┘  └──────────┘       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Metrics Cards (4 columns)                               │   │
│  │  - Total Anomalies                                       │   │
│  │  - Anomalies Resolved                                    │   │
│  │  - Success Rate                                          │   │
│  │  - Avg. Resolution Time                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Progress Tracking                                       │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ 123/456 Anomalies Resolved (27%)               │    │   │
│  │  │ ▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒ [Animated 10s bar]           │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Trading Desks Table & Anomaly Details                   │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Desk │ Region │ Status │ P&L │ Variance │ Actions │ │   │
│  │  ├─────────────────────────────────────────────────────┤ │   │
│  │  │ D001 │ USA    │ Recon  │ ✓   │ 0.1M     │ View    │ │   │
│  │  │ D007 │ UK     │ Anomaly│ ✗   │ 12.3M    │ Solve   │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Anomaly Details (Dialog/Modal)                          │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Desk: D007 - Interest Rate Swaps                    │ │   │
│  │  │ Variance: 12.3M | Severity: High                   │ │   │
│  │  │ Root Causes: [Valuation mismatch, FX rate impact]  │ │   │
│  │  │                                                     │ │   │
│  │  │  ┌────────────────────────────────────────────┐   │ │   │
│  │  │  │  AI Analysis (AIChatWidget)                │   │ │   │
│  │  │  │  ┌──────────────────────────────────────┐ │   │ │   │
│  │  │  │  │ Issue: Valuation mismatch in rates   │ │   │ │   │
│  │  │  │  │ Root Cause: FX revaluation pending   │ │   │ │   │
│  │  │  │  │ Solution: Run reconciliation...      │ │   │ │   │
│  │  │  │  │                                      │ │   │ │   │
│  │  │  │  │ [Chat messages history...]          │ │   │ │   │
│  │  │  │  │                                      │ │   │ │   │
│  │  │  │  │ [Solve Anomaly Button]              │ │   │ │   │
│  │  │  │  └──────────────────────────────────────┘ │   │ │   │
│  │  │  └────────────────────────────────────────────┘   │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## API Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     API Endpoints                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /api/chat                                                   │
│  ├─ General purpose Gemini chat                             │
│  ├─ Used in sales and general dashboards                    │
│  └─ Returns: Streaming text response                        │
│                                                               │
│  /api/chat-financial                                         │
│  ├─ Financial domain-specific Gemini AI                     │
│  ├─ Includes trading desks, market data, FX rates           │
│  ├─ Used in financial dashboard for anomalies               │
│  └─ Returns: Streaming text response with financial context │
│                                                               │
│  /api/ai-resolve                                             │
│  ├─ Structured anomaly analysis                             │
│  ├─ Returns: {issue, root_cause, solution, description}     │
│  └─ Used for initial anomaly assessment                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
RootLayout (app/layout.tsx)
├─ ThemeProvider (next-themes)
│  └─ attribute="class"
│  └─ defaultTheme="dark"
│  └─ enableSystem=true
│
└─ RootLayout children
   ├─ FinancialDashboard (app/dashboard/financial/page.tsx)
   │  ├─ ThemeToggle (components/theme-toggle.tsx)
   │  │  └─ Sun/Moon icons toggle between light/dark
   │  │
   │  ├─ MetricsCards
   │  │  └─ Display anomaly statistics
   │  │
   │  ├─ ProgressTracker
   │  │  ├─ Random count (100-600)
   │  │  ├─ 10-second animated progress bar
   │  │  └─ requestAnimationFrame for smooth animation
   │  │
   │  ├─ TradingDesksTable
   │  │  └─ Display all trading desks
   │  │
   │  └─ AnomalyDetails Dialog
   │     └─ AIChatWidget (components/ai-chat-widget.tsx)
   │        ├─ API: /api/chat-financial (financial domain)
   │        ├─ Anomaly analysis
   │        ├─ Chat messages
   │        └─ Solve Anomaly button
   │
   └─ Toaster (ui notifications)
```

## Data Flow

```
User Interactions
    │
    ├─ [Click Theme Toggle]
    │  └─> useTheme hook (next-themes)
    │      └─> localStorage + DOM class update
    │          └─> UI switches light/dark mode
    │
    ├─ [Click Export CSV]
    │  └─> exportToCSV()
    │      ├─> Format trading desks to CSV
    │      ├─> Create Blob with text/csv MIME type
    │      ├─> Generate download link
    │      └─> Toast notification
    │
    ├─ [Click Solve Anomaly]
    │  └─> onSolveAnomaly callback
    │      ├─> requestAnimationFrame loop
    │      ├─> 10 second animation
    │      ├─> Update progress (X/Total Anomalies)
    │      └─> Success message
    │
    └─ [View Anomaly Details]
       └─> AIChatWidget
           ├─> sendAnomalyAnalysis()
           │   └─> POST /api/ai-resolve
           │       └─> Get structured response
           │
           └─> sendMessage()
               └─> POST /api/chat-financial
                   ├─ System prompt with financial context
                   ├─ Trade desks, market data, FX rates
                   └─ Streaming text response
```

## State Management

```
FinancialDashboard States:
├─ tradingDesks: TradingDesk[] (loaded from /data/trading_desks.json)
├─ anomalies: Anomaly[] (filtered from trading desks with "Anomaly" status)
├─ totalAnomalies: number (random 100-600, generated on mount)
├─ solvedCount: number (updated by animation)
├─ selectedAnomaly: Anomaly | null (current selected for details)
├─ isLoading: boolean (data fetch state)
└─ lastRefresh: Date (timestamp of last data refresh)

AIChatWidget States:
├─ messages: Message[] (chat conversation history)
├─ input: string (current input text)
├─ isLoading: boolean (API call state)
├─ isSolvingAnomaly: boolean (solve animation state)
├─ resolvedAnomaly: any (response from /api/ai-resolve)
└─ showResolutionConfirm: boolean (confirm dialog state)
```

## Theme Implementation

```
Light Mode (Light)
├─ Background: white (bg-white)
├─ Text: dark gray (text-slate-900)
├─ Cards: light gray (bg-slate-50)
├─ Borders: light (border-slate-200)
└─ Icons: dark (text-slate-700)

Dark Mode (Dark) [Default]
├─ Background: slate-950 (bg-slate-950)
├─ Text: slate-100 (text-slate-100)
├─ Cards: slate-900 (bg-slate-900)
├─ Borders: slate-700 (border-slate-700)
└─ Icons: light (text-slate-300)

CSS Variable Support (optional):
├─ Light: --background: 0 0% 100%
├─ Dark: --background: 222.2 84% 4.9%
└─ Components use: background-color: hsl(var(--background))
```

## File Structure

```
app/
├─ layout.tsx                          [Root layout with ThemeProvider]
├─ dashboard/
│  └─ financial/
│     └─ page.tsx                      [Financial dashboard component]
└─ api/
   ├─ chat/
   │  └─ route.ts                      [General Gemini API]
   ├─ chat-financial/
   │  └─ route.ts                      [Financial Gemini API] ✨ NEW
   └─ ai-resolve/
      └─ route.ts                      [Anomaly analysis]

components/
├─ ai-chat-widget.tsx                  [Chat widget component]
├─ theme-toggle.tsx                    [Theme toggle button] ✨ NEW
├─ theme-provider.tsx                  [Next-themes wrapper]
└─ ui/                                 [Radix UI components]

data/
└─ trading_desks.json                  [Trading desk data with anomalies] ✅ UPDATED
```

## Key Features

### 1. Smooth Animations
- **Duration**: 10 seconds
- **Method**: requestAnimationFrame (60fps)
- **Easing**: Linear progression
- **Visual**: Animated progress bar with gradient colors

### 2. CSV Export
- **Format**: RFC 4180 CSV with quoted fields
- **Columns**: Desk ID, Name, Region, Type, Status, P&L figures, Variance, Updated timestamp
- **Filename**: `trading-desks-YYYY-MM-DD.csv`
- **Delivery**: Automatic browser download via Blob

### 3. AI Integration
- **Model**: Google Gemini 2.5 Flash
- **Context**: Financial data (desks, markets, FX rates)
- **Response**: Streaming text for real-time display
- **Endpoints**: General (/api/chat) and Financial (/api/chat-financial)

### 4. Theme Support
- **Storage**: Browser localStorage
- **Provider**: next-themes with system detection
- **Styles**: Tailwind CSS with dark/light mode utilities
- **Toggle**: One-click button with visual feedback

---

## Performance Optimizations

1. **Streaming Responses**: Use Vercel AI SDK for real-time text streaming
2. **Lazy Loading**: Anomalies loaded on-demand in dialog
3. **Animation**: requestAnimationFrame for GPU-accelerated animation
4. **Memoization**: React hooks prevent unnecessary re-renders
5. **Code Splitting**: Next.js automatic route-based code splitting

---

## Security Considerations

1. **No API keys exposed**: Environment variables used for API keys
2. **CORS**: API routes properly configured
3. **Input validation**: User input validated before API calls
4. **Error handling**: All API calls wrapped in try-catch
5. **Secure tokens**: Gemini API calls server-side only

---
