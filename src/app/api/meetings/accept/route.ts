import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'appwrite';

export async function POST(request: NextRequest) {
    try {
        const { meetingId, studentId } = await request.json();

        console.log('Accept meeting request:', { meetingId, studentId, studentIdType: typeof studentId });

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
        
        console.log('Current meeting acceptedStudents:', meeting.acceptedStudents);

        // Add student to acceptedStudents array if not already present
        // Ensure we handle null, undefined, or non-array values properly
        let acceptedStudents: string[] = [];
        
        if (Array.isArray(meeting.acceptedStudents)) {
            // Filter out any null, undefined, or empty values that might exist
            acceptedStudents = meeting.acceptedStudents.filter(
                (id: any) => id !== null && id !== undefined && id !== ''
            );
        }
        
        // Only add if student ID is valid and not already in the array
        if (studentId && !acceptedStudents.includes(studentId)) {
            acceptedStudents.push(studentId);
        }

        console.log('Updated acceptedStudents array:', acceptedStudents);

        // Update the meeting document
        const updatedMeeting = await databases.updateDocument(
            dbId,
            collectionId,
            meetingId,
            {
                acceptedStudents: acceptedStudents
            }
        );

        console.log('Meeting updated successfully. New acceptedStudents:', updatedMeeting.acceptedStudents);

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
