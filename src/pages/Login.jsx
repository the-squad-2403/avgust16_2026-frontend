import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      if (!user.onboardingCompleted) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Email yoki parol noto'g'ri. Qayta urinib ko'ring."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className="text-2xl font-bold text-primary">TripleTalk</span>
        </div>

        <div className="tt-card">
          <h1 className="text-xl font-bold text-base-content mb-1">
            Xush kelibsiz!
          </h1>
          <p className="text-sm text-neutral mb-6">
            Davom etish uchun hisobingizga kiring
          </p>

          {error && (
            <div className="mb-4 text-sm text-error bg-red-50 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-neutral mb-1 block">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="siz@example.com"
                className="w-full bg-base-100 border border-base-300 rounded-2xl px-4 py-3
                           focus:outline-none focus:border-primary transition text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral mb-1 block">
                Parol
              </label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-base-100 border border-base-300 rounded-2xl px-4 py-3
                           focus:outline-none focus:border-primary transition text-sm"
              />
            </div>

            <button type="submit" disabled={loading} className="tt-btn-primary mt-2">
              {loading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral mt-6">
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" className="text-primary font-semibold">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </div>
    </div>
  );
}