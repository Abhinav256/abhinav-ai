# Code Examples & Developer Reference

## 1. Using the AIChatWidget Component

### Basic Usage with Anomaly Data

```tsx
import { AIChatWidget } from "@/components/ai-chat-widget"

export function MyComponent() {
  const anomalyData = {
    desk_id: "desk_001",
    desk_name: "Equity Derivatives",
    issue: "FX rate mismatch",
    reported_pnl: 110.0,
    expected_pnl: 125.2,
    variance: 15.2,
    root_causes: ["FX rate mismatch on hedged positions"],
    severity: "High"
  }

  const handleSolveAnomaly = async () => {
    try {
      const response = await fetch('/api/resolve-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desk_id: anomalyData.desk_id })
      })
      const result = await response.json()
      console.log('Resolved:', result)
    } catch (error) {
      console.error('Resolution failed:', error)
    }
  }

  return (
    <AIChatWidget
      deskId={anomalyData.desk_id}
      deskName={anomalyData.desk_name}
      anomalyData={anomalyData}
      onSolveAnomaly={handleSolveAnomaly}
      className="h-[400px]"
    />
  )
}
```

### Props Reference

```tsx
interface AIChatWidgetProps {
  // Optional: Desk identifier
  deskId?: string

  // Optional: Desk display name
  deskName?: string

  // Optional: Initial context for non-anomaly uses
  initialContext?: string

  // Optional: Anomaly data (triggers auto-analysis)
  anomalyData?: {
    desk_id: string
    desk_name: string
    issue: string
    reported_pnl: number
    expected_pnl: number
    variance: number
    root_causes: string[]
    severity: string
  }

  // Optional: Callback when anomaly is resolved
  onSolveAnomaly?: () => Promise<void>

  // Optional: Resolution callback for non-anomaly mode
  onResolution?: (data: any) => void

  // Optional: Additional CSS class
  className?: string
}
```

---

## 2. Progress Bar Implementation

### Basic Progress Bar

```tsx
import { useState } from "react"

export function ProgressTracker({ solvedCount, totalCount = 547 }) {
  const percentage = (solvedCount / totalCount) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>{solvedCount}/{totalCount} issues resolved</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

### Usage Example

```tsx
import { ProgressTracker } from "@/components/progress-tracker"

export function MyPage() {
  const [solvedCount, setSolvedCount] = useState(0)

  const handleResolve = async () => {
    // ... resolve anomaly
    setSolvedCount(prev => prev + 1)
  }

  return (
    <>
      <ProgressTracker solvedCount={solvedCount} totalCount={547} />
      <button onClick={handleResolve}>Resolve Anomaly</button>
    </>
  )
}
```

---

## 3. API Integration Examples

### Calling /api/ai-resolve

```typescript
// Frontend: Fetch AI analysis
async function getAIAnalysis(anomalyData) {
  const response = await fetch('/api/ai-resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      desk_id: anomalyData.desk_id,
      desk_name: anomalyData.desk_name,
      reported_pnl: anomalyData.reported_pnl,
      expected_pnl: anomalyData.expected_pnl,
      variance: anomalyData.variance,
      issue: anomalyData.issue,
      root_causes: anomalyData.root_causes,
      severity: anomalyData.severity
    })
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return await response.json()
}

// Usage
try {
  const analysis = await getAIAnalysis(anomalyData)
  console.log('Analysis:', analysis)
  // Expected response:
  // {
  //   desk_id: "desk_001",
  //   desk_name: "Equity Derivatives",
  //   issue: "...",
  //   root_cause: "...",
  //   solution: "...",
  //   description: "...",
  //   actions_taken: [...]
  // }
} catch (error) {
  console.error('Failed to get analysis:', error)
}
```

### Calling /api/resolve-anomaly

```typescript
// Frontend: Execute resolution
async function resolveAnomaly(deskId) {
  const response = await fetch('/api/resolve-anomaly', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ desk_id: deskId })
  })

  if (!response.ok) {
    throw new Error(`Resolution failed: ${response.status}`)
  }

  return await response.json()
}

