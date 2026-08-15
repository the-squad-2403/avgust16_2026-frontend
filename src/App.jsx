import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useLanguage } from './context/LanguageContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
