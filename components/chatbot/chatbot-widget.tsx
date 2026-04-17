"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Sparkles, Bot, Zap, AlertCircle, Lock, Mic, MicOff, AlertTriangle } from "lucide-react"
import { ComparisonChart } from "./comparison-chart"
import { useChatbot } from "./chatbot-provider"
import { anomalyStateService } from "@/components/anomaly-state.service"

interface ComparisonData {
  companies: string[]
  metrics: Array<{
    name: string
    [key: string]: string | number
  }>
}

interface ErrorResponse {
  error?: string
  message?: string
  details?: string
  type?: string
  code?: string
}

export function ChatbotWidget() {
  const [input, setInput] = useState("")
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [resolving, setResolving] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentAnomalyId, setCurrentAnomalyId] = useState<string | null>(null)
  const [isAnomalyMode, setIsAnomalyMode] = useState(false)
  const [error, setError] = useState<ErrorResponse | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [failedMessageIds, setFailedMessageIds] = useState<Set<string>>(new Set())
  const recognitionRef = useRef<any>(null)
  const { pendingAnomaly, setPendingAnomaly, onAnomalyResolved } = useChatbot()

  // Get user role from session API on mount
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const sessionId = localStorage.getItem("gs_session_id")
        if (!sessionId) {
          console.log("[CHATBOT] No session ID found")
          return
        }

        const res = await fetch(`/api/sessions?sessionId=${sessionId}`)
        const data = await res.json()
        
        if (data.success && data.session) {
          setUserRole(data.session.role)
          console.log("[CHATBOT] User role from session:", data.session.role)
        }
      } catch (error) {
        console.error("[CHATBOT] Failed to fetch session:", error)
      }
    }

    fetchUserSession()
  }, [])

  // Initialize Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("[CHATBOT] Speech Recognition API not supported")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      console.log("[CHATBOT] Voice dictation started")
      setIsListening(true)
    }

    recognition.onend = () => {
      console.log("[CHATBOT] Voice dictation ended")
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          // Final result - add to input
          setInput((prev) => prev + transcript + " ")
        } else {
          // Interim result for preview
          interimTranscript += transcript
        }
      }
    }

    recognition.onerror = (event: any) => {
      // Silently handle error - don't log to console
      if (event.error !== "aborted") {
        console.error("[CHATBOT] Speech recognition error:", event.error)
      }
    }

    recognitionRef.current = recognition

    // Cleanup function to abort recognition on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [])

  // Handle auto-send when listening ends
  useEffect(() => {
    if (!isListening && input.trim()) {
      const timer = setTimeout(() => {
        handleVoiceSubmit()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isListening])

  const toggleVoiceDictation = () => {
    if (!recognitionRef.current) {
      console.error("[CHATBOT] Speech Recognition not available")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleVoiceSubmit = () => {
    if (!input.trim() || isLoading) return

    // ✅ All users can query all data - no restrictions
    setComparisonData(null)
    setError(null)
    sendMessage({ text: input })
    setInput("")
  }

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  /**
   * Parse error response from API
   * Handles both structured error objects and plain error messages
   */
  const parseErrorResponse = (error: any): ErrorResponse => {
    console.log("[CHATBOT] parseErrorResponse called with:", error)
    
    // If it's already a structured error object
    if (error?.error || error?.message) {
      console.log("[CHATBOT] Parsed as structured error:", error)
      
      // Check if message is a JSON string and extract it
      let message = error.message
      if (typeof message === 'string' && message.startsWith('{')) {
        try {
          const parsed = JSON.parse(message)
          message = parsed.message || parsed.error || message
        } catch {}
      }
      
      return {
        error: error.error,
        message: message,
        details: error.details,
        type: error.type,
        code: error.code,
      }
    }

    // If it's a string, try to parse as JSON
    if (typeof error === "string") {
      try {
        const parsed = JSON.parse(error)
        if (parsed?.error || parsed?.message) {
          console.log("[CHATBOT] Parsed string as JSON:", parsed)
          return {
            error: parsed.error || "Error",
            message: parsed.message || String(parsed),
            details: parsed.details,
            type: parsed.type,
            code: parsed.code,
          }
        }
      } catch {}
      // If not JSON, return as generic message
      console.log("[CHATBOT] Treating string as plain message:", error)
      return {
        error: "Error",
        message: error,
      }
    }

    // If the error object has a message but no explicit error type, normalize it
    if (error?.message) {
      console.log("[CHATBOT] Parsed as error with message:", error)
      
      // Check if message is a JSON string
      let message = error.message
      if (typeof message === 'string' && message.startsWith('{')) {
        try {
          const parsed = JSON.parse(message)
          message = parsed.message || parsed.error || message
        } catch {}
      }
      
      return {
        error: error.error || "Error",
        message: message,
        details: error.details,
        type: error.type,
        code: error.code,
      }
    }

    // Fallback
    console.log("[CHATBOT] Using fallback error message")
    return {
      error: "Error",
      message: "An unexpected error occurred",
    }
  }

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (resource, options) => {
        // Get dashboard from pathname
        const currentPath = typeof window !== "undefined" ? window.location.pathname : ""
        const dashboard = currentPath.includes("/financial") ? "financial" : currentPath.includes("/sales") ? "sales" : "financial"
        
        // Get session ID from localStorage or cookie
        const sessionId = typeof window !== "undefined" ? localStorage.getItem("gs_session_id") : null
        
        // Parse the request body to add dashboard
        const body = options?.body ? JSON.parse(options.body as string) : {}
        body.dashboard = dashboard
        
        // Create new options with updated body
        const updatedOptions = {
          ...options,
          body: JSON.stringify(body),
          credentials: "include" as const, // Include cookies in the request
          headers: {
            ...((options?.headers || {}) as Record<string, string>),
            "Content-Type": "application/json",
            ...(sessionId ? { "X-Session-ID": sessionId } : {})
          }
        }
        
        console.log(`[CHATBOT] Sending request with dashboard: ${dashboard}, sessionId: ${sessionId}`)
        const response = await fetch(resource, updatedOptions)
        
        // If we get a 403 error, clone and return it so the error can be read by the error handler
        if (response.status === 403) {
          console.error("[CHATBOT] Authorization error (403) received from server")
          // Clone the response so it can be read by the error handler
          return response.clone()
        }
        
        return response
      }
    }),
    onError: (error) => {
      console.error("[CHATBOT] Error:", error)
      // Try to extract the error response from the error object
      const errorData = (error as any)?.data || error
      const parsedError = parseErrorResponse(errorData)
      setError(parsedError)
      
      // If this is a 403 authorization error, mark the last message as failed
      // so it won't be displayed in the chat
      if (parsedError.code === "403_FORBIDDEN") {
        console.log("[CHATBOT] Marking failed authorization message")
        // We'll filter out messages that don't have corresponding assistant responses
        // by checking if the message is followed by an actual response
      }
    },
    onFinish: (result) => {
      console.log("[CHATBOT] Message finished")
      const text = ((result.message as any).parts || [])
        .filter((part: any) => part?.type === "text" || part?.type === "reasoning")
        .map((part: any) => part.text || "")
        .join("")

      if (text.includes("COMPARISON_DATA:")) {
        try {
          const jsonMatch = text.match(/COMPARISON_DATA:([\s\S]*?)END_COMPARISON/)
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1])
            setComparisonData(data)
          }
        } catch {}
      }
    },
  })

  // Custom submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // ✅ All users can query all data - no restrictions
    setComparisonData(null)
    setError(null)
    sendMessage({ text: input })
    setInput("")
  }

  const isLoading = status === "streaming" || status === "submitted"

  const isUserNearBottom = () => {
    const el = scrollRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100
  }

  useEffect(() => {
    if (isUserNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle pending anomaly from financial dashboard
  useEffect(() => {
    if (pendingAnomaly) {
      const normalizedRole = userRole?.toLowerCase()
      if (normalizedRole === "sales") {
        console.warn("[CHATBOT] Sales user blocked from pending anomaly analysis")
        setError({
          error: "Access Restricted",
          message: "🔒 You do not have permission to analyze P&L anomalies."
        })
        return
      }

      console.log("[CHATBOT] Received pending anomaly:", pendingAnomaly)
      setIsAnomalyMode(true)
      setError(null)
      const anomalyMessage = `Please analyze and resolve this P&L anomaly:

**Desk:** ${pendingAnomaly.desk_name}
**Issue:** ${pendingAnomaly.issue}
**Reported P&L:** $${pendingAnomaly.reported_pnl}M
**Expected P&L:** $${pendingAnomaly.expected_pnl}M
**Variance:** $${pendingAnomaly.variance}M
**Severity:** ${pendingAnomaly.severity}

**Root Causes Identified:**
${pendingAnomaly.root_causes.map((cause) => `- ${cause}`).join('\n')}

Please provide a detailed analysis and solution recommendations. After analysis, confirm if you're ready to proceed with automated resolution.`

      setComparisonData(null)
      console.log("[CHATBOT] Sending anomaly message to AI...")
      sendMessage({ text: anomalyMessage })
      // Don't clear pendingAnomaly here - keep it for the resolve button!
    }
  }, [pendingAnomaly, sendMessage])

  const getMessageText = (message: typeof messages[0]) => {
    const text = (message as any).parts
      ?.filter((part: any) => part?.type === "text" || part?.type === "reasoning")
      .map((part: any) => {
        const partText = part.text || ""
        // Ensure we always return a string
        return typeof partText === "string" ? partText : JSON.stringify(partText)
      })
      .join("") || ""
    
    // Ensure we always return a string, not an object
    return typeof text === "string" ? text : JSON.stringify(text)
  }

  const normalizeChatText = (text: string) => {
    return text
      .replace(/^\s*\*\s+/gm, "- ")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^\s*#{1,6}\s*/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }

  const formatMessageText = (text: any) => {
    // Ensure text is a string
    const stringText = typeof text === "string" ? text : JSON.stringify(text)
    return normalizeChatText(stringText.replace(/COMPARISON_DATA:[\s\S]*?END_COMPARISON/g, "")).trim()
  }

  const handleResolveAnomaly = async (deskId: string) => {
    if (!pendingAnomaly) return
    
    setResolving(true)
    setCurrentAnomalyId(deskId)
    setProgress(0)

    // 4-5 second progress animation
    const duration = 4500 // 4.5 seconds
    const startTime = Date.now()
    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const progressPercent = Math.min((elapsed / duration) * 100, 100)
      setProgress(progressPercent)

      if (progressPercent < 100) {
        requestAnimationFrame(animateProgress)
      } else {
        // Resolve complete - call API and refresh
        fetch('/api/resolve-anomaly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ desk_id: deskId })
        }).then(async (response) => {
          // Wait a moment for API to complete
          await new Promise(resolve => setTimeout(resolve, 500))

          try {
            const anomaliesResponse = await fetch('/api/anomalies')
            const anomaliesData = await anomaliesResponse.json()
            anomalyStateService.updateAnomalyCount(anomaliesData.anomalies.length)
          } catch (error) {
            console.error('[CHATBOT] Failed to refresh anomaly count:', error)
          }

          // Call the refresh callback to update dashboard
          if (onAnomalyResolved && typeof onAnomalyResolved === 'function') {
            try {
              await onAnomalyResolved()
            } catch (err) {
              console.error('Error calling onAnomalyResolved:', err)
            }
          }
        }).catch(err => console.error('Failed to resolve:', err))
        
        setResolving(false)
        setCurrentAnomalyId(null)
        setProgress(0)
        setPendingAnomaly(null)
        setIsAnomalyMode(false)
      }
    }

    requestAnimationFrame(animateProgress)
  }

  return (
    <>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Cartoon Pop-In Animation */
        @keyframes cartoonPopIn {
          0% {
            transform: scale(0) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.15) rotate(3deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        /* Pop Out Animation */
        @keyframes cartoonPopOut {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(-10deg);
            opacity: 0;
          }
        }

        /* Bounce Effect */
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* Pulse Glow for Mic */
        @keyframes micPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7), inset 0 0 0 0 rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 0 25px rgba(239, 68, 68, 0), inset 0 0 30px 0 rgba(239, 68, 68, 0.5);
          }
        }

        /* Wave Animation for listening text */
        @keyframes wave {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        /* Soundwave Animation */
        @keyframes soundwave {
          0%, 100% {
            transform: scaleY(0.4);
            opacity: 0.4;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        /* Fade Background */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-enter {
          animation: cartoonPopIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .modal-exit {
          animation: cartoonPopOut 0.5s cubic-bezier(0.64, 0, 0.78, 0.34) forwards;
        }

        .mic-glow {
          animation: micPulse 2.5s ease-in-out infinite;
        }

        .listening-text {
          animation: wave 1.5s ease-in-out infinite;
        }

        .soundwave-bar {
          animation: soundwave 0.8s ease-in-out infinite;
        }

        .soundwave-bar:nth-child(1) {
          animation-delay: 0s;
        }
        .soundwave-bar:nth-child(2) {
          animation-delay: 0.1s;
        }
        .soundwave-bar:nth-child(3) {
          animation-delay: 0.2s;
        }
        .soundwave-bar:nth-child(4) {
          animation-delay: 0.3s;
        }
        .soundwave-bar:nth-child(5) {
          animation-delay: 0.2s;
        }
        .soundwave-bar:nth-child(6) {
          animation-delay: 0.1s;
        }

        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        /* Close Button Animation */
        @keyframes rotateClose {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        .close-btn:hover {
          animation: rotateClose 0.6s ease-in-out;
        }
      `}</style>

      {/* Listening Modal Popup with Cartoon Animation */}
      {isListening && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
        >
          <div 
            className="modal-enter relative bg-gradient-to-br from-red-950 via-slate-900 to-red-950 border-4 border-red-500 rounded-[40px] shadow-2xl shadow-red-500/70 p-12 flex flex-col items-center justify-center w-96 h-[430px]"
          >
            
            {/* Animated Background Glow */}
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-red-600/25 to-transparent opacity-50"></div>

            {/* Close Button - Top Right */}
            <button
              onClick={() => {
                if (recognitionRef.current) {
                  recognitionRef.current.abort()
                  setIsListening(false)
                }
              }}
              className="close-btn absolute top-5 right-5 z-20 w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-red-500/60 cursor-pointer border-2 border-red-400 active:scale-95"
              title="Stop listening"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-6">
              
              {/* Red Mic Icon with Pulse Glow */}
              <div className="relative flex items-center justify-center mt-2">
                <div className="mic-glow absolute w-40 h-40 bg-gradient-to-br from-red-600 to-red-700 rounded-full"></div>
                <button
                  onClick={() => {
                    if (recognitionRef.current) {
                      recognitionRef.current.abort()
                      setIsListening(false)
                    }
                  }}
                  className="relative w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/80 border-4 border-red-400 hover:from-red-500 hover:to-red-700 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <Mic className="w-16 h-16 text-white animate-bounce" style={{ animationDuration: '1.5s' }} />
                </button>
              </div>

              {/* Listening Text */}
              <div className="text-center space-y-2">
                <p className="listening-text text-white font-black text-5xl tracking-wider">
                  Listening
                </p>
                <p className="text-red-300 font-semibold text-lg">Speak Now</p>
              </div>

              {/* Soundwave Visualization */}
              <div className="flex items-center justify-center gap-2.5 h-16">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="soundwave-bar bg-gradient-to-t from-red-500 to-red-300 rounded-full shadow-lg"
                    style={{ width: '3px', height: `${25 + i * 12}px` }}
                  ></div>
                ))}
              </div>

              {/* Hint Text */}
              <p className="text-red-200/70 text-sm font-medium leading-tight">
                Click mic or X to stop
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="fixed top-20 right-0 bottom-0 w-[360px] flex flex-col shadow-2xl z-50 overflow-hidden border-l border-violet-900/30 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 backdrop-blur-xl">
        <CardHeader className="pb-3 border-b border-violet-900/20 shrink-0 px-4 bg-gradient-to-r from-violet-900/10 to-transparent">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">GS AI Assistant</CardTitle>
                <p className="text-xs text-violet-300/60">Goldman Sachs</p>
              </div>
            </div>
            <div className="text-xs text-violet-300/50 font-medium">Right panel</div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/50 to-slate-950">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-4">
            {error && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <div className="bg-gradient-to-br from-red-950/80 via-red-900/60 to-orange-950/50 border border-red-700/60 rounded-xl backdrop-blur-md overflow-hidden shadow-2xl relative">
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-orange-600/5 pointer-events-none" />
                  
                  <div className="p-6 space-y-4 relative z-10">
                    {/* Exception Header with Multiple Icons */}
                    <div className="flex items-start gap-4">
                      <div className="flex gap-2 mt-0.5">
                        <div className="p-2.5 bg-red-500/20 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="p-2.5 bg-red-500/10 rounded-lg">
                          <Lock className="w-5 h-5 text-red-300" />
                        </div>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h3 className="font-bold text-base bg-gradient-to-r from-red-200 via-red-100 to-orange-200 bg-clip-text text-transparent">
                          {error.error || "Access Exception"}
                        </h3>
                        <p className="text-red-300/70 text-xs mt-1 font-medium uppercase tracking-widest">
                          ⚠ Restricted Operation
                        </p>
                        {error.code && (
                          <p className="text-red-400/60 text-xs mt-1 font-mono">
                            [{error.code}]
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-red-700/0 via-red-700/40 to-red-700/0" />

                    {/* Exception Message - Plain text, no JSON */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-red-100/90 text-sm leading-relaxed font-medium">
                          {error.message || "You don't have permission to access this resource."}
                        </p>
                      </div>

                      {/* Exception Details Box */}
                      {error.details && (
                        <div className="bg-red-900/30 border border-red-700/40 rounded-lg p-3">
                          <p className="text-red-300/80 text-xs leading-relaxed font-mono">
                            <span className="text-red-400 mr-2">→</span>{error.details}
                          </p>
                        </div>
                      )}

                      {/* Exception Type Badge */}
                      {error.type && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-900/40 border border-red-700/50 rounded-md text-xs font-mono text-red-300">
                            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                            {error.type}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-red-700/30">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setError(null)}
                        className="border-red-600/50 text-red-200 hover:bg-red-900/40 hover:text-red-100 hover:border-red-500/70 transition-all duration-200 mt-3"
                      >
                        Dismiss
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setInput("");
                          setError(null);
                        }}
                        className="text-red-300 hover:bg-red-900/50 hover:text-red-100 transition-all duration-200 mt-3"
                      >
                        Clear & Retry
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="p-3 bg-gradient-to-br from-violet-900/20 to-purple-900/10 rounded-2xl w-fit mx-auto mb-4 border border-violet-700/20">
                  <Bot className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-sm text-violet-300/70 font-medium">
                  Ask me about clients, comparisons, or insights.
                </p>
                <p className="text-xs text-violet-300/40 mt-2">
                  Data access restricted by role
                </p>
              </div>
            )}

            {messages.map((message, index) => {
              // If there's a current error and this is the last user message with no assistant response,
              // and we're in an error state, skip rendering it
              if (error && message.role === "user" && index === messages.length - 1) {
                const hasAssistantResponse = messages.some((m, i) => i > index && m.role === "assistant")
                if (!hasAssistantResponse) {
                  return null // Don't render failed user messages
                }
              }
              
              const text = formatMessageText(getMessageText(message))
              const isLastMessage = index === messages.length - 1
              const isAssistantMessage = message.role === "assistant"
              const showResolveButton = isLastMessage && isAssistantMessage && isAnomalyMode && pendingAnomaly && !resolving

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className={`max-w-[85%] space-y-2`}>
                    <div
                      className={`px-4 py-3 rounded-xl text-sm font-medium ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20"
                          : "bg-slate-800/60 border border-slate-700/50 text-slate-200 backdrop-blur-sm"
                      }`}
                    >
                      {text}
                    </div>
                    
                    {showResolveButton && (
                      <Button
                        size="default"
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold shadow-lg shadow-emerald-500/30"
                        onClick={() => handleResolveAnomaly(pendingAnomaly.desk_id)}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Resolve Anomaly
                      </Button>
                    )}

                    {currentAnomalyId === pendingAnomaly?.desk_id && resolving && (
                      <div className="space-y-2">
                        <div className="w-full bg-slate-700/50 rounded-full overflow-hidden h-3 shadow-lg border border-slate-600/50">
                          <div 
                            className="h-3 transition-all duration-300 rounded-full shadow-md"
                            style={{ 
                              width: `${progress}%`,
                              background: progress < 33 
                                ? 'linear-gradient(90deg, #3b82f6, #06b6d4)' 
                                : progress < 66
                                ? 'linear-gradient(90deg, #06b6d4, #10b981)'
                                : 'linear-gradient(90deg, #10b981, #34d399)',
                            }} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-300 font-medium">Resolving anomaly...</p>
                          <span className="text-xs font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-violet-950/30 border border-violet-700/30 px-4 py-2 rounded-lg flex gap-1">
                  <span className="animate-bounce text-violet-400">.</span>
                  <span className="animate-bounce delay-150 text-violet-400">.</span>
                  <span className="animate-bounce delay-300 text-violet-400">.</span>
                </div>
              </div>
            )}

            {comparisonData && <ComparisonChart data={comparisonData} />}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-violet-900/30 bg-gradient-to-t from-slate-950 to-slate-900/50 backdrop-blur-sm">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 bg-slate-800/60 border-slate-700/50 text-white placeholder-slate-500 focus-visible:ring-violet-500 focus-visible:border-violet-500"
              />
              <Button
                type="button"
                size="icon"
                onClick={toggleVoiceDictation}
                className={`transition-all ${
                  isListening 
                    ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/30" 
                    : "bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/30"
                }`}
                title={isListening ? "Stop listening" : "Start voice dictation"}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/30 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
