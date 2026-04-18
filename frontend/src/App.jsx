import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConditionalLayout } from './components/layout';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  HomePage,
  AdminDashboardPage,
  OrganizerDashboardPage,
  EventsPage,
  EventDetailPage,
  CreateEventPage,
  EditEventPage,
  ProfilePage,
  AnnouncementsPage,
  CreateAnnouncementPage,
  EditAnnouncementPage,
  LeaderboardPage,
  SettingsPage,
  SystemSettingsPage,
  ClubDetailPage,
  CreateClubPage,
  CreateRecruitment,
  ManageRecruitment,
  ManageExam,
  RecruitmentResponses,
  FinalizeSelection,
  RecruitmentDetailPage,
  ExamAttemptPage,
  RegisteredStudents
} from './pages';
import { ProtectedRoute } from './components/auth';
import UIHomePage from './pages/UIHomePage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<UIHomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Public viewing routes (read-only) - Sidebar visible if logged in */}
        <Route path="/events" element={<ConditionalLayout />}>
          <Route index element={<EventsPage />} />
          <Route path=":eventId" element={<EventDetailPage />} />
        </Route>

        <Route path="/announcements" element={<ConditionalLayout />}>
          <Route index element={<AnnouncementsPage />} />
        </Route>

        <Route path="/leaderboard" element={<ConditionalLayout />}>
          <Route index element={<LeaderboardPage />} />
          <Route path=":eventId" element={<LeaderboardPage />} />
        </Route>

        <Route path="/clubs/:id" element={<ConditionalLayout />}>
          <Route index element={<ClubDetailPage />} />
        </Route>

        {/* Protected routes with layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<HomePage />} />
            {/* Add more routes here as you develop the application */}
          </Route>

          {/* Admin Dashboard */}
          <Route path="/admindashboard" element={<Layout />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>

          {/* Organizer Dashboard */}
          <Route path="/organizerdashboard" element={<Layout />}>
            <Route index element={<OrganizerDashboardPage />} />
          </Route>

          {/* Protected Event Routes (create/edit) */}
          <Route path="/events/create" element={<Layout />}>
            <Route index element={<CreateEventPage />} />
          </Route>
          <Route path="/events/:eventId/edit" element={<Layout />}>
            <Route index element={<EditEventPage />} />
          </Route>

          {/* Profile Route */}
          <Route path="/profile" element={<Layout />}>
            <Route index element={<ProfilePage />} />
          </Route>

          {/* Protected Announcement Routes (create/edit) */}
          <Route path="/announcements/create" element={<Layout />}>
            <Route index element={<CreateAnnouncementPage />} />
          </Route>
          <Route path="/announcements/edit/:id" element={<Layout />}>
            <Route index element={<EditAnnouncementPage />} />
          </Route>

          {/* Settings Routes */}
          <Route path="/settings" element={<Layout />}>
            <Route index element={<SettingsPage />} />
          </Route>

          {/* System Settings Routes - Admin Only */}
          <Route path="/system-settings" element={<Layout />}>
            <Route index element={<SystemSettingsPage />} />
          </Route>

          {/* Club Creation Route - Organizers Only */}
          <Route path="/clubs/create" element={<Layout />}>
            <Route index element={<CreateClubPage />} />
          </Route>

          {/* Recruitment Routes */}
          <Route path="/recruitment/manage" element={<Layout />}>
            <Route index element={<ManageRecruitment />} />
          </Route>
          <Route path="/recruitment/create" element={<Layout />}>
            <Route index element={<CreateRecruitment />} />
          </Route>
          <Route path="/recruitment/exam/:id" element={<Layout />}>
            <Route index element={<ManageExam />} />
          </Route>
          <Route path="/recruitment/responses/:id" element={<Layout />}>
            <Route index element={<RecruitmentResponses />} />
          </Route>
          <Route path="/recruitment/registrations/:id" element={<Layout />}>
            <Route index element={<RegisteredStudents />} />
          </Route>
          <Route path="/recruitment/finalize/:id" element={<Layout />}>
            <Route index element={<FinalizeSelection />} />
          </Route>
          <Route path="/recruitment/:id" element={<Layout />}>
            <Route index element={<RecruitmentDetailPage />} />
          </Route>
          <Route path="/recruitment/attempt-exam/:id" element={<Layout />}>
            <Route index element={<ExamAttemptPage />} />
          </Route>

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