// Usage
try {
  const result = await resolveAnomaly("desk_001")
  console.log('Resolution result:', result)
  // Expected response:
  // {
  //   desk_id: "desk_001",
  //   desk_name: "Equity Derivatives",
  //   final_pnl: 125.2,
  //   actions_taken: ["...", "..."]
  // }
} catch (error) {
  console.error('Resolution failed:', error)
}
```

---

## 4. State Management Pattern

### Using React Hooks

```tsx
import { useState, useCallback } from "react"

export function AnomalyResolutionManager() {
  const [solvedCount, setSolvedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResolveAnomaly = useCallback(async (deskId) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/resolve-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desk_id: deskId })
      })

      if (!response.ok) {
        throw new Error(`Failed to resolve: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Update state
      setSolvedCount(prev => prev + 1)
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    solvedCount,
    isLoading,
    error,
    handleResolveAnomaly
  }
}

// Usage in component
export function MyComponent() {
  const { solvedCount, isLoading, error, handleResolveAnomaly } =
    AnomalyResolutionManager()

  return (
    <div>
      <p>Resolved: {solvedCount}/547</p>
      {error && <p className="text-red-500">{error}</p>}
      <button 
        onClick={() => handleResolveAnomaly("desk_001")}
        disabled={isLoading}
      >
        {isLoading ? 'Resolving...' : 'Resolve'}
      </button>
    </div>
  )
}
```

---

## 5. Error Handling Patterns

### Try-Catch with Fallback

```tsx
async function safeResolveAnomaly(deskId: string) {
  try {
    // Attempt resolution
    const response = await fetch('/api/resolve-anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desk_id: deskId })
    })

    if (!response.ok) {
      // Handle HTTP errors
      const error = await response.json()
      throw new Error(error.message || 'Resolution failed')
    }

    return await response.json()

  } catch (error) {
    // Handle network/parsing errors
    if (error instanceof TypeError) {
      console.error('Network error:', error)
      throw new Error('Network connection failed')
    }

    if (error instanceof Error) {
      console.error('Resolution error:', error.message)
      throw error
    }

    // Fallback for unknown errors
    console.error('Unknown error:', error)
    throw new Error('An unexpected error occurred')
  }
}

// Usage with error boundary
try {
  const result = await safeResolveAnomaly("desk_001")
  toast({ title: "Success", description: "Anomaly resolved" })
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error"
  toast({ 
    title: "Error", 
    description: message,
    variant: "destructive" 
  })
}
```

---

## 6. TypeScript Interfaces

### Anomaly Type

```typescript
interface Anomaly {
  desk_id: string
  desk_name: string
  issue: string
  reported_pnl: number
  expected_pnl: number
  variance: number
  root_causes: string[]
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
}
```

### AI Analysis Response Type

```typescript
interface AIAnalysisResponse {
  desk_id: string
  desk_name: string
  issue: string
  root_cause: string
  solution: string
  description: string
  actions_taken: string[]
}
```

### Resolution Response Type

```typescript
interface ResolutionResponse {
  desk_id: string
  desk_name: string
  final_pnl: number
  actions_taken: string[]
  timestamp?: string
  resolved_by?: string
}
```

---

## 7. Toast Notification Examples

### Success Toast

```tsx
import { useToast } from "@/components/ui/use-toast"

function MyComponent() {
  const { toast } = useToast()

  const handleSuccess = (solvedCount: number, totalCount: number) => {
    toast({
      title: "Anomaly Resolved",
      description: `Successfully resolved. ${solvedCount}/${totalCount} issues resolved`,
      duration: 5000,
    })
  }

  return <button onClick={() => handleSuccess(1, 547)}>Resolve</button>
}
```

### Error Toast

```tsx
const { toast } = useToast()

const handleError = (errorMessage: string) => {
  toast({
    title: "Resolution Failed",
    description: errorMessage,
    variant: "destructive",
    duration: 5000,
  })
}
```

---

## 8. Custom Hook Example

### useAnomalyResolution Hook

```typescript
import { useState, useCallback } from "react"

interface UseAnomalyResolutionOptions {
  onSuccess?: (result: ResolutionResponse) => void
  onError?: (error: Error) => void
  totalCount?: number
}

export function useAnomalyResolution(options: UseAnomalyResolutionOptions = {}) {
  const { onSuccess, onError, totalCount = 547 } = options

  const [solvedCount, setSolvedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const resolve = useCallback(async (deskId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/resolve-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desk_id: deskId })
      })

      if (!response.ok) {
        throw new Error(`Status ${response.status}`)
      }

      const result: ResolutionResponse = await response.json()
      setSolvedCount(prev => prev + 1)
      onSuccess?.(result)
      return result

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)
      throw error

    } finally {
      setIsLoading(false)
    }
  }, [onSuccess, onError])

  const progress = (solvedCount / totalCount) * 100
  const remaining = totalCount - solvedCount

  return {
    solvedCount,
    totalCount,
    progress,
    remaining,
    isLoading,
    error,
    resolve,
    reset: () => setSolvedCount(0)
  }
}

// Usage
function MyComponent() {
  const { solvedCount, progress, isLoading, resolve } = useAnomalyResolution({
    onSuccess: (result) => console.log('Resolved:', result),
    onError: (error) => console.error('Failed:', error)
  })

  return (
    <div>
      <div>{solvedCount}/547 ({Math.round(progress)}%)</div>
      <button 
        onClick={() => resolve("desk_001")}
        disabled={isLoading}
      >
        Resolve
      </button>
    </div>
  )
}
```

---

## 9. Unit Test Examples

### Testing the Progress Calculation

```typescript
// __tests__/progress.test.ts
describe('Progress calculation', () => {
  it('calculates percentage correctly', () => {
    const solvedCount = 50
    const totalCount = 547
    const expected = (50 / 547) * 100

    expect((solvedCount / totalCount) * 100).toBeCloseTo(expected)
  })

  it('handles zero count', () => {
    expect((0 / 547) * 100).toBe(0)
  })

  it('handles all resolved', () => {
    expect((547 / 547) * 100).toBe(100)
  })
})
```

### Testing API Call

```typescript
// __tests__/api.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

describe('Anomaly resolution', () => {
  it('fetches AI analysis on mount', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ issue: 'Test issue', ... })
    })
    global.fetch = mockFetch

    // ... test code ...

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/ai-resolve', expect.any(Object))
    })
  })
})
```

---

## 10. Configuration Examples

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_ANOMALY_TOTAL_COUNT=547
```

### Usage in Code

```typescript
const totalAnomalies = parseInt(
  process.env.NEXT_PUBLIC_ANOMALY_TOTAL_COUNT || '547'
)
```

---

## Performance Optimization Tips

### 1. Memoization

```tsx
import { useMemo } from 'react'

export function OptimizedProgressTracker({ solvedCount }) {
  const percentage = useMemo(() => {
    return (solvedCount / 547) * 100
  }, [solvedCount])

  return <div style={{ width: `${percentage}%` }} />
}
```

### 2. Lazy Loading

```tsx
import dynamic from 'next/dynamic'

const AIChatWidget = dynamic(
  () => import('@/components/ai-chat-widget'),
  { loading: () => <div>Loading...</div> }
)
```

### 3. Debouncing

```typescript
import { debounce } from 'lodash'

const debouncedResolve = debounce(async (deskId) => {
  await resolveAnomaly(deskId)
}, 300)
```

---

These code examples should help you extend and customize the anomaly resolution feature!
