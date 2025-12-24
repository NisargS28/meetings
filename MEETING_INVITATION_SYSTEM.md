# Meeting Invitation System - Implementation Guide

## Overview
This document describes the meeting invitation system where faculty can create meetings and invite students. Students receive invitations, can accept or reject them, and only accepted meetings appear in their "My Meetings" tab.

## Database Schema Changes Required

### Meetings Collection

Your current database structure is mostly correct, but you need to make the following adjustments:

#### Required Fields (Already in your schema ✅):
- `$id` - string (Appwrite auto-generated)
- `title` - required, Size: 255, string
- `description` - required, Size: 255, string
- `time` - required, Size: 255, string
- `duration` - required, Size: 255, string
- `meetingUrl` - required, Size: 255, string
- `meetingPassword` - Size: 255, string, NULL
- `purpose` - required, Size: 255, string
- `status` - required, Enum: `['scheduled', 'ongoing', 'completed', 'cancelled']`
- `mentorId` - required, Size: 255, string
- `mentorName` - required, Size: 255, string
- `invitedStudentIds[]` - Size: 255, string, NULL (array of student IDs)
- `acceptedStudents[]` - Size: 255, string, NULL (array of student IDs who accepted)
- `date` - datetime, NULL
- `$createdAt` - datetime (Appwrite auto-generated)
- `$updatedAt` - datetime (Appwrite auto-generated)

#### Additional Fields Required (Add these to your database):

1. **`rejectedStudents[]`** - array, string, Size: 255, NULL
   - Array of student IDs who rejected the invitation
   - This allows tracking which students explicitly declined

2. **`rejectionReasons`** - string, Size: 2000, NULL (JSON string)
   - Stores a JSON object mapping student IDs to their rejection reasons
   - Format: `{"studentId1": "reason1", "studentId2": "reason2"}`
   - Each reason is max 100 characters
   - Size 2000 allows for approximately 20 students with reasons

