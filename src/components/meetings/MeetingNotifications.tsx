"use client";

import React, { useEffect, useState } from "react";
import { Meeting } from "@/types";
import MeetingNotificationCard from "./MeetingNotificationsCard";

interface MeetingNotificationsProps {
    userId: string;
    onNotificationUpdate: () => void;
}

const MeetingNotifications: React.FC<MeetingNotificationsProps> = ({
    userId,
    onNotificationUpdate,
}) => {
    const [notifications, setNotifications] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Fetch meetings using the invitations endpoint
                const response = await fetch(`/api/meetings/invitations?studentId=${userId}`);
                
                if (!response.ok) {
                    console.error('Failed to fetch invitations:', response.status, response.statusText);
                    throw new Error('Failed to fetch meetings');
                }
                
                const { documents } = await response.json();
                const allMeetings: Meeting[] = documents || [];
                
                console.log('Fetched meetings for student', userId, ':', allMeetings.length);
                
                // Filter meetings where student is invited but hasn't accepted yet
                const pendingInvitations = allMeetings.filter(meeting => {
                    const isInvited = meeting.invitedStudentIds?.includes(userId);
                    const hasAccepted = meeting.acceptedStudents?.includes(userId);
                    const hasRejected = meeting.rejectedStudents?.includes(userId);
                    
                    console.log(`Meeting ${meeting.id}: invited=${isInvited}, accepted=${hasAccepted}, rejected=${hasRejected}`);
                    
                    // Show only pending invitations (invited but not accepted or rejected)
                    return isInvited && !hasAccepted && !hasRejected;
                });
                
                console.log('Pending invitations:', pendingInvitations.length);
                setNotifications(pendingInvitations);
            } catch (error) {
                console.error("Failed to load notifications", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    const handleResponse = async (
        meetingId: string,
        response: "accepted" | "declined",
        reason?: string
    ) => {
        try {
            console.log(`Sending ${response} request for meeting ID: ${meetingId}`);
            
            const endpoint = response === "accepted" 
                ? `/api/meetings/accept`
                : `/api/meetings/reject`;
            
            const result = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    meetingId,
                    studentId: userId,
                    ...(reason && { reason })
                }),
            });

            if (!result.ok) {
                const errorData = await result.json();
                console.error('Error response:', errorData);
                throw new Error(`Failed to ${response} invitation`);
            }

            console.log(`Successfully ${response} meeting ${meetingId}`);

            // Remove the notification from the list
            setNotifications((prev) =>
                prev.filter((n) => n.$id !== meetingId)
            );

            // Notify parent to refresh meetings
            onNotificationUpdate();
        } catch (error) {
            console.error("Failed to update notification", error);
            alert(`Failed to ${response} invitation. Please try again.`);
        }
    };

    if (loading) {
        return <p className="text-gray-500">Loading invitations...</p>;
    }

    if (notifications.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 text-center">
                <p className="text-gray-500">No pending meeting invitations.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {notifications.map((meeting) => (
                <MeetingNotificationCard
                    key={meeting.$id}
                    meeting={meeting}
                    onResponse={handleResponse}
                />
            ))}
        </div>
    );
};

export default MeetingNotifications;