import { NextRequest, NextResponse } from 'next/server'

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

// In-memory session store (works on Vercel and serverless platforms)
let sessionsStore: SessionsData = { sessions: [] }

async function getSessions(): Promise<SessionsData> {
  return sessionsStore
}

async function saveSessions(data: SessionsData): Promise<void> {
  sessionsStore = data
}

export async function POST(req: NextRequest) {
  try {
    const { action, sessionId, email, role, name } = await req.json()

    const sessionsData = await getSessions()

    if (action === 'create') {
      // Create a new session
      const newSession: Session = {
        sessionId: `session_${Date.now()}`,
        email,
        role,
        name,
        loginTime: new Date().toISOString(),
        lastActivityTime: new Date().toISOString(),
        isActive: true,
      }

      // Remove any existing sessions for this email
      sessionsData.sessions = sessionsData.sessions.filter(s => s.email !== email)
      
      // Add new session
      sessionsData.sessions.push(newSession)
      await saveSessions(sessionsData)

      return NextResponse.json({
        success: true,
        sessionId: newSession.sessionId,
        session: newSession,
      })
    }

    if (action === 'get') {
      // Get a session by ID
      const session = sessionsData.sessions.find(s => s.sessionId === sessionId)
      if (!session) {
        return NextResponse.json(
          { success: false, message: 'Session not found' },
          { status: 404 }
        )
      }

      // Update last activity time
      session.lastActivityTime = new Date().toISOString()
      await saveSessions(sessionsData)

      return NextResponse.json({ success: true, session })
    }

    if (action === 'delete') {
      // Delete a session
      sessionsData.sessions = sessionsData.sessions.filter(s => s.sessionId !== sessionId)
      await saveSessions(sessionsData)

      return NextResponse.json({ success: true, message: 'Session deleted' })
    }

    if (action === 'list') {
      // List all active sessions
      const activeSessions = sessionsData.sessions.filter(s => s.isActive)
      return NextResponse.json({ success: true, sessions: activeSessions })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[SESSION API] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    const sessionsData = await getSessions()

    if (sessionId) {
      const session = sessionsData.sessions.find(s => s.sessionId === sessionId)
      if (!session) {
        return NextResponse.json(
          { success: false, message: 'Session not found' },
          { status: 404 }
        )
      }

      // Update last activity time
      session.lastActivityTime = new Date().toISOString()
      await saveSessions(sessionsData)

      return NextResponse.json({ success: true, session })
    }

    // List all active sessions
    const activeSessions = sessionsData.sessions.filter(s => s.isActive)
    return NextResponse.json({ success: true, sessions: activeSessions })
  } catch (error) {
    console.error('[SESSION API] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