#### Fields You Can Remove (if not needed):
- `invitedStudents[]` - This is redundant if you're using `invitedStudentIds[]`
- `id` - Use `$id` instead (Appwrite's built-in ID field)

### Summary of Database Changes Needed:

```
ADD ATTRIBUTE:
- rejectedStudents (array of strings, size: 255, nullable)
- rejectionReasons (string, size: 2000, nullable) - stores JSON

OPTIONAL REMOVE (if not used elsewhere):
- invitedStudents (if redundant)
- id (if using $id)
```

## How It Works

### 1. Faculty Creates Meeting with Student Selection
- Faculty selects students from their mentee list
- When meeting is created, `invitedStudentIds[]` is populated with selected student IDs
- The `acceptedStudents[]` and `rejectedStudents[]` arrays start empty

### 2. Students See Invitations
- In the "Meeting Invitations" tab, students see meetings where:
  - Their ID is in `invitedStudentIds[]` 
  - AND their ID is NOT in `acceptedStudents[]`
  - AND their ID is NOT in `rejectedStudents[]`

### 3. Student Accepts Invitation
- API endpoint: `/api/meetings/accept`
- Student's ID is added to `acceptedStudents[]`
- Meeting now appears in student's "My Meetings" tab
- Invitation disappears from "Meeting Invitations" tab

### 4. Student Rejects Invitation
- API endpoint: `/api/meetings/reject`
- Dialog box opens requiring a rejection reason (max 100 characters)
- Student's ID is added to `rejectedStudents[]`
- Rejection reason is stored in `rejectionReasons` object
- Invitation disappears from "Meeting Invitations" tab
- Faculty can view rejection reasons in meeting details

### 5. My Meetings Tab (Students)
- Only shows meetings where the student's ID is in `acceptedStudents[]`
- Filters out pending invitations and rejected meetings

## API Endpoints Created

### POST `/api/meetings/accept`
Accepts a meeting invitation for a student.

**Request Body:**
```json
{
  "meetingId": "meeting_id_here",
  "studentId": "student_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "meeting": { /* updated meeting object */ }
}
```

### POST `/api/meetings/reject`
Rejects a meeting invitation with a reason.

**Request Body:**
```json
{
  "meetingId": "meeting_id_here",
  "studentId": "student_id_here",
  "reason": "Reason for rejection (max 100 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "meeting": { /* updated meeting object */ }
}
```

## Files Modified

1. **`/src/types/index.ts`**
   - Added `rejectedStudents` and `rejectionReasons` to `Meeting` interface
   - Added `MeetingNotification` interface (for future use)
   - Made `invitedStudents` optional

2. **`/src/components/meetings/MeetingNotifications.tsx`**
   - Changed to fetch meetings from meetings collection
   - Filters to show only pending invitations
   - Calls new accept/reject API endpoints

3. **`/src/components/meetings/MeetingNotificationsCard.tsx`**
   - Updated to work with `Meeting` objects instead of separate notifications
   - Added 100-character limit validation for rejection reason
   - Improved UI with character counter
   - Better dark mode support

4. **`/src/app/meetings/page.tsx`**
   - Updated student meeting filter to only show accepted meetings
   - Maintains separate views for invitations vs accepted meetings

5. **`/src/app/api/meetings/accept/route.ts`** (NEW)
   - Handles accepting meeting invitations
   - Adds student to `acceptedStudents[]`

6. **`/src/app/api/meetings/reject/route.ts`** (NEW)
   - Handles rejecting meeting invitations
   - Validates rejection reason (required, max 100 chars)
   - Adds student to `rejectedStudents[]`
   - Stores reason in `rejectionReasons`

## User Flow

### Faculty Perspective:
1. Click "Create Meeting" button
2. Fill in meeting details (title, description, date, time, duration, URL, etc.)
3. Select students from the list of mentees
4. Click "Create Meeting"
5. Meeting is created with selected students in `invitedStudentIds[]`
6. Faculty can see all meetings in their list
7. Can view rejection reasons in meeting details (if students rejected)

### Student Perspective:
1. Open meetings page (defaults to "Meeting Invitations" tab)
2. See list of pending invitations with full meeting details
3. For each invitation, can:
   - **Accept**: Meeting moves to "My Meetings" tab
   - **Decline**: Must provide reason (max 100 chars), then invitation disappears
4. Switch to "My Meetings" tab to see accepted meetings only
5. Can view meeting details, join via URL, etc.

## Testing Checklist

- [ ] Faculty can create meetings and select students
- [ ] Selected students see invitations in "Meeting Invitations" tab
- [ ] Students can accept invitations
- [ ] Accepted meetings appear in "My Meetings" tab
- [ ] Students can reject invitations with reason
- [ ] Rejection reason is validated (required, max 100 chars)
- [ ] Rejected invitations disappear from student's view
- [ ] Faculty can view rejection reasons
- [ ] Invitations don't show already accepted/rejected meetings
- [ ] Dark mode works correctly
- [ ] Character counter works for rejection reason

## Environment Variables Required

Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_APPWRITE_URL=your_appwrite_url
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_MEETINGS_COLLECTION_ID=your_meetings_collection_id
```

## Future Enhancements

1. **Email Notifications**: Send email when invitation is received/responded to
2. **Push Notifications**: Real-time notifications for new invitations
3. **Reminder System**: Remind students of pending invitations
4. **Bulk Actions**: Accept/reject multiple invitations at once
5. **Meeting History**: Track all invitation responses over time
6. **Faculty Dashboard**: Show invitation acceptance rates
7. **Reschedule Requests**: Allow students to request different times
8. **Waitlist**: Allow students to join waitlist if they can't attend

## Notes

- The rejection reason is limited to 100 characters as specified
- The `rejectionReasons` field stores a JSON object, so it's stored as a string in the database
- Students can only see meetings where they've been explicitly invited
- Faculty see all their created meetings regardless of student responses
- The system maintains a clear audit trail of who accepted/rejected invitations
