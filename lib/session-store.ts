// Shared in-memory session store for all API routes
// This works on Vercel and other serverless platforms

interface Session {
  sessionId: string
  email: string
  role: string
  name: string
  loginTime: string
  lastActivityTime: string
  isActive: boolean
}

interface SessionsData {
  sessions: Session[]
}

// In-memory store
let sessionsStore: SessionsData = { sessions: [] }

export function getSessions(): SessionsData {
  return sessionsStore
}

export function saveSessions(data: SessionsData): void {
  sessionsStore = data
}

export function findSessionById(sessionId: string): Session | undefined {
  return sessionsStore.sessions.find(s => s.sessionId === sessionId)
}

export function createSession(sessionData: Omit<Session, 'sessionId' | 'loginTime' | 'lastActivityTime'>): Session {
  const newSession: Session = {
    sessionId: `session_${Date.now()}`,
    ...sessionData,
    loginTime: new Date().toISOString(),
    lastActivityTime: new Date().toISOString(),
  }
  
  // Remove any existing sessions for this email
  sessionsStore.sessions = sessionsStore.sessions.filter(s => s.email !== sessionData.email)
  
  // Add new session
  sessionsStore.sessions.push(newSession)
  
  return newSession
}

export function deleteSession(sessionId: string): void {
  sessionsStore.sessions = sessionsStore.sessions.filter(s => s.sessionId !== sessionId)
}
