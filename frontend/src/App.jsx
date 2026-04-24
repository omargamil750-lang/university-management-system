import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TADashboard from "./pages/TADashboard";
import CoursesPage from "./pages/CoursesPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import SubmitAssignmentPage from "./pages/SubmitAssignmentPage";
import GradesPage from "./pages/GradesPage";
import MySubmissionsPage from "./pages/MySubmissionsPage";
import EventsPage from "./pages/EventsPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailsPage from "./pages/RoomDetailsPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ResourcesPage from "./pages/ResourcesPage";
import MaintenanceRequestsPage from "./pages/MaintenanceRequestsPage";
import StaffDirectoryPage from "./pages/StaffDirectoryPage";
import OfficeHoursPage from "./pages/OfficeHoursPage";
import LeaveRequestsPage from "./pages/LeaveRequestsPage";
import PayrollPage from "./pages/PayrollPage";
import MessagesPage from "./pages/MessagesPage";
import ParentPortalPage from "./pages/ParentPortalPage";
import CourseAnnouncementsPage from "./pages/CourseAnnouncementsPage";
import CourseMaterialsPage from "./pages/CourseMaterialsPage";
import QuizzesPage from "./pages/QuizzesPage";
import UniversityAnnouncementsPage from "./pages/UniversityAnnouncementsPage";
import TranscriptPage from "./pages/TranscriptPage";

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "student")   return <Navigate to="/student"   replace />;
  if (user.role === "professor") return <Navigate to="/professor" replace />;
  if (user.role === "admin")     return <Navigate to="/admin"     replace />;
  if (user.role === "ta")        return <Navigate to="/ta"        replace />;
  if (user.role === "parent") return <Navigate to="/parent-portal" replace />;
  return <Navigate to="/" replace />;
}

const PR = (roles, element) => (
  <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>
);

const ALL   = ["student","professor","ta","admin"];
const STAFF = ["professor","ta","admin"];

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route
  path="/parent-portal"
  element={
    <ProtectedRoute allowedRoles={["parent"]}>
      <ParentPortalPage />
    </ProtectedRoute>
  }
/>

        {/* Dashboards */}
        <Route path="/student"   element={PR(["student"],   <StudentDashboard />)} />
        <Route path="/professor" element={PR(["professor"], <ProfessorDashboard />)} />
        <Route path="/admin"     element={PR(["admin"],     <AdminDashboard />)} />
        <Route path="/ta"        element={PR(["ta"],        <TADashboard />)} />

        {/* Courses */}
        <Route path="/courses"                          element={PR(["student","admin"],     <CoursesPage />)} />
        <Route path="/my-courses"                       element={PR(["professor"],           <MyCoursesPage />)} />
        <Route path="/courses/:courseId"                element={PR(ALL,                     <CourseDetailsPage />)} />
        <Route path="/assignments/submit/:assignmentId" element={PR(["student"],             <SubmitAssignmentPage />)} />
        <Route path="/grades"                           element={PR(["student"],             <GradesPage />)} />
        <Route path="/my-submissions"                   element={PR(["student"],             <MySubmissionsPage />)} />
        <Route path="/courses/:courseId/announcements"  element={PR(ALL,                     <CourseAnnouncementsPage />)} />
        <Route path="/courses/:courseId/materials"      element={PR(ALL,                     <CourseMaterialsPage />)} />
        <Route path="/courses/:courseId/quizzes"        element={PR(ALL,                     <QuizzesPage />)} />
        <Route path="/transcript"                       element={PR(["student","admin"],     <TranscriptPage />)} />

        {/* Facilities */}
        <Route path="/rooms"       element={PR(ALL,         <RoomsPage />)} />
        <Route path="/rooms/:id"   element={PR(ALL,         <RoomDetailsPage />)} />
        <Route path="/bookings"    element={PR(ALL,         <MyBookingsPage />)} />
        <Route path="/resources"   element={PR(ALL,         <ResourcesPage />)} />
        <Route path="/maintenance" element={PR(ALL,         <MaintenanceRequestsPage />)} />

        {/* Staff */}
        <Route path="/staff"        element={PR(ALL,         <StaffDirectoryPage />)} />
        <Route path="/office-hours" element={PR(ALL,         <OfficeHoursPage />)} />
        <Route path="/leave"        element={PR(STAFF,       <LeaveRequestsPage />)} />
        <Route path="/payroll"      element={PR(STAFF,       <PayrollPage />)} />

        {/* Community */}
        <Route path="/messages"      element={PR(ALL,        <MessagesPage />)} />
        <Route path="/events"        element={PR(ALL,        <EventsPage />)} />
        <Route path="/announcements" element={PR(ALL,        <UniversityAnnouncementsPage />)} />
        <Route path="/parent-portal" element={PR(ALL,        <ParentPortalPage />)} />
      </Routes>
    </>
  );
}