# Session & RBAC Security Testing Guide

## Problem Solved

✅ **Session not being passed to API** - Now fixed with:
1. Session ID stored in localStorage during login
2. Chatbot widget reads session ID from localStorage
3. Session ID passed via `X-Session-ID` header
4. API reads session from header and matches to sessions.json
5. User role extracted and RBAC enforced

---

## Quick Start: Demo Credentials

Use these credentials to test immediately:

### **Sales User**
```
Email: pranav@goldmansachs.com
Password: pranav123
```

### **Financial User**
```
Email: abhinav@goldmansachs.com
Password: abhinav123
```

---

## Step-by-Step Testing

### **Test 1: Sales User - Blocked Query**

1. Go to http://localhost:3000
2. Login with:
   - Email: `pranav@goldmansachs.com`
   - Password: `pranav123`
3. You'll be redirected to `/dashboard`
4. Open the **Sales Dashboard** (or navigate to `/dashboard/sales`)
5. Open the **Chatbot** (bottom right)
6. Type: **"How many anomalies are there?"**

**Expected Result**:
```json
{
  "error": "Access Restricted",
  "message": "This information is not available in your dashboard."
}
```

**Console Logs** (Check terminal):
```
[SECURITY] Dashboard: sales
[SECURITY] Session ID found: session_1776450615440
[SECURITY] User role from session: sales
[SECURITY] Query: "How many anomalies..."
[SECURITY] BLOCKED: Sales user querying "anomalies"
[SECURITY] ❌ AUTHORIZATION FAILED - Returning 403
```

---

### **Test 2: Financial User - Allowed Query**

1. Go to http://localhost:3000
2. Login with:
   - Email: `abhinav@goldmansachs.com`
   - Password: `abhinav123`
3. You'll be redirected to `/dashboard/financial`
4. Open the **Chatbot** (bottom right)
5. Type: **"Show me anomalies"**

**Expected Result**:
```
[Streaming response with anomaly data from financial context]

There are X trading desks with anomalies:
- Desk XYZ with variance of $50M
- Root causes: [details]
```

**Console Logs**:
```
[SECURITY] Dashboard: financial
[SECURITY] Session ID found: session_1776453119659
[SECURITY] User role from session: trader
[SECURITY] Query: "Show me anomalies"
[SECURITY] ✅ AUTHORIZATION PASSED
[SECURITY] Context isolated for: financial
[SECURITY] System prompt created with dashboard isolation
[SECURITY] Initiating secure stream...
```

---

### **Test 3: Sales User - Valid Query**

1. Login as Sales user (pranav@goldmansachs.com)
2. Open Chatbot
3. Type: **"What companies are we working with?"**

**Expected Result**:
```
Based on your sales data, here are the companies:
1. Apex Technologies
2. Zenith Energy
3. Bluestone Industries
```

**Console Logs**:
```
[SECURITY] ✅ AUTHORIZATION PASSED
[SECURITY] Context isolated for: sales
[Streams sales-specific data]
```

---

### **Test 4: Financial User - Sales Question (Should Get Prompt Guard)**

1. Login as Financial user (abhinav@goldmansachs.com)
2. Open Chatbot
3. Type: **"Show me the companies"**

**Expected Result**:
```
This information is not available in the current dashboard.
```

**Console Logs**:
```
[SECURITY] ✅ AUTHORIZATION PASSED
[SECURITY] Context isolated for: financial
[SECURITY] System prompt created with dashboard isolation
[Gemini refuses because data not in context]
```

---

## Architecture Flow

```
User Login
   ↓
[Session Created] → session_1776450615440
   ↓
localStorage.setItem('gs_session_id', 'session_1776450615440')
   ↓
User navigates to /dashboard/financial
   ↓
Opens Chatbot
   ↓
[Chatbot Widget]
   ├─ Reads: sessionId = localStorage.getItem('gs_session_id')
   ├─ Reads: dashboard = window.location.pathname
   └─ Sends: X-Session-ID header + dashboard in body
   ↓
[POST /api/chat]
   ├─ Extract sessionId from X-Session-ID header
   ├─ Look up in sessions.json
   ├─ Get role: "Sales" → "sales" | "Financial" → "trader"
   ├─ Check RBAC: authorizeQuery(role, query)
   ├─ If blocked: Return 403
   ├─ If allowed: Load context (sales or financial)
   ├─ Send to Gemini with system prompt
   └─ Stream response
   ↓
Response to Chatbot
```

