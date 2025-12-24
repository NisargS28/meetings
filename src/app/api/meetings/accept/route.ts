import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'appwrite';

export async function POST(request: NextRequest) {
    try {
        const { meetingId, studentId } = await request.json();

        if (!meetingId || !studentId) {
            return NextResponse.json(
                { error: 'Missing meetingId or studentId' },
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

        // Add student to acceptedStudents array if not already present
        const acceptedStudents = meeting.acceptedStudents || [];
        if (!acceptedStudents.includes(studentId)) {
            acceptedStudents.push(studentId);
        }

        // Update the meeting document
        const updatedMeeting = await databases.updateDocument(
            dbId,
            collectionId,
            meetingId,
            {
                acceptedStudents
            }
        );

        return NextResponse.json({
            success: true,
            meeting: updatedMeeting
        });

    } catch (error) {
        console.error('Error accepting meeting invitation:', error);
        return NextResponse.json(
            { error: 'Failed to accept meeting invitation' },
            { status: 500 }
        );
    }
}
