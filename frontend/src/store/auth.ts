import { create } from "zustand";

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";
export type UserStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  teacherProfileId?: number | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setStatus: (status: UserStatus) => void;
}

const stored = localStorage.getItem("approvalhub_auth");
const initial = stored ? JSON.parse(stored) : { token: null, user: null };

export const useAuthStore = create<AuthState>((set) => ({
  token: initial.token,
  user: initial.user,
  login: (token, user) => {
    localStorage.setItem("approvalhub_auth", JSON.stringify({ token, user }));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("approvalhub_auth");
    set({ token: null, user: null });
  },
  setStatus: (status) =>
    set((state) => {
      if (!state.user) return state;
      const nextUser = { ...state.user, status };
      localStorage.setItem("approvalhub_auth", JSON.stringify({ token: state.token, user: nextUser }));
      return { ...state, user: nextUser };
    })
}));
