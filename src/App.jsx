import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useLanguage } from './context/LanguageContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import Onboarding from './pages/Onboarding.jsx';
import DialogLesson from './pages/DialogLesson.jsx';
import Duel from './pages/Duel.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Profile from './pages/Profile.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  return (
    <Routes>
      <Route
        path="/"
        element={
          loading ? (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
              {t('loading')}
            </div>
          ) : (
            <Navigate to={user ? '/dashboard' : '/login'} replace />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lesson/:id"
        element={
          <ProtectedRoute>
            <DialogLesson />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
