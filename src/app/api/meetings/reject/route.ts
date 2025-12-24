import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'appwrite';

export async function POST(request: NextRequest) {
    try {
        const { meetingId, studentId, reason } = await request.json();

        if (!meetingId || !studentId) {
            return NextResponse.json(
                { error: 'Missing meetingId or studentId' },
                { status: 400 }
            );
        }

        if (!reason || reason.trim().length === 0) {
            return NextResponse.json(
                { error: 'Rejection reason is required' },
                { status: 400 }
            );
        }

        if (reason.length > 100) {
            return NextResponse.json(
                { error: 'Rejection reason must be 100 characters or less' },
                { status: 400 }
            );
        }

        // Initialize Appwrite client
        const client = new Client()
            .setEndpoint(String(process.env.NEXT_PUBLIC_APPWRITE_URL))
            .setProject(String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID));

        const databases = new Databases(client);
        const dbId = String(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
        const collectionId = String(process.env.NEXT_PUBLIC_APPWRITE_MEETINGS_COLLECTION_ID);

        // Get the current meeting
        const meeting = await databases.getDocument(dbId, collectionId, meetingId);

        // Add student to rejectedStudents array if not already present
        const rejectedStudents = meeting.rejectedStudents || [];
        if (!rejectedStudents.includes(studentId)) {
            rejectedStudents.push(studentId);
        }

        // Parse existing rejection reasons (if any)
        let rejectionReasonsObj: { [key: string]: string } = {};
        if (meeting.rejectionReasons && typeof meeting.rejectionReasons === 'string') {
            try {
                rejectionReasonsObj = JSON.parse(meeting.rejectionReasons);
            } catch (e) {
                console.error('Error parsing existing rejection reasons:', e);
            }
        }

        // Add new rejection reason
        rejectionReasonsObj[studentId] = reason;

        // Convert back to JSON string for storage
        const rejectionReasonsString = JSON.stringify(rejectionReasonsObj);

        console.log('Updating meeting with:', {
            rejectedStudents,
            rejectionReasonsString
        });

        // Update the meeting document
        const updatedMeeting = await databases.updateDocument(
            dbId,
            collectionId,
            meetingId,
            {
                rejectedStudents,
                rejectionReasons: rejectionReasonsString
            }
        );

        return NextResponse.json({
            success: true,
            meeting: updatedMeeting
        });

    } catch (error) {
        console.error('Error rejecting meeting invitation:', error);
        return NextResponse.json(
            { error: 'Failed to reject meeting invitation' },
            { status: 500 }
        );
    }
}
