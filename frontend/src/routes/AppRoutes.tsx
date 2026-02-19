import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoginPage } from "../pages/LoginPage";
import { RegisterTeacherPage } from "../pages/RegisterTeacherPage";
import { RegisterStudentPage } from "../pages/RegisterStudentPage";
import { PendingApprovalPage } from "../pages/PendingApprovalPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoadingState } from "../components/LoadingState";

const Dashboard = lazy(() => import("../pages/admin/Dashboard").then((m) => ({ default: m.Dashboard })));
const Approvals = lazy(() => import("../pages/admin/Approvals").then((m) => ({ default: m.Approvals })));
const Users = lazy(() => import("../pages/admin/Users").then((m) => ({ default: m.Users })));
const Documents = lazy(() => import("../pages/admin/Documents").then((m) => ({ default: m.Documents })));
const AiAnalytics = lazy(() => import("../pages/admin/AiAnalytics").then((m) => ({ default: m.AiAnalytics })));
const ActivityLogs = lazy(() => import("../pages/admin/ActivityLogs").then((m) => ({ default: m.ActivityLogs })));
const Settings = lazy(() => import("../pages/admin/Settings").then((m) => ({ default: m.Settings })));
const Reports = lazy(() => import("../pages/admin/Reports").then((m) => ({ default: m.Reports })));
const TeacherDashboard = lazy(() => import("../pages/teacher/TeacherDashboard").then((m) => ({ default: m.TeacherDashboard })));
const StudentDashboard = lazy(() => import("../pages/student/StudentDashboard").then((m) => ({ default: m.StudentDashboard })));

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-teacher" element={<RegisterTeacherPage />} />
        <Route path="/register-student" element={<RegisterStudentPage />} />
        <Route path="/pending" element={<PendingApprovalPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Suspense fallback={<LoadingState />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Suspense fallback={<LoadingState />}>
                <Approvals />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Suspense fallback={<LoadingState />}>
                <Users />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Suspense fallback={<LoadingState />}>
                <Documents />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ai-analytics"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Suspense fallback={<LoadingState />}>
                <AiAnalytics />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Suspense fallback={<LoadingState />}>
                <ActivityLogs />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Suspense fallback={<LoadingState />}>
                <Reports />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Suspense fallback={<LoadingState />}>
                <Settings />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <Suspense fallback={<LoadingState />}>
                <TeacherDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <Suspense fallback={<LoadingState />}>
                <StudentDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