---

## Session Data Structure

Sessions are stored in `/data/sessions.json`:

```json
{
  "sessions": [
    {
      "sessionId": "session_1776450615440",
      "email": "pranav@goldmansachs.com",
      "role": "Sales",
      "name": "Pranav",
      "loginTime": "2026-04-17T18:30:15.440Z",
      "lastActivityTime": "2026-04-17T18:30:17.200Z",
      "isActive": true
    },
    {
      "sessionId": "session_1776453119659",
      "email": "abhinav@goldmansachs.com",
      "role": "Financial",
      "name": "Abhinav",
      "loginTime": "2026-04-17T19:11:59.659Z",
      "lastActivityTime": "2026-04-17T19:12:03.465Z",
      "isActive": true
    }
  ]
}
```

---

## Key Files Modified

### 1. `/app/page.tsx` (Login Page)
- ✅ Added demo credentials for quick testing
- ✅ Sets session ID in localStorage after login
- ✅ Logs session creation

### 2. `/app/api/chat/route.ts` (Chat API)
- ✅ Imports sessions.json
- ✅ Reads session ID from header (`X-Session-ID`) or cookie
- ✅ Looks up user role from sessions.json
- ✅ Enforces RBAC before context loading
- ✅ Returns 403 for unauthorized queries

### 3. `/components/chatbot/chatbot-widget.tsx` (Chatbot Widget)
- ✅ Custom fetch function in DefaultChatTransport
- ✅ Reads session ID from localStorage
- ✅ Reads dashboard from window.location.pathname
- ✅ Sends session ID via `X-Session-ID` header
- ✅ Sends dashboard in request body

---

## Blocked Keywords (Sales Users)

These keywords trigger 403 responses for sales users:

```
- anomaly
- anomalies
- pnl
- p&l
- trading
- trading desk
- fx
- fx rate
- market data
- variance
- trades
- risk analysis
- how many anomalies
- what anomalies
- desk performance
- desk variance
```

---

## Troubleshooting

### Problem: Still seeing "No session found"

**Solution**:
1. Open browser DevTools → Application tab
2. Check `localStorage.gs_session_id` is set
3. Check console for `[SECURITY]` logs
4. Make sure you logged in (not just browsing)

### Problem: Session ID not passing to API

**Solution**:
1. Check browser DevTools → Network tab
2. Click on `/api/chat` request
3. Go to "Request Headers"
4. Look for `x-session-id` header
5. Make sure it's not empty

### Problem: Getting "Access Restricted" for valid query

**Solution**:
1. Check if query contains any blocked keyword
2. Use exact query from Test 3 above
3. Make sure you're on correct dashboard for your role

---

## Production Deployment Notes

When deploying to Vercel:

1. **Session Storage**: Currently uses in-memory sessions.json
   - For production, integrate with database (MongoDB, PostgreSQL)
   - Update `/api/sessions/route.ts` to read/write from DB

2. **Session Persistence**: 
   - Currently sessions reset on server restart
   - For production, make sessions persistent

3. **API Key Security**:
   - Set `GOOGLE_GENERATIVE_AI_API_KEY` in Vercel environment variables
   - Never commit .env.local to Git

4. **CORS & Headers**:
   - Ensure credentials are included in fetch requests
   - Test with actual domain (not localhost)

---

## Testing Checklist

- [ ] Test 1: Sales user blocked from "anomalies" query (403)
- [ ] Test 2: Financial user can query "anomalies" (200)
- [ ] Test 3: Sales user can ask about companies (200)
- [ ] Test 4: Financial user gets prompt guard for sales query
- [ ] Check localStorage has `gs_session_id` after login
- [ ] Check network tab shows `x-session-id` header
- [ ] Check console shows `[SECURITY]` logs
- [ ] Try different blocked keywords, all blocked (403)
- [ ] Try different dashboards, correct data isolation

---

## Summary

✅ **Security Layers Active**:
1. Session extracted from localStorage & headers
2. User role looked up from sessions.json
3. RBAC hard block for unauthorized queries
4. Context isolation per dashboard
5. Prompt guard as secondary defense

**Result**: Complete access control with 3 layers of protection!
