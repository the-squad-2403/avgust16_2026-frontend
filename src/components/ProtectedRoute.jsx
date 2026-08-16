import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Onboarding tugallanmagan bo'lsa, to'g'ridan-to'g'ri /dashboard yoki boshqa
  // ichki sahifaga o'tishga urinishni to'xtatib, /onboarding'ga qaytaramiz
  if (!user?.onboardingCompleted && window.location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}