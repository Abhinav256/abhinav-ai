import { useEffect, useState } from "react"

type AnomalyCountSubscriber = (count: number) => void

class AnomalyStateService {
  private anomalyCount = 0
  private subscribers = new Set<AnomalyCountSubscriber>()

  subscribe(subscriber: AnomalyCountSubscriber): () => void {
    this.subscribers.add(subscriber)
    subscriber(this.anomalyCount)
    return () => {
      this.subscribers.delete(subscriber)
    }
  }

  updateAnomalyCount(count: number) {
    if (this.anomalyCount === count) {
      return
    }
    this.anomalyCount = count
    for (const subscriber of this.subscribers) {
      subscriber(count)
    }
  }

  get currentCount() {
    return this.anomalyCount
  }
}

export const anomalyStateService = new AnomalyStateService()

export function useAnomalyCount() {
  const [count, setCount] = useState(anomalyStateService.currentCount)

  useEffect(() => {
    const unsubscribe = anomalyStateService.subscribe(setCount)
    return unsubscribe
  }, [])

  return count
}
