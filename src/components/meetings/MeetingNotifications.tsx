"use client";

import React, { useEffect, useState } from "react";
import { MeetingNotification } from "@/types";
import MeetingNotificationCard from "./MeetingNotificationsCard";

interface MeetingNotificationsProps {
    userId: string;
    onNotificationUpdate: () => void;
}

const MeetingNotifications: React.FC<MeetingNotificationsProps> = ({
    userId,
    onNotificationUpdate,
}) => {
    const [notifications, setNotifications] = useState<MeetingNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/appwrite', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'getDocuments',
                        collection: process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
                        queries: [
                            { field: 'studentId', operator: 'equal', value: userId }
                        ]
                    }),
                });
                
                const { documents } = await response.json();
                setNotifications(documents || []);
            } catch (error) {
                console.error("Failed to load notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [userId]);

    const handleResponse = async (
        notificationId: string,
        response: "accepted" | "declined",
        reason?: string
    ) => {
        try {
            await fetch('/api/appwrite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateDocument',
                    collection: process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
                    documentId: notificationId,
                    data: { 
                        status: response,
                        ...(reason && { declineReason: reason })
                    }
                }),
            });

            setNotifications((prev) =>
                prev.filter((n) => n.id !== notificationId)
            );

            onNotificationUpdate();
        } catch (error) {
            console.error("Failed to update notification", error);
        }
    };

    if (loading) {
        return <p className="text-gray-500">Loading invitations...</p>;
    }

    if (notifications.length === 0) {
        return <p className="text-gray-500">No meeting invitations found.</p>;
    }

    return (
        <div className="space-y-4">
            {notifications.map((notification) => (
                <MeetingNotificationCard
                    key={notification.id}
                    notification={notification}
                    onResponse={handleResponse}
                />
            ))}
        </div>
    );
};

export default MeetingNotifications;