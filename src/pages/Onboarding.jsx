import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LANGUAGES = [
  { code: "uz", label: "O'zbek" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export default function Onboarding() {
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = native, 2 = target, 3 = level
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const targetOptions = LANGUAGES.filter((l) => l.code !== nativeLanguage);

  const canContinue =
    (step === 1 && nativeLanguage) ||
    (step === 2 && targetLanguage) ||
    (step === 3 && level);

  async function handleContinue() {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Oxirgi qadam — backend'ga yuborish
    setLoading(true);
    setError("");
    try {
      // Eslatma: backend hozircha faqat nativeLanguage/targetLanguage'ni saqlaydi.
      // "level"ni lokal saqlaymiz — agar backend'da alohida maydon qo'shilsa,
      // shu yerga ham qo'shib yuborish kifoya.
      localStorage.setItem("onboardingLevel", level);
      await completeOnboarding({ nativeLanguage, targetLanguage });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    if (step === 1) return;
    setStep(step - 1);
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col px-6 pt-10 pb-8 max-w-sm mx-auto">
      {/* Progress bar — 3 segment */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-base-300"
            }`}
          />
        ))}
      </div>

      {step > 1 && (
        <button
          onClick={handleBack}
          className="text-sm text-neutral mb-4 self-start"
        >
          ← Orqaga
        </button>
      )}

      {/* STEP 1 — Native language */}
      {step === 1 && (
        <>
          <h1 className="text-2xl font-bold text-base-content mb-6">
            Qaysi tilda so'zlashasiz?
          </h1>
          <div className="space-y-3">
            {LANGUAGES.map((lang) => (
              <LanguageCard
                key={lang.code}
                lang={lang}
                selected={nativeLanguage === lang.code}
                onClick={() => setNativeLanguage(lang.code)}
              />
            ))}
          </div>
        </>
      )}

      {/* STEP 2 — Target language */}
      {step === 2 && (
        <>
          <h1 className="text-2xl font-bold text-base-content mb-6">
            Qaysi tilni o'rganmoqchisiz?
          </h1>
          <div className="space-y-3">
            {targetOptions.map((lang) => (
              <LanguageCard
                key={lang.code}
                lang={lang}
                selected={targetLanguage === lang.code}
                onClick={() => setTargetLanguage(lang.code)}
              />
            ))}
          </div>
        </>
      )}

      {/* STEP 3 — Level */}
      {step === 3 && (
        <>
          <h1 className="text-2xl font-bold text-base-content mb-6">
            Darajangiz qanday?
          </h1>
          <div className="space-y-3">
            <LevelCard
              title="Yangi boshlovchiman"
              subtitle="Hech narsa bilmayman, noldan boshlayman"
              selected={level === "beginner"}
              onClick={() => setLevel("beginner")}
            />
            <LevelCard
              title="Bir oz bilaman"
              subtitle="Asosiy so'z va iboralarni bilaman"
              selected={level === "intermediate"}
              onClick={() => setLevel("intermediate")}
            />
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 text-sm text-error bg-red-50 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      <div className="flex-1" />

      <button
        onClick={handleContinue}
        disabled={!canContinue || loading}
        className="tt-btn-primary mt-8"
      >
        {loading ? "Saqlanmoqda..." : step === 3 ? "Boshlash 🚀" : "Davom etish"}
      </button>
    </div>
  );
}

function LanguageCard({ lang, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 bg-base-200 border rounded-2xl px-4 py-4 transition
        ${selected ? "border-primary bg-blue-50/60" : "border-base-300"}`}
    >
      <div className="w-10 h-10 rounded-xl bg-base-300/60 flex items-center justify-center text-xs font-bold text-neutral uppercase">
        {lang.code}
      </div>
      <span className="font-semibold text-base-content">{lang.label}</span>
    </button>
  );
}

function LevelCard({ title, subtitle, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-base-200 border rounded-2xl px-4 py-4 transition
        ${selected ? "border-primary bg-blue-50/60" : "border-base-300"}`}
    >
      <p className="font-semibold text-base-content">{title}</p>
      <p className="text-sm text-neutral mt-0.5">{subtitle}</p>
    </button>
  );
}