import { Student } from "@/types";

class StudentServices {

  async getStudentById(studentId: string): Promise<Student> {
    return {} as Student;
  }

  async getStudentsByMentorId(mentorId: string) {
    return [] as Student[];
  }
}

const studentServices = new StudentServices();
export default studentServices;