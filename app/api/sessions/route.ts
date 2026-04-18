import { NextRequest, NextResponse } from 'next/server'
import { getSessions, saveSessions, createSession, deleteSession, findSessionById } from '@/lib/session-store'

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

export async function POST(req: NextRequest) {
  try {
    const { action, sessionId, email, role, name } = await req.json()

    if (action === 'create') {
      const newSession = createSession({ email, role, name, isActive: true })

      return NextResponse.json({
        success: true,
        sessionId: newSession.sessionId,
        session: newSession,
      })
    }

    if (action === 'get') {
      const session = findSessionById(sessionId)
      if (!session) {
        return NextResponse.json(
          { success: false, message: 'Session not found' },
          { status: 404 }
        )
      }

      // Update last activity time
      const sessionsData = getSessions()
      const sessionIndex = sessionsData.sessions.findIndex(s => s.sessionId === sessionId)
      if (sessionIndex !== -1) {
        sessionsData.sessions[sessionIndex].lastActivityTime = new Date().toISOString()
        saveSessions(sessionsData)
      }

      return NextResponse.json({ success: true, session })
    }

    if (action === 'delete') {
      deleteSession(sessionId)
      return NextResponse.json({ success: true, message: 'Session deleted' })
    }

    if (action === 'list') {
      const sessionsData = getSessions()
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
