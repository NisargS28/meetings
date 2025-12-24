"use client";

import React, { useState } from "react";
import { Meeting } from "@/types";
import { FiCalendar, FiClock, FiUser, FiCheck, FiX, FiExternalLink } from "react-icons/fi";

interface MeetingNotificationCardProps {
    meeting: Meeting;
    onResponse: (
        meetingId: string,
        response: "accepted" | "declined",
        reason?: string
    ) => void;
}

const MeetingNotificationCard: React.FC<MeetingNotificationCardProps> = ({
    meeting,
    onResponse
}) => {
    const [showDeclineReason, setShowDeclineReason] = useState(false);
    const [declineReason, setDeclineReason] = useState("");
    const [isResponding, setIsResponding] = useState(false);

    const handleAccept = async () => {
        setIsResponding(true);
        try {
            await onResponse(meeting.$id, "accepted");
        } finally {
            setIsResponding(false);
        }
    };

    const handleDecline = async () => {
        const trimmedReason = declineReason.trim();
        
        if (!trimmedReason) {
            alert("Please provide a reason for declining.");
            return;
        }

        if (trimmedReason.length > 100) {
            alert("Reason must be 100 characters or less.");
            return;
        }

        setIsResponding(true);
        try {
            await onResponse(meeting.$id, "declined", trimmedReason);
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
                            from {meeting.mentorName}
                        </span>
                    </div>
                    <h3 className="text-xl font-semibold">
                        {meeting.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {meeting.description}
                    </p>
                </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                    <FiCalendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span>{formatDateTime(meeting.date, meeting.time)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <FiClock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span>{meeting.duration} minutes</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <FiUser className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span>Mentor: {meeting.mentorName}</span>
                </div>
            </div>

            {/* Purpose */}
            {meeting.purpose && (
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Purpose: </span>
                    <span className="text-sm text-purple-700 dark:text-purple-400">{meeting.purpose}</span>
                </div>
            )}

            {/* Meeting Link */}
            {meeting.meetingUrl && (
                <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                        <FiExternalLink className="w-4 h-4" />
                        <span className="font-medium">Meeting Link:</span>
                        <a 
                            href={meeting.meetingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                            {meeting.meetingUrl}
                        </a>
                    </div>
                    {meeting.meetingPassword && (
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                            <span className="font-medium">Password: </span>
                            <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">
                                {meeting.meetingPassword}
                            </code>
                        </div>
                    )}
                </div>
            )}

            {/* Decline Reason */}
            {showDeclineReason && (
                <div className="mb-4 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <label className="block text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                        Please provide a reason for declining (max 100 characters):
                    </label>
                    <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        maxLength={100}
                        placeholder="Enter your reason for declining..."
                        className="w-full p-3 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        rows={3}
                    />
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {declineReason.length}/100 characters
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                {!showDeclineReason ? (
                    <>
                        <button
                            onClick={handleAccept}
                            disabled={isResponding}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            <FiCheck className="w-5 h-5" />
                            {isResponding ? "Accepting..." : "Accept Invitation"}
                        </button>

                        <button
                            onClick={() => setShowDeclineReason(true)}
                            disabled={isResponding}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            <FiX className="w-5 h-5" />
                            Decline Invitation
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleDecline}
                            disabled={isResponding || !declineReason.trim()}
                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            {isResponding ? "Submitting..." : "Confirm Decline"}
                        </button>

                        <button
                            onClick={() => {
                                setShowDeclineReason(false);
                                setDeclineReason("");
                            }}
                            disabled={isResponding}
                            className="flex-1 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>

            {/* Timestamp */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Invitation created: {new Date(meeting.$createdAt || meeting.date).toLocaleString()}
            </p>
        </div>
    );
};

export default MeetingNotificationCard;
