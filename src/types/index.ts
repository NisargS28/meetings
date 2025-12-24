import { Models } from "appwrite";

export type userType = "Faculty"
  | "Student"

// Define Faculty interface
export interface Faculty {
  facultyId: string;
  nameId: string;
  name: string;
  email: string;
  designation: string;
  specialization?: string;
  imageUrl: string;
  imageId?: string;
  school: string;
  department: string;
  seating?: string;
  freeTimeSlots?: string[];
  phoneNumber?: string;
  preferredMoM: "Online" | "Offline" | "Hybrid";
}

export interface Student {
  studentId: string;
  name: string;
  email: string;
  rollNo: string;
  imageUrl: string;
  imageId: string;
  mentorId?: string; // Add mentorId to link student with faculty mentor
  projectRequestStatus:
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "NoRequest"
  | "Waiting"
  | "TeamPending"
  | "TeammateRejected";
  school: string;
  department: string;
  phoneNumber?: string;
  fcmToken?: string[];
}

// Meeting interfaces
export interface Meeting extends Models.Document{
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string; // in minutes
  meetingUrl: string;
  meetingPassword?: string;
  purpose: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  mentorId: string;
  mentorName: string;
  // invitedStudents: InvitedStudent[]; //NISHU
  invitedStudentIds: string[];
  acceptedStudents: string[];
}

export interface InvitedStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNo: string;
  responseStatus: 'pending' | 'accepted' | 'declined' | string;
  joinedAt?: string;
  declineReason?: string; // Reason for declining the meeting
}

// Mentor-Mentee Assignment interface
export interface MentorMenteeMapping {
  id?: string; // Document ID from Appwrite
  studentName: string;
  assignedMentorName: string;
  studentId: string;
  mentorId: string;
}