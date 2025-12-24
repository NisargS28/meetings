"use client";

import { useEffect, useState } from "react";
import { Meeting } from "@/types";
import MeetingsList from "@/components/meetings/MeetingsList";
import MeetingDetails from "@/components/meetings/MeetingDetails";
import CreateMeeting from "@/components/meetings/CreateMeeting";

// Define User type locally
interface User {
  userId: string;
  name: string;
  type: "Student" | "Faculty";
  email?: string;
}

export default function MeetingsClient({
  initialMeetings,
  user,
}: {
  initialMeetings: Meeting[];
  user: User;
}) {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  return (
    <div>
      <h1>Meetings</h1>

      <MeetingsList
        meetings={meetings}
        selectedMeetingId={selectedMeeting?.id}
        onMeetingSelect={setSelectedMeeting}
        onMeetingDeleted={(id) =>
          setMeetings((prev) => prev.filter((m) => m.id !== id))
        }
        isStudent={user.type === "Student"}
      />

      {selectedMeeting && (
        <MeetingDetails
          meeting={selectedMeeting}
          onMeetingUpdated={(updated) =>
            setMeetings((prev) =>
              prev.map((x) => (x.id === updated.id ? updated : x))
            )
          }
        />
      )}
    </div>
  );
}
