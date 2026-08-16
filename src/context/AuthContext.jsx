import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Ilova ochilganda tokenni tekshirib, real user ma'lumotini yangilash
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axiosInstance
      .get("/auth/me")
      .then((res) => {
        const freshUser = res.data.user || res.data;
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function register(payload) {
    // payload: { name, email, password }
    // Backend javobi user maydonlarini "user" ichiga o'ramasdan, token bilan
    // birga tekis (flat) qaytaradi — shuning uchun boshqa joylardagi kabi
    // fallback naqsh ishlatiladi.
    const res = await axiosInstance.post("/auth/register", payload);
    const { token, ...newUser } = res.data.user || res.data;
    localStorage.setItem("token", token || res.data.token);
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }

  async function login(payload) {
    // payload: { email, password }
    const res = await axiosInstance.post("/auth/login", payload);
    const { token, ...loggedInUser } = res.data.user || res.data;
    localStorage.setItem("token", token || res.data.token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function completeOnboarding(payload) {
    // payload: { nativeLanguage, targetLanguage }
    const res = await axiosInstance.post("/auth/onboarding", payload);
    const updatedUser = res.data.user || res.data;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  }

  // Dars tugagach yoki XP/streak o'zgarganda, user obyektini yangilash
  function updateUser(partialUpdate) {
    setUser((prev) => {
      const next = { ...prev, ...partialUpdate };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    completeOnboarding,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}