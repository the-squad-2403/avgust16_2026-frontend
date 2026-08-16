import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Ilova ochilganda tokenni tekshirib, real user ma'lumotini yangilash.
  // Token bo'lmasa — login/register skip qilinib, shu brauzer uchun mehmon
  // hisobi avtomatik yaratiladi/kirtiladi.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      bootstrapGuest().finally(() => setLoading(false));
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
        return bootstrapGuest();
      })
      .finally(() => setLoading(false));
  }, []);

  function getOrCreateGuestCredentials() {
    const stored = localStorage.getItem("guestCredentials");
    if (stored) return JSON.parse(stored);
    const id = crypto.randomUUID();
    const creds = { name: "Mehmon", email: `guest-${id}@tripletalk.local`, password: id };
    localStorage.setItem("guestCredentials", JSON.stringify(creds));
    return creds;
  }

  async function bootstrapGuest() {
    const creds = getOrCreateGuestCredentials();
    try {
      await login({ email: creds.email, password: creds.password });
    } catch {
      try {
        await register(creds);
      } catch (err) {
        console.error("Mehmon hisobini yaratib bo'lmadi:", err);
      }
    }
  }

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
    localStorage.removeItem("guestCredentials");
    setUser(null);
    window.location.href = "/";
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