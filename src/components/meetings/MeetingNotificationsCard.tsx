"use client";

import React, { useState } from "react";
import { MeetingNotification } from "@/types";
import { FiCalendar, FiClock, FiUser, FiCheck, FiX, FiExternalLink } from "react-icons/fi";

interface MeetingNotificationCardProps {
    notification: MeetingNotification;
    onResponse: (
        notificationId: string,
        response: "accepted" | "declined",
        reason?: string
    ) => void;
}

const MeetingNotificationCard: React.FC<MeetingNotificationCardProps> = ({
    notification,
    onResponse
}) => {
    const [showDeclineReason, setShowDeclineReason] = useState(false);
    const [declineReason, setDeclineReason] = useState("");
    const [isResponding, setIsResponding] = useState(false);

    const handleAccept = async () => {
        setIsResponding(true);
        try {
            await onResponse(notification.id, "accepted");
        } finally {
            setIsResponding(false);
        }
    };

    const handleDecline = async () => {
        if (!declineReason.trim()) {
            alert("Please provide a reason for declining.");
            return;
        }

        setIsResponding(true);
        try {
            await onResponse(notification.id, "declined", declineReason);
            setShowDeclineReason(false);
            setDeclineReason("");
        } finally {
            setIsResponding(false);
        }
    };

    const formatDateTime = (date: string, time: string) => {
        try {
            const meetingDate = new Date(`${date}T${time}`);
            return meetingDate.toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return `${date} at ${time}`;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800 p-6 mb-4">

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Meeting Invitation
                        </span>
                        <span className="text-sm text-gray-500">
                            from {notification.mentorName}
                        </span>
                    </div>
                    <h3 className="text-xl font-semibold">
                        {notification.meetingTitle}
                    </h3>
                    <p className="text-gray-600">
                        {notification.meetingDescription}
                    </p>
                </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                    <FiCalendar className="w-4 h-4" />
                    <span>{formatDateTime(notification.meetingDate, notification.meetingTime)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <FiClock className="w-4 h-4" />
                    <span>{notification.duration} minutes</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <FiUser className="w-4 h-4" />
                    <span>Mentor: {notification.mentorName}</span>
                </div>
            </div>

            {/* Meeting Link */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                    <FiExternalLink className="w-4 h-4" />
                    <span className="font-medium">Meeting Link:</span>
                    <a href={notification.meetingUrl} target="_blank" className="text-blue-600 hover:underline break-all">
                        {notification.meetingUrl}
                    </a>
                </div>
            </div>

            {/* Decline Reason */}
            {showDeclineReason && (
                <div className="mb-4 p-4 border border-red-200 rounded-lg bg-red-50">
                    <label className="block text-sm font-medium text-red-800 mb-2">
                        Please provide a reason:
                    </label>
                    <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        className="w-full p-3 border border-red-300 rounded-lg"
                        rows={3}
                    />
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                {!showDeclineReason ? (
                    <>
                        <button
                            onClick={handleAccept}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg"
                        >
                            Accept
                        </button>

                        <button
                            onClick={() => setShowDeclineReason(true)}
                            className="flex-1 bg-red-600 text-white py-3 rounded-lg"
                        >
                            Decline
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleDecline}
                            className="flex-1 bg-red-600 text-white py-3 rounded-lg"
                        >
                            Confirm Decline
                        </button>

                        <button
                            onClick={() => {
                                setShowDeclineReason(false);
                                setDeclineReason("");
                            }}
                            className="flex-1 border py-3 rounded-lg"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>

            {/* Timestamp */}
            <p className="text-xs text-gray-500 mt-4">
                Invitation received: {new Date(notification.createdAt).toLocaleString()}
            </p>
        </div>
    );
};

export default MeetingNotificationCard;
