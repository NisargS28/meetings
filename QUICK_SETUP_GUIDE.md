# Quick Setup Guide - Meeting Invitation System

## Database Changes Required

In your Appwrite database, update the **Meetings** collection:

### Add These Attributes:

1. **rejectedStudents**
   - Type: String (Array)
   - Size: 255
   - Required: No
   - Array: Yes

2. **rejectionReasons**
   - Type: String
   - Size: 2000
   - Required: No
   - Array: No
   - Note: Stores JSON object like `{"studentId": "reason"}`

### Verify These Existing Attributes:

✅ `invitedStudentIds[]` - array of student IDs (invited)
✅ `acceptedStudents[]` - array of student IDs (accepted)
✅ `title`, `description`, `date`, `time`, `duration`, `meetingUrl`
✅ `status` enum: `['scheduled', 'ongoing', 'completed', 'cancelled']`
✅ `mentorId`, `mentorName`, `purpose`

## How It Works (Quick Summary)

1. **Faculty creates meeting** → Selects students → Students added to `invitedStudentIds[]`

2. **Students see invitations** in "Meeting Invitations" tab (shows meetings where they're invited but haven't responded)

3. **Student accepts** → Added to `acceptedStudents[]` → Meeting appears in "My Meetings" tab

4. **Student rejects** → Must give reason (max 100 chars) → Added to `rejectedStudents[]` → Reason saved in `rejectionReasons`

## Testing Steps

### Prepare Test Data in Database

Since you're only implementing the **student invitation side**, manually add a test meeting in your Appwrite database:

1. **Go to Appwrite Console → Database → Meetings Collection → Add Document**

2. **Fill in these fields:**
   ```json
   {
     "title": "Test Meeting - Review Session",
     "description": "Testing invitation system",
     "date": "2025-12-26T00:00:00.000Z",
     "time": "14:00",
     "duration": "30",
     "meetingUrl": "https://meet.google.com/test-123",
     "meetingPassword": "test123",
     "purpose": "General",
     "status": "scheduled",
     "mentorId": "faculty123",
     "mentorName": "Dr. Test Mentor",
     "invitedStudentIds": ["1", "002"],  // Add your test student IDs here
     "acceptedStudents": [],  // Empty initially
     "rejectedStudents": [],  // Empty initially
     "rejectionReasons": ""   // Empty initially
   }
   ```

3. **Important:** Use the actual student ID from your user object (currently "1" in page.tsx)

### Test as Student:

1. **Open the meetings page as student:**
   ```
   - Should default to "Meeting Invitations" tab
   - Should see the test meeting you created in database
   - See full meeting details (title, description, date, time, URL, etc.)
   ```

2. **Test Accept Flow:**
   ```
   - Click "Accept Invitation" button
   - Meeting should disappear from "Meeting Invitations" tab
   - Switch to "My Meetings" tab
   - Meeting should now appear there
   - Check database: Your student ID should be in acceptedStudents[]
   ```

3. **Test Reject Flow (create another test meeting):**
   ```
   - Create another test meeting in database with same student ID
   - Click "Decline Invitation" button
   - Dialog appears asking for reason
   - Enter reason (test character limit - max 100 chars)
   - Click "Confirm Decline"
   - Meeting disappears from "Meeting Invitations" tab
   - Check database:
     * Student ID should be in rejectedStudents[]
     * rejectionReasons should contain: {"1": "your reason"}
   ```

## API Endpoints Available

- `POST /api/meetings/accept` - Accept invitation
- `POST /api/meetings/reject` - Reject invitation with reason

Both endpoints are automatically created and ready to use.

## Files Changed

- ✅ `/src/types/index.ts` - Updated Meeting interface
- ✅ `/src/components/meetings/MeetingNotifications.tsx` - Fetches invitations
- ✅ `/src/components/meetings/MeetingNotificationsCard.tsx` - Accept/Reject UI
- ✅ `/src/app/meetings/page.tsx` - Filters accepted meetings
- ✅ `/src/app/api/meetings/accept/route.ts` - Accept API (NEW)
- ✅ `/src/app/api/meetings/reject/route.ts` - Reject API (NEW)

## Common Issues & Solutions

**Issue:** Students don't see invitations
- Check: Is `invitedStudentIds[]` populated in database?
- Check: Is student ID correct in both places?

**Issue:** Accepted meetings don't show in "My Meetings"
- Check: Is student ID added to `acceptedStudents[]`?
- Check: Is the filter working correctly?

**Issue:** Can't reject with reason
- Check: Is `rejectedStudents[]` attribute created in database?
- Check: Is `rejectionReasons` attribute created (string, size 2000)?

**Issue:** API errors
- Check: Are environment variables set correctly?
- Check: Do you have permissions to update the meetings collection?

## Database Permissions

Ensure your Appwrite meetings collection has these permissions:
- Read: Allow students to read meetings they're invited to
- Update: Allow API routes to update acceptedStudents/rejectedStudents
- Create: Allow faculty to create meetings

## Next Steps

1. Add the two database attributes (`rejectedStudents[]`, `rejectionReasons`)
2. Manually add 2-3 test meetings in Appwrite database with your student ID in `invitedStudentIds[]`
3. Test accept/reject flow as described above
4. Verify database updates after each action
5. Customize UI/styling as needed

## Support

See `MEETING_INVITATION_SYSTEM.md` for detailed documentation.
