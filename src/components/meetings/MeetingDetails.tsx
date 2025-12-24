"use client";

import React, { useState, useEffect } from 'react';
import { Meeting, Student } from '@/types';
import meetingsService from '@/backend-services/meetings';
import {
    FiCalendar,
    FiClock,
    FiUsers,
    FiExternalLink,
    FiMapPin,
    FiEdit3,
    FiTrash2,
    FiMail,
    FiPhone,
    FiBookOpen,
    FiTarget,
    FiPlus,
    FiSearch,
    FiCheck,
    FiX
} from 'react-icons/fi'; interface MeetingDetailsProps {
    meeting: Meeting;
    onMeetingUpdated?: (updatedMeeting: Meeting) => void;
    onMeetingDeleted?: (meetingId: string) => void;
    onEditMeeting?: (meeting: Meeting) => void;
    isStudent: boolean; // NISHU
}

interface MeetingDetailsError extends Error {
    component: 'MeetingDetails';
    action?: string;
}

const MeetingDetails: React.FC<MeetingDetailsProps> = ({
    meeting,
    onMeetingUpdated,
    onMeetingDeleted,
    onEditMeeting,
    isStudent = false
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAddStudents, setShowAddStudents] = useState(false);
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [selectedNewStudents, setSelectedNewStudents] = useState<Student[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Load available students when add students panel is opened
    // useEffect(() => {
    //     if (showAddStudents && availableStudents.length === 0) {
    //         loadAvailableStudents();
    //     }
    // }, [showAddStudents]);

    // const loadAvailableStudents = async (): Promise<void> => {
    //     try {
    //         setIsLoadingStudents(true);
    //         const students = await meetingsService.getAvailableStudents(meeting.mentorId);
    //         // Filter out students who are already invited
    //         const invitedStudentIds = meeting.invitedStudents.map(s => s.studentId);
    //         const filtered = students.filter(s => !invitedStudentIds.includes(s.studentId));
    //         setAvailableStudents(filtered);
    //         console.log('[MeetingDetails] Loaded available students:', filtered.length);
    //     } catch (error) {
    //         const meetingDetailsError: MeetingDetailsError = {
    //             name: 'MeetingDetailsError',
    //             message: `Failed to load students: ${error instanceof Error ? error.message : 'Unknown error'}`,
    //             component: 'MeetingDetails',
    //             action: 'loadAvailableStudents'
    //         };
    //         console.error('[MeetingDetails] loadAvailableStudents Error:', meetingDetailsError);
    //     } finally {
    //         setIsLoadingStudents(false);
    //     }
    // };

    const handleStudentToggle = (student: Student): void => {
        setSelectedNewStudents(prev => {
            const isSelected = prev.find(s => s.studentId === student.studentId);
            if (isSelected) {
                return prev.filter(s => s.studentId !== student.studentId);
            } else {
                return [...prev, student];
            }
        });
    };

    const handleSelectAllStudents = (): void => {
        const filteredStudents = getFilteredStudents();
        const allSelected = filteredStudents.every(student =>
            selectedNewStudents.find(s => s.studentId === student.studentId)
        );

        if (allSelected) {
            // Deselect all filtered students
            setSelectedNewStudents(prev =>
                prev.filter(selected =>
                    !filteredStudents.find(filtered => filtered.studentId === selected.studentId)
                )
            );
        } else {
            // Select all filtered students that aren't already selected
            const newSelections = filteredStudents.filter(student =>
                !selectedNewStudents.find(s => s.studentId === student.studentId)
            );
            setSelectedNewStudents(prev => [...prev, ...newSelections]);
        }
    };

    const getFilteredStudents = (): Student[] => {
        if (!searchTerm.trim()) return availableStudents;

        const term = searchTerm.toLowerCase();
        return availableStudents.filter(student =>
            student.name.toLowerCase().includes(term) ||
            student.rollNo.toLowerCase().includes(term) ||
            student.email.toLowerCase().includes(term)
        );
    };

    const handleAddStudentsToMeeting = async (): Promise<void> => {
        try {
            if (selectedNewStudents.length === 0) return;

            // In a real application, this would make an API call
            // For now, simulate adding students to the meeting
            const updatedMeeting: Meeting = {
                ...meeting,
                invitedStudents: [
                    ...meeting.invitedStudents,
                    ...selectedNewStudents.map(student => ({
                        studentId: student.studentId,
                        studentName: student.name,
                        studentEmail: student.email,
                        rollNo: student.rollNo,
                        responseStatus: 'pending' as const
                    }))
                ]
            };

            onMeetingUpdated?.(updatedMeeting);
            setShowAddStudents(false);
            setSelectedNewStudents([]);
            setSearchTerm('');

            console.log('[MeetingDetails] Added students to meeting:', selectedNewStudents.length);
        } catch (error) {
            const meetingDetailsError: MeetingDetailsError = {
                name: 'MeetingDetailsError',
                message: `Failed to add students: ${error instanceof Error ? error.message : 'Unknown error'}`,
                component: 'MeetingDetails',
                action: 'handleAddStudentsToMeeting'
            };
            console.error('[MeetingDetails] handleAddStudentsToMeeting Error:', meetingDetailsError);
        }
    };

    const handleDeleteMeeting = async (): Promise<void> => {
        try {
            setIsDeleting(true);

            const success = await meetingsService.deleteMeeting(meeting.id);
            if (success) {
                onMeetingDeleted?.(meeting.id);
                console.log('[MeetingDetails] Meeting deleted successfully:', meeting.id);
            } else {
                throw new Error('Failed to delete meeting');
            }
        } catch (error) {
            const meetingDetailsError: MeetingDetailsError = {
                name: 'MeetingDetailsError',
                message: `Failed to delete meeting: ${error instanceof Error ? error.message : 'Unknown error'}`,
                component: 'MeetingDetails',
                action: 'handleDeleteMeeting'
            };
            console.error('[MeetingDetails] handleDeleteMeeting Error:', meetingDetailsError);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateMeetingStatus = async (newStatus: 'scheduled' | 'completed' | 'cancelled'): Promise<void> => {
        try {
            const updatedMeeting = await meetingsService.updateMeetingStatus(meeting.id, newStatus);
            if (updatedMeeting) {
                onMeetingUpdated?.(updatedMeeting);
                console.log('[MeetingDetails] Meeting status updated:', meeting.id, newStatus);
            }
        } catch (error) {
            const meetingDetailsError: MeetingDetailsError = {
                name: 'MeetingDetailsError',
                message: `Failed to update meeting status: ${error instanceof Error ? error.message : 'Unknown error'}`,
                component: 'MeetingDetails',
                action: 'handleUpdateMeetingStatus'
            };
            console.error('[MeetingDetails] handleUpdateMeetingStatus Error:', meetingDetailsError);
        }
    };

    const isUpcoming = (): boolean => {
        const now = new Date();
        const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
        return meetingDate >= now && meeting.status === 'scheduled';
    };

    const getMeetingTimeStatus = (): string => {
        const now = new Date();
        const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
        const diffInMinutes = Math.floor((meetingDate.getTime() - now.getTime()) / (1000 * 60));

        if (diffInMinutes < 0) {
            return 'Meeting has passed';
        } else if (diffInMinutes <= 15) {
            return 'Starting soon';
        } else if (diffInMinutes <= 60) {
            return `Starting in ${diffInMinutes} minutes`;
        } else {
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours <= 24) {
                return `Starting in ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
            } else {
                const diffInDays = Math.floor(diffInHours / 24);
                return `Starting in ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
            }
        }
    };

    try {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 p-6 relative h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {meeting.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {meeting.description}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                        {onEditMeeting && (
                            <button
                                onClick={() => onEditMeeting(meeting)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                title="Edit Meeting"
                            >
                                <FiEdit3 className="w-4 h-4" />
                            </button>
                        )}
                        {/* NISHU */}
                        {!isStudent && (<button
                            onClick={handleDeleteMeeting}
                            disabled={isDeleting}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Meeting"
                        >
                            <FiTrash2 className="w-4 h-4" />
                        </button>)}
                    </div>
                </div>

                {/* Status and Time Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                            {/* getStatusBadgeColor NISHU*/} 
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${(meeting.status)
                                }`}>
                                {meeting.status}
                            </span>
                        </div>
                        {isUpcoming() && (
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                {getMeetingTimeStatus()}
                            </p>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FiTarget className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</span>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                            {meeting.purpose}
                        </span>
                    </div>
                </div>

                {/* Meeting Details */}
                <div className="space-y-4 mb-6">
                    {/* Date and Time */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FiCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className='flex flex-col flex-wrap'>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                Date & Time
                            </h4>
                            {/* formatMeetingDateTime */}
                            <p className="text-gray-600 dark:text-gray-400">
                                {meeting.date}
                            </p>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <FiClock className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                Duration
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                {meeting.duration} minutes
                            </p>
                        </div>
                    </div>

                    {/* Meeting Link */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <FiExternalLink className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                Meeting Link
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300 flex-1 truncate w-full min-w-0">
                                    {meeting.meetingUrl}
                                </code>
                                <button
                                    onClick={() => window.open(meeting.meetingUrl, '_blank')}
                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1 felx-wrap"
                                >
                                    <FiExternalLink className="w-3 h-3" />
                                    Open
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invited Students */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FiUsers className="w-5 h-5 text-gray-500" />
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                Invited Students ({meeting.acceptedStudents.length})
                            </h4>
                        </div>

                        {/* Add Students Button - Removed as per user request */}
                        {false && (
                            <button
                                onClick={() => setShowAddStudents(!showAddStudents)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                            >
                                <FiPlus className="w-4 h-4" />
                                Add Students
                            </button>
                        )}
                    </div>

                    {meeting.acceptedStudents.length > 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Join at Time
                        </div>
                    )}
                    

                    {/* Add Students Panel */}
                    {showAddStudents && (
                        <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Add Students to Meeting
                                </h5>
                                <button
                                    onClick={() => {
                                        setShowAddStudents(false);
                                        setSelectedNewStudents([]);
                                        setSearchTerm('');
                                    }}
                                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Search and Select All */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search students by name, roll number, or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                    />
                                </div>
                                <button
                                    onClick={handleSelectAllStudents}
                                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                                >
                                    {getFilteredStudents().every(student =>
                                        selectedNewStudents.find(s => s.studentId === student.studentId)
                                    ) ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            {/* Selected Students Count */}
                            {selectedNewStudents.length > 0 && (
                                <div className="mb-3 text-sm text-blue-600 dark:text-blue-400">
                                    {selectedNewStudents.length} student{selectedNewStudents.length !== 1 ? 's' : ''} selected
                                </div>
                            )}

                            {/* Available Students List */}
                            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                                {isLoadingStudents ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-sm text-gray-500">Loading students...</p>
                                    </div>
                                ) : getFilteredStudents().length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        {searchTerm ? 'No students found matching your search' : 'No available students to add'}
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        {getFilteredStudents().map((student) => {
                                            const isSelected = selectedNewStudents.find(s => s.studentId === student.studentId);
                                            return (
                                                <div
                                                    key={student.studentId}
                                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                                                        ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                        }`}
                                                    onClick={() => handleStudentToggle(student)}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1">
                                                                <h6 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                    {student.name}
                                                                </h6>
                                                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                    <span className="flex items-center gap-1">
                                                                        <FiBookOpen className="w-3 h-3" />
                                                                        {student.rollNo}
                                                                    </span>
                                                                    <span className="flex items-center gap-1 truncate">
                                                                        <FiMail className="w-3 h-3" />
                                                                        {student.email}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <FiCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        setShowAddStudents(false);
                                        setSelectedNewStudents([]);
                                        setSearchTerm('');
                                    }}
                                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddStudentsToMeeting}
                                    disabled={selectedNewStudents.length === 0}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    Add {selectedNewStudents.length > 0 ? `${selectedNewStudents.length} ` : ''}Student{selectedNewStudents.length !== 1 ? 's' : ''}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Actions */}
                {isUpcoming() && (
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            Quick Actions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleUpdateMeetingStatus('completed')}
                                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                            >
                                Mark as Completed
                            </button>
                            <button
                                onClick={() => handleUpdateMeetingStatus('cancelled')}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                            >
                                Cancel Meeting
                            </button>
                            <button
                                onClick={() => window.open(meeting.meetingUrl, '_blank')}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                            >
                                <FiExternalLink className="w-3 h-3" />
                                Join Meeting
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading overlay for deletion */}
                {isDeleting && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-2xl flex items-center justify-center z-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Deleting meeting...</p>
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        const meetingDetailsError: MeetingDetailsError = {
            name: 'MeetingDetailsError',
            message: `Failed to render MeetingDetails: ${error instanceof Error ? error.message : 'Unknown error'}`,
            component: 'MeetingDetails'
        };
        console.error('[MeetingDetails] Render Error:', meetingDetailsError);

        // Fallback UI
        return (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 font-semibold">
                        Meeting Details Error
                    </p>
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                        Component: MeetingDetails | Check console for details
                    </p>
                </div>
            </div>
        );
    }
};

export default MeetingDetails;
