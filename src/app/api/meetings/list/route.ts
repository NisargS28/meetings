import { NextResponse } from "next/server";
import { Client, Databases, Query } from "appwrite";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const mentorId = searchParams.get("mentorId");

    // Get environment variables
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_URL;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const meetingsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_MEETINGS_COLLECTION_ID;

    // Return empty if configuration is missing
    if (!endpoint || !projectId || !databaseId || !meetingsCollectionId) {
      return NextResponse.json({ documents: [] });
    }

    // Initialize Appwrite client (server-side - avoids CORS)
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId);

    const databases = new Databases(client);

    // Build queries
    const queries: string[] = [];

    if (studentId) {
      queries.push(Query.contains("acceptedStudents", studentId));
    }

    if (mentorId) {
      queries.push(Query.equal("mentorId", mentorId));
    }

    // Fetch meetings from Appwrite
    const result = await databases.listDocuments(
      databaseId,
      meetingsCollectionId,
      queries
    );
    //console.log("Fetched meetings:", result.documents);
    return NextResponse.json({ documents: result.documents || [] });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings", documents: [] },
      { status: 500 }
    );
  }
}
