import { NextResponse } from "next/server";
import { Client, Databases, Query } from "appwrite";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ documents: [] });
    }

    // Get environment variables
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_URL;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const meetingsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_MEETINGS_COLLECTION_ID;

    // Return empty if configuration is missing
    if (!endpoint || !projectId || !databaseId || !meetingsCollectionId) {
      console.error('Missing Appwrite configuration');
      return NextResponse.json({ documents: [] });
    }

    console.log('Fetching invitations for student:', studentId);

    // Initialize Appwrite client (server-side - avoids CORS)
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId);

    const databases = new Databases(client);

    // Query for meetings where student is in invitedStudentIds
    const queries = [
      Query.contains("invitedStudentIds", studentId)
    ];

    // First, try to get ALL meetings to debug
    const allMeetings = await databases.listDocuments(
      databaseId,
      meetingsCollectionId,
      []
    );

    console.log(`Total meetings in database: ${allMeetings.documents.length}`);
    console.log('All meetings:', JSON.stringify(allMeetings.documents, null, 2));

    // Now query for meetings where student is in invitedStudentIds
    const result = await databases.listDocuments(
      databaseId,
      meetingsCollectionId,
      queries
    );

    console.log(`Found ${result.documents.length} meetings with invitedStudentIds containing "${studentId}"`);
    
    return NextResponse.json({ 
      documents: result.documents || [],
      debug: {
        totalMeetings: allMeetings.documents.length,
        filteredMeetings: result.documents.length,
        searchedStudentId: studentId
      }
    });
  } catch (error) {
    console.error("Error fetching meeting invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting invitations", documents: [] },
      { status: 500 }
    );
  }
}
