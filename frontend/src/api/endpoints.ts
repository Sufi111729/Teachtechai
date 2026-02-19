import { apiClient } from "./axios";

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  teacherProfileId?: number | null;
}

export interface PendingTeacher {
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  teacherCode: string;
  department?: string;
  createdAt: string;
}

export interface PendingStudent {
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rollNo: string;
  className?: string;
  section?: string;
  assignedTeacherCode: string;
  createdAt: string;
}

export interface TeacherPendingStudent {
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rollNo: string;
  className?: string;
  section?: string;
}

export interface TeacherProfile {
  userId: number;
  profileId: number;
  name: string;
  email: string;
  phone: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  teacherCode: string;
  department?: string | null;
  createdAt: string;
  avatarUrl?: string | null;
}

export interface StudentProfile {
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  role: "STUDENT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  rollNo: string;
  className?: string;
  section?: string;
  assignedTeacherCode: string;
  assignedTeacherName: string;
}

export interface TeacherDocumentList {
  id: number;
  title?: string;
  fileName: string;
  createdAt: string;
  chunkCount: number;
}

export interface TeacherDocumentDetail {
  id: number;
  title?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  chunkCount: number;
}

export interface TeacherDocumentAskResponse {
  documentId: number;
  answer: string;
  usedChunks: Array<{ chunkIndex: number; preview: string }>;
}

export interface TeacherAiQuery {
  id: number;
  documentId: number;
  documentTitle?: string | null;
  question: string;
  answer: string;
  createdAt: string;
}

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    apiClient.post<AuthResponse>("/api/auth/login", payload),
  registerTeacher: (payload: {
    name: string;
    email: string;
    password: string;
    teacherCode: string;
    department?: string;
  }) => apiClient.post("/api/auth/register-teacher", payload),
  registerStudent: (payload: {
    name: string;
    email: string;
    password: string;
    rollNo: string;
    teacherCode: string;
  }) => apiClient.post("/api/auth/register-student", payload)
};

export const adminApi = {
  pendingTeachers: () => apiClient.get<PendingTeacher[]>("/api/admin/pending/teachers"),
  pendingStudents: () => apiClient.get<PendingStudent[]>("/api/admin/pending/students"),
  approveTeacher: (userId: number) => apiClient.put(`/api/admin/teachers/${userId}/approve`),
  rejectTeacher: (userId: number) => apiClient.put(`/api/admin/teachers/${userId}/reject`),
  approveStudent: (userId: number) => apiClient.put(`/api/admin/students/${userId}/approve`),
  rejectStudent: (userId: number) => apiClient.put(`/api/admin/students/${userId}/reject`)
};

export const teacherApi = {
  pendingStudents: () => apiClient.get<TeacherPendingStudent[]>("/api/teacher/pending-students"),
  profile: () => apiClient.get<TeacherProfile>("/api/teacher/profile"),
  updateProfile: (payload: { name?: string; phone?: string; department?: string }) =>
    apiClient.put<TeacherProfile>("/api/teacher/profile", payload),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<TeacherProfile>("/api/teacher/profile/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  approveStudent: (userId: number) => apiClient.put(`/api/teacher/students/${userId}/approve`),
  rejectStudent: (userId: number) => apiClient.put(`/api/teacher/students/${userId}/reject`),
  uploadDocument: (payload: FormData) =>
    apiClient.post("/api/teacher/documents/upload", payload, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  listDocuments: () => apiClient.get<TeacherDocumentList[]>("/api/teacher/documents"),
  getDocument: (documentId: number) => apiClient.get<TeacherDocumentDetail>(`/api/teacher/documents/${documentId}`),
  deleteDocument: (documentId: number) => apiClient.delete(`/api/teacher/documents/${documentId}`),
  askDocument: (documentId: number, question: string) =>
    apiClient.post<TeacherDocumentAskResponse>(`/api/teacher/documents/${documentId}/ask`, { question }),
  aiHistory: () => apiClient.get<TeacherAiQuery[]>("/api/teacher/documents/ai/history"),
  createNote: (payload: { title?: string; content: string }) =>
    apiClient.post<TeacherDocumentUploadResponse>("/api/teacher/documents/notes", payload)
};

export const studentApi = {
  me: () => apiClient.get<StudentProfile>("/api/student/me"),
  askTeacherAi: (question: string) =>
    apiClient.post<TeacherDocumentAskResponse>("/api/student/ai/ask", { question })
};
