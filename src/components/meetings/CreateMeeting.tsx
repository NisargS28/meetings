/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Meeting, Student } from "@/types";
import meetingsService from "@/backend-services/meetings";
import {
    FiCalendar,
    FiClock,
    FiUsers,
    FiExternalLink,
    FiPlus,
    FiX,
    FiCheck,
    FiLoader,
    FiSave,
} from "react-icons/fi";
import studentServices from "@/backend-services/student";

interface CreateMeetingProps {
    mentorId: string;
    mentorName: string;
    onMeetingCreated: (meeting: any) => void;
    onCancel: () => void;
    isStudent?: boolean;
}

interface CreateMeetingError extends Error {
    component: "CreateMeeting";
    action?: string;
}

const CreateMeeting: React.FC<CreateMeetingProps> = ({
    mentorId,
    mentorName,
    onMeetingCreated,
    onCancel,
    isStudent = false,
}) => {
    const [formData, setFormData] = useState<Meeting>({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: 30,
        purpose: "General",
        meetingUrl: "",
        meetingPassword: "",
        invitedStudentIds: [],
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [showStudentSelector, setShowStudentSelector] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const purposes = ["General", "Project Discussion", "Doubt Clearing", "Other"];

    // --------------------------------------------
    // 🔵 DEFAULT STUDENTS + REAL STUDENTS LOADING
    // --------------------------------------------
    useEffect(() => {
        const defaultStudents: Student[] = [];

        setAvailableStudents(defaultStudents);

        const loadStudents = async () => {
            try {
                setIsLoadingStudents(true);
                const response = await fetch(`/api/students?mentorId=${mentorId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }

                const students = await response.json();
                if (students && students.length > 0) {
                    const formattedStudents = students.map((s: Student) => ({
                        id: s.studentId,
                        name: s.name,
                        email: s.email,
                        rollNo: s.rollNo,
                        // Add any other required fields with default values
                        semester: 1, // Add appropriate default or actual value
                        EndSem: 0,  // Add appropriate default or actual value
                        school: s.school || "Default School",
                        department: s.department || "Default Department",
                        password: "default-password" // In a real app, handle this securely
                    }));
                    setAvailableStudents(students);
                }
            } catch (err) {
                console.error("Error loading students:", err);
            } finally {
                setIsLoadingStudents(false);
            }
        };

        loadStudents();
    }, [mentorId]);

    // --------------------------------------------
    // VALIDATION
    // --------------------------------------------
    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.time) newErrors.time = "Time is required";
        if (!formData.duration) newErrors.duration = "Duration is required";
        if (!formData.meetingUrl) newErrors.meetingUrl = "Meeting URL is required";

        if (!isStudent && selectedStudents.length === 0) {
            newErrors.students = "Please select at least one student";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --------------------------------------------
    // INPUT HANDLERS
    // --------------------------------------------
    const handleInputChange = (field: keyof CreateMeetingData, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev: any) => ({ ...prev, [field]: "" }));
        }
    };

    const handleStudentToggle = (student: Student) => {
        setSelectedStudents((prev) => {
            const exists = prev.find((s) => s.studentId === student.studentId);
            return exists
                ? prev.filter((s) => s.studentId !== student.studentId)
                : [...prev, student];
        });
        if (errors.students) {
            setErrors((prev: any) => ({ ...prev, students: "" }));
        }
    };

    const getFilteredStudents = () => {
        if (!searchTerm.trim()) return availableStudents;

        const term = searchTerm.toLowerCase();
        return availableStudents.filter(
            (student) =>
                student.name.toLowerCase().includes(term) ||
                student.rollNo.toLowerCase().includes(term) ||
                student.email.toLowerCase().includes(term)
        );
    };

    const handleSelectAll = () => {
        const filtered = getFilteredStudents();
        const allSelected = filtered.every((f) =>
            selectedStudents.find((s) => s.studentId === f.studentId)
        );

        if (allSelected) {
            setSelectedStudents((prev) =>
                prev.filter((s) => !filtered.find((f) => f.studentId === s.studentId))
            );
        } else {
            setSelectedStudents((prev) => [
                ...prev,
                ...filtered.filter(
                    (f) => !prev.find((s) => s.studentId === f.studentId)
                ),
            ]);
        }
    };

    // --------------------------------------------
    // SUBMIT MEETING + CREATE APPWRITE NOTIFICATIONS
    // --------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsCreating(true);

            const meetingData: CreateMeetingData = {
                ...formData,
                invitedStudentIds: selectedStudents.map((s) => s.studentId),
            };

            const createdMeeting = await meetingsService.createMeeting(
                meetingData,
                mentorId,
                mentorName
            );

            onMeetingCreated(createdMeeting);
        } catch (err) {
            console.error("[CreateMeeting] Error:", err);
            setErrors({ general: "Failed to create meeting. Try again." });
        } finally {
            setIsCreating(false);
        }
    };

    // --------------------------------------------
    // AUTO-GENERATE MEETING URL
    // --------------------------------------------
    useEffect(() => {
        if (formData.title && !formData.meetingUrl) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-")
                .replace(/-+/g, "-");

            setFormData((prev: any) => ({
                ...prev,
                meetingUrl: `https://meet.google.com/${slug}-${Date.now().toString(
                    36
                )}`,
            }));
        }
    }, [formData.title]);

    // --------------------------------------------
    // UI
    // --------------------------------------------
    return (
        <div className="p-6">
            {errors.general && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{errors.general}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* TITLE */}
                <div>
                    <label className="block text-sm mb-2 font-medium">Meeting Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    />
                    {errors.title && (
                        <p className="text-red-500 text-sm">{errors.title}</p>
                    )}
                </div>

                {/* DESCRIPTION */}
                <div>
                    <label className="block text-sm mb-2 font-medium">Description *</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm">{errors.description}</p>
                    )}
                </div>

                {/* DATE & TIME */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm mb-2 font-medium">Date *</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                        />
                        {errors.date && (
                            <p className="text-red-500 text-sm">{errors.date}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-2 font-medium">Time *</label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => handleInputChange("time", e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                        />
                        {errors.time && (
                            <p className="text-red-500 text-sm">{errors.time}</p>
                        )}
                    </div>
                </div>

                {/* DURATION */}
                <div>
                    <label className="block text-sm mb-2 font-medium">Duration *</label>
                    <select
                        value={formData.duration}
                        onChange={(e) => handleInputChange("duration", Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>1 hour</option>
                    </select>
                    {errors.duration && (
                        <p className="text-red-500 text-sm">{errors.duration}</p>
                    )}
                </div>

                {/* PURPOSE */}
                <div>
                    <label className="block text-sm mb-2 font-medium">Purpose</label>
                    <select
                        value={formData.purpose}
                        onChange={(e) => handleInputChange("purpose", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    >
                        {purposes.map((p) => (
                            <option key={p}>{p}</option>
                        ))}
                    </select>
                </div>

                {/* MEETING URL */}
                <div>
                    <label className="block text-sm mb-2 font-medium">Meeting URL *</label>
                    <input
                        type="url"
                        value={formData.meetingUrl}
                        onChange={(e) =>
                            handleInputChange("meetingUrl", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    />
                    {errors.meetingUrl && (
                        <p className="text-red-500 text-sm">{errors.meetingUrl}</p>
                    )}
                </div>

                {/* MEETING PASSWORD */}
                <div>
                    <label className="block text-sm mb-2 font-medium">
                        Meeting Password (optional)
                    </label>
                    <input
                        type="text"
                        value={formData.meetingPassword || ""}
                        onChange={(e) =>
                            handleInputChange("meetingPassword", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    />
                </div>

                {/* STUDENT SELECTOR */}
                {!isStudent && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium">
                                Invite Students *
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowStudentSelector(!showStudentSelector)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg"
                            >
                                <FiPlus className="inline w-4 h-4 mr-1" />
                                {selectedStudents.length} Selected
                            </button>
                        </div>

                        {errors.students && (
                            <p className="text-red-500 text-sm">{errors.students}</p>
                        )}

                        {showStudentSelector && (
                            <div className="border p-4 rounded-lg space-y-3 dark:border-gray-700">
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                                />

                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="px-3 py-1 border rounded-lg text-sm"
                                >
                                    {getFilteredStudents().every((f) =>
                                        selectedStudents.find(
                                            (s) => s.studentId === f.studentId
                                        )
                                    )
                                        ? "Deselect All"
                                        : "Select All"}
                                </button>

                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {isLoadingStudents ? (
                                        <p>Loading...</p>
                                    ) : (
                                        getFilteredStudents().map((student) => {
                                            const isSelected = selectedStudents.some(
                                                (s) => s.studentId === student.studentId
                                            );
                                            return (
                                                <div
                                                    key={student.studentId}
                                                    onClick={() =>
                                                        handleStudentToggle(student)
                                                    }
                                                    className={`p-2 rounded-lg cursor-pointer ${isSelected
                                                        ? "bg-blue-100"
                                                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        }`}
                                                >
                                                    <div className="font-medium">
                                                        {student.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {student.rollNo} • {student.email}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isCreating}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {isCreating ? (
                            <>
                                <FiLoader className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <FiSave className="w-4 h-4" />
                                Create Meeting
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateMeeting;
