# Goldman Sachs 360° Customer View System - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **VS Code** - [Download here](https://code.visualstudio.com/)
3. **Git** (optional) - [Download here](https://git-scm.com/)

---

## Step 1: Download and Open the Project

### Option A: Download from v0
1. Click the three dots menu (⋮) in the top right of the v0 interface
2. Select "Download ZIP"
3. Extract the ZIP file to your desired location
4. Open VS Code
5. Go to `File > Open Folder` and select the extracted folder

### Option B: Clone from GitHub (if connected)
```bash
git clone <your-repo-url>
cd <project-folder>
code .
```

---

## Step 2: Install Dependencies

Open the terminal in VS Code (`Ctrl + `` ` `` or `View > Terminal`) and run:

```bash
# Using pnpm (recommended)
pnpm install

# OR using npm
npm install

# OR using yarn
yarn install
```

---

## Step 3: Set Up Environment Variables

### Create the Environment File

1. In the root of your project, create a new file called `.env.local`
2. Add the following content:

```env
# Google Gemini API Key (Required for AI Chatbot)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Optional: For production authentication
# JWT_SECRET=your_random_secret_key_here
# DATABASE_URL=your_database_connection_string
```

### How to Get a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Paste it in your `.env.local` file replacing `your_gemini_api_key_here`

---

## Step 4: Run the Development Server

In the VS Code terminal, run:

```bash
# Using pnpm
pnpm dev

# OR using npm
npm run dev

# OR using yarn
yarn dev
```

The application will start at `http://localhost:3000`

---

## Step 5: Test the Application

### Demo Login Credentials

Use these credentials to log in:

- **Email:** `jagannathanpranav@gmail.com`
- **Password:** `12345`
- **OTP:** `567890`

---

## Setting Up Real Authentication (Production)

The current demo uses JSON files for authentication. For production, you should implement proper authentication:

### Option 1: Supabase Authentication (Recommended)

1. Create a [Supabase](https://supabase.com/) account
2. Create a new project
3. Go to Project Settings > API
4. Add these to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. Create a users table in Supabase:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'analyst',
  created_at TIMESTAMP DEFAULT NOW()
);
```

6. Update `/app/api/auth/login/route.ts` to use Supabase:

```typescript
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const { email, password, otp } = await request.json()
  
  // Fetch user from Supabase
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error || !user) {
    return Response.json({ success: false, message: 'User not found' })
  }
  
  // Verify password with bcrypt
  const isValidPassword = await bcrypt.compare(password, user.password_hash)
  
  if (!isValidPassword) {
    return Response.json({ success: false, message: 'Invalid password' })
  }
  
  // Verify OTP (implement your OTP service here)
  // For production, use services like Twilio, SendGrid, or Supabase Auth
  
  return Response.json({ 
    success: true, 
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  })
}
```

### Option 2: NextAuth.js

1. Install NextAuth:

```bash
pnpm add next-auth
```

2. Create `/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        // Connect to your database and verify credentials
        return null
      }
    })
  ],
  pages: {
    signIn: '/',
  }
})

export { handler as GET, handler as POST }
```

---

## Setting Up Real OTP Verification

### Using Twilio (SMS OTP)

1. Create a [Twilio](https://www.twilio.com/) account
2. Get your Account SID, Auth Token, and a phone number
3. Add to `.env.local`:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

4. Install Twilio:

```bash
pnpm add twilio
```

5. Create `/app/api/auth/send-otp/route.ts`:

```typescript
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request: Request) {
  const { phone } = await request.json()
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Store OTP in database with expiry (5 minutes)
  // await storeOTP(phone, otp, Date.now() + 5 * 60 * 1000)
  
  // Send OTP via SMS
  await client.messages.create({
    body: `Your Goldman Sachs verification code is: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  })
  
  return Response.json({ success: true })
}
```

### Using Email OTP (SendGrid/Resend)

1. Create a [Resend](https://resend.com/) account
2. Add to `.env.local`:

```env
RESEND_API_KEY=your_resend_api_key
```

3. Install Resend:

```bash
pnpm add resend
```

4. Create email OTP endpoint similar to SMS above

---

## Migrating to a Real Database

### Option 1: PostgreSQL with Supabase

Move your JSON data to Supabase tables:

```sql
-- Companies table
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  headquarters TEXT,
  founded INTEGER,
  employees INTEGER,
  revenue TEXT,
  market_cap TEXT,
  relationship_manager TEXT,
  services JSONB
);

-- CRM table
CREATE TABLE crm (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  primary_contact JSONB,
  engagement_score INTEGER,
  last_interaction DATE,
  upcoming_meetings JSONB,
  notes JSONB
);

-- Add similar tables for other data...
```

### Option 2: MongoDB

1. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) account
2. Add connection string to `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/goldmansachs
```

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/login/route.ts    # Authentication endpoint
│   │   ├── chat/route.ts          # AI Chatbot endpoint
│   │   ├── client/[id]/route.ts   # Client data endpoint
│   │   ├── companies/route.ts     # Companies endpoint
│   │   └── search/route.ts        # Search endpoint
│   ├── dashboard/
│   │   ├── client/[id]/page.tsx   # Client detail page
│   │   ├── layout.tsx             # Dashboard layout
│   │   └── page.tsx               # Dashboard home
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Login page
├── components/
│   ├── chatbot/                   # AI Chatbot components
│   ├── client/                    # Client card components
│   ├── dashboard/                 # Dashboard components
│   └── ui/                        # shadcn/ui components
├── data/                          # JSON database files
│   ├── users.json
│   ├── companies.json
│   ├── crm.json
│   ├── asset_management.json
│   ├── investment_banking.json
│   ├── trading.json
│   ├── lead_generation.json
│   ├── risk_analysis.json
│   └── relationship_history.json
└── .env.local                     # Environment variables (create this)
```

---

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules
rm pnpm-lock.yaml  # or package-lock.json
pnpm install
```

### API Key not working
- Ensure `.env.local` is in the root directory (same level as `package.json`)
- Restart the development server after adding environment variables
- Check that there are no spaces around the `=` sign in `.env.local`

### Port 3000 already in use
```bash
# Find and kill the process
npx kill-port 3000

# Or run on a different port
pnpm dev -- -p 3001
```

### Chatbot not responding
- Verify your Google Gemini API key is correct
- Check the browser console for errors
- Ensure you have internet connectivity

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

### Environment Variables for Production

In Vercel dashboard, add:
- `GOOGLE_GENERATIVE_AI_API_KEY`
- Any database connection strings
- Authentication secrets

---

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal for server-side errors
3. Ensure all environment variables are set correctly
4. Verify your API keys are valid and have sufficient quota
