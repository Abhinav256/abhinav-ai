import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const ADMIN_EMAIL = "admin@goldmansachs.com"
const ADMIN_PASSWORD = "goldmansachs_admin"

const USERS_FILE = path.join(process.cwd(), "data", "users.json")

async function readUsers() {
  const raw = await fs.readFile(USERS_FILE, "utf8")
  return JSON.parse(raw)
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Hardcoded admin path
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, isAdmin: true })
    }

    const data = await readUsers()
    const user = (data.users || []).find((u: any) => u.email === email && u.password === password)

    if (user) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      })
    }

    return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}
