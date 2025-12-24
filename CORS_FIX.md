# Appwrite CORS Fix - Implementation Summary

## Problem
The frontend running on GitHub Codespaces (`*.app.github.dev`) was making direct Appwrite SDK calls from the browser to `fra.cloud.appwrite.io`, causing CORS errors:
```
TypeError: Failed to fetch
    at Client.call (appwrite/sdk.js:903:16)
    at Databases.listDocuments (appwrite/sdk.js:3050:28)
```

## Solution
Moved all Appwrite operations to server-side Next.js API routes to eliminate CORS issues entirely.

## Changes Made

### 1. Created API Routes (Server-Side)
- **[src/app/api/meetings/today/route.ts](src/app/api/meetings/today/route.ts)** - Fetches today's meetings filtered by student/mentor
- **[src/app/api/meetings/list/route.ts](src/app/api/meetings/list/route.ts)** - Lists all meetings with optional filters

These routes:
- Run server-side (no CORS restrictions)
- Use `APPWRITE_API_KEY` for authentication (server-only env var)
- Accept query parameters: `studentId`, `mentorId`
- Return JSON: `{ documents: Meeting[] }`

### 2. Updated Client Component
**[src/components/meetings/TodayMeeting.tsx](src/components/meetings/TodayMeeting.tsx)**
- Removed direct Appwrite `Client`, `Databases` imports
- Replaced `databases.listDocuments()` with `fetch('/api/meetings/today')`
- Added proper error handling with try/catch

### 3. Environment Variables
**[sample.env.local](sample.env.local)**
- Added `APPWRITE_API_KEY` for server-side authentication
- This key should NEVER be exposed to the client

## Setup Instructions

1. **Copy environment file:**
   ```bash
   cp sample.env.local .env.local
   ```

2. **Configure Appwrite credentials in `.env.local`:**
   ```env
   NEXT_PUBLIC_APPWRITE_URL=https://fra.cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
   NEXT_PUBLIC_APPWRITE_MEETINGS_COLLECTION_ID=your_collection_id
   NEXT_PUBLIC_APPWRITE_STUDENT_COLLECTION_ID=your_student_collection_id
   APPWRITE_API_KEY=your_api_key_here
   ```

3. **Get your Appwrite API Key:**
   - Go to your Appwrite Console
   - Navigate to: Settings → API Keys
   - Create a new API key with appropriate scopes
   - Copy the key to `APPWRITE_API_KEY` in `.env.local`

4. **Restart the dev server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### GET `/api/meetings/today`
Fetches today's meetings.

**Query Parameters:**
- `studentId` (optional) - Filter by student who accepted
- `mentorId` (optional) - Filter by mentor

**Response:**
```json
{
  "documents": [
    {
      "id": "...",
      "title": "...",
      "date": "2025-12-24",
      ...
    }
  ]
}
```

### GET `/api/meetings/list`
Lists all meetings with optional filters.

**Query Parameters:**
- `studentId` (optional) - Filter by accepted student
- `mentorId` (optional) - Filter by mentor

**Response:** Same as above

## Benefits

✅ **No CORS issues** - All Appwrite calls happen server-side  
✅ **Secure API key** - Never exposed to the browser  
✅ **Works on any domain** - Codespaces, localhost, production  
✅ **Better separation** - Backend logic stays on the server  
✅ **Easier debugging** - Check API route logs instead of browser network tab

## Next Steps

Consider applying this pattern to other components making direct Appwrite calls:
- [src/components/meetings/MeetingNotifications.tsx](src/components/meetings/MeetingNotifications.tsx)
- [src/components/meetings/CreateMeeting.tsx](src/components/meetings/CreateMeeting.tsx)
