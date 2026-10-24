import { Navigate, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePages";
import RegisterPage from "./pages/RegisterPage";
import BrowsePage from "./pages/BrowsePage";
import BrowseDetailPage from "./pages/BrowseDetailPage";
import ExperienceDetailPage from "./pages/ExperienceDetailPage";
import ExperienceEditorPage from "./pages/ExperienceEditorPage";
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/browse" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
      <Route path="/browse/:entryId" element={<ProtectedRoute><BrowseDetailPage /></ProtectedRoute>} />
      <Route path="/experiences/new" element={<ProtectedRoute><ExperienceEditorPage /></ProtectedRoute>} />
      <Route path="/experiences/:entryId/edit" element={<ProtectedRoute><ExperienceEditorPage /></ProtectedRoute>} />
      <Route path="/experiences/:entryId" element={<ProtectedRoute><ExperienceDetailPage /></ProtectedRoute>} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
