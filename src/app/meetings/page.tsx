"use client";


import React, { useEffect, useState } from "react";
import { Meeting } from "@/types";
import meetingsService from "@/backend-services/meetings";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import MeetingsList from "@/components/meetings/MeetingsList";
import MeetingDetails from "@/components/meetings/MeetingDetails";
import CreateMeeting from "@/components/meetings/CreateMeeting";
import Modal from "@/components/ui/Modal";
import { FiPlus, FiCalendar, FiBell } from "react-icons/fi";
import MeetingNotifications from "@/components/meetings/MeetingNotifications";
import TodayMeeting from "@/components/meetings/TodayMeeting";


interface MeetingsPageError extends Error {
    component: "MeetingsPage";
    action?: string;
}

const MeetingsPage: React.FC = () => {
    const user = { type: "Student", userId: "001", name: "Test Student" };
    //const user = { type: "Faculty", userId: "1", name: "Test Faculty" };

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);


    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [showCreateMeeting, setShowCreateMeeting] = useState(false);


    const [refreshTrigger, setRefreshTrigger] = useState(0);


    const isFaculty = user?.type === "Faculty";
    const isStudent = user?.type === "Student";


    const [activeTab, setActiveTab] = useState<"meetings" | "notifications">(
        isStudent ? "notifications" : "meetings"
    );


    // Handle hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);


    // Load meetings
    useEffect(() => {
        const loadMeetings = async () => {
            if (!isHydrated || !user?.userId) {
                setLoading(false);
                return;
            }


            try {
                let data: Meeting[];
                if (isFaculty) {
                    data = await meetingsService.getMeetingsByMentorId(user.userId);
                } else {
                    // For students, get all meetings and filter to only accepted ones
                    const allMeetings = await meetingsService.getMeetingsByStudentId(user.userId);
                    console.log('All meetings fetched for student:', allMeetings.length);
                    console.log('Meetings data:', allMeetings);
                    
                    // Only show meetings where the student has accepted the invitation
                    data = allMeetings.filter(meeting => {
                        const isAccepted = meeting.acceptedStudents?.includes(user.userId);
                        console.log(`Meeting ${meeting.$id}: acceptedStudents:`, meeting.acceptedStudents, 'isAccepted:', isAccepted);
                        return isAccepted;
                    });
                    
                    console.log('Filtered accepted meetings:', data.length);
                }
                setMeetings(data);
            } catch (error) {
                const meetingsPageError: MeetingsPageError = {
                    name: "MeetingsPageError",
                    message: "Failed to load meetings",
                    component: "MeetingsPage",
                    action: "loadMeetings",
                };
                console.error(meetingsPageError);
            } finally {
                setLoading(false);
            }
        };


        loadMeetings();
    }, [isHydrated, user?.userId, isFaculty, refreshTrigger]);


    // Meeting handlers
    const handleMeetingCreated = (newMeeting: Meeting) => {
        setMeetings((prev) => [newMeeting, ...prev]);
        setShowCreateMeeting(false);
        setSelectedMeeting(newMeeting);
        setRefreshTrigger((prev) => prev + 1);
    };


    const handleMeetingDeleted = (meetingId: string) => {
        setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
        if (selectedMeeting?.id === meetingId) setSelectedMeeting(null);
    };


    const handleMeetingUpdated = (updatedMeeting: Meeting) => {
        setMeetings((prev) =>
            prev.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m))
        );
        setSelectedMeeting(updatedMeeting);
    };


    const handleNotificationUpdate = () => {
        setRefreshTrigger((prev) => prev + 1);
    };


    // Prevent hydration mismatch
    if (!isHydrated) {
        return (
            <ErrorBoundary>
                <LoadingSpinner message="Initializing..." size="md" className="py-12" />
            </ErrorBoundary>
        );
    }


    // Unauthorized
    if (!isFaculty && !isStudent) {
        return (
            <ErrorBoundary>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <FiCalendar className="w-16 h-16 text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
                    <p className="text-gray-500">Please log in to access meetings.</p>
                </div>
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-background text-foreground">
                <div className="flex flex-col w-full max-w-7xl mx-auto py-10 px-4 md:px-8">


                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {isFaculty ? "Meetings" : "My Meetings"}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-base mt-1">
                                    {isFaculty
                                        ? "Manage your mentor meetings"
                                        : "View your scheduled meetings and invitations"}
                                </p>
                            </div>


                            {isFaculty && (
                                <button
                                    onClick={() => setShowCreateMeeting(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
                                >
                                    <FiPlus className="w-5 h-5" />
                                    Create Meeting
                                </button>
                            )}
                        </div>


                        {/* Student Tabs */}
                        {isStudent && (
                            <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
                                <nav className="flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab("notifications")}
                                        className={`py-2 px-1 border-b-2 ${activeTab === "notifications"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <FiBell className="w-4 h-4" />
                                            Meeting Invitations
                                        </span>
                                    </button>


                                    <button
                                        onClick={() => setActiveTab("meetings")}
                                        className={`py-2 px-1 border-b-2 ${activeTab === "meetings"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <FiCalendar className="w-4 h-4" />
                                            My Meetings
                                        </span>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </header>


                    {/* Loading */}
                    {loading && (
                        <LoadingSpinner message="Loading meetings..." size="md" className="py-12" />
                    )}


                    {/* Content */}
                    {!loading && (
                        <>
                            {/* Notifications Tab */}
                            {isStudent && activeTab === "notifications" && (
                                <MeetingNotifications
                                    userId={user?.userId || ""}
                                    onNotificationUpdate={handleNotificationUpdate}
                                />
                            )}


                            {/* Meetings Tab NISHU*/} 
                            {(isFaculty || (isStudent && activeTab === "meetings")) && (
                                <>
                                {console.log('Rendering My Meetings tab with', meetings.length, 'meetings')}
                                <div>
                                    <TodayMeeting meetings={meetings}
                                            selectedMeetingId={selectedMeeting?.id}
                                            onMeetingSelect={setSelectedMeeting}
                                            onMeetingDeleted={handleMeetingDeleted}
                                            isStudent={isStudent}/>
                                </div>
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex-1 lg:max-w-md">
                                        <MeetingsList
                                            meetings={meetings}
                                            selectedMeetingId={selectedMeeting?.id}
                                            onMeetingSelect={setSelectedMeeting}
                                            onMeetingDeleted={handleMeetingDeleted}
                                            isStudent={isStudent}
                                        />
                                    </div>
                                    {/* NISHU */}
                                    <div className="flex-1"> 
                                        {selectedMeeting ? (
                                            <MeetingDetails
                                                meeting={selectedMeeting}
                                                onMeetingUpdated={handleMeetingUpdated}
                                                onMeetingDeleted={handleMeetingDeleted}
                                                isStudent={isStudent}
                                            />
                                        ) : (
                                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 text-center">
                                                <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-xl font-semibold">
                                                    Select a Meeting
                                                </h3>
                                                <p className="text-gray-500">
                                                    Choose a meeting to view details
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                            )}
                        </>
                    )}


                    {/* Create Meeting Modal */}
                    {isFaculty && (
                        <Modal
                            isOpen={showCreateMeeting}
                            onClose={() => setShowCreateMeeting(false)}
                            title="Create New Meeting"
                            size="lg"
                        >
                            <CreateMeeting
                                onCancel={() => setShowCreateMeeting(false)}
                                onMeetingCreated={handleMeetingCreated}
                                mentorId={user?.userId || ""}
                                mentorName={user?.name || ""}
                                isStudent={isStudent}
                            />
                        </Modal>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
};


export default MeetingsPage;