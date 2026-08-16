import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import LessonRouter from "./components/LessonRouter";
import LessonComplete from "./pages/LessonComplete";
import Duel from "./pages/Duel";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  // BrowserRouter va AuthProvider main.jsx'da allaqachon o'ralgan —
  // shu yerda faqat Routes/Route'lar beriladi, boshqa Provider qo'shilmaydi.
  return (
    <Routes>
      {/* Ochiq sahifalar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Onboarding — login qilingan, lekin alohida layout'siz */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Himoyalangan ichki sahifalar */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lesson/:lessonId"
        element={
          <ProtectedRoute>
            <LessonRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lesson-complete"
        element={
          <ProtectedRoute>
            <LessonComplete />
          </ProtectedRoute>
        }
      />
      <Route
        path="/duel"
        element={
          <ProtectedRoute>
            <Duel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}