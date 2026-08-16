import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { Zap, Target, BookOpen, Flame, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LessonComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    xpEarned = 0,
    accuracy = 0,
    wordsLearned = 0,
    leveledUp = false,
  } = location.state || {};

  const [displayedXp, setDisplayedXp] = useState(0);
  const isPerfect = accuracy === 100;

  // Confetti — faqat "perfect" natijada kattaroq portlash
  useEffect(() => {
    confetti({
      particleCount: isPerfect ? 140 : 80,
      spread: 90,
      origin: { y: 0.3 },
      colors: ["#2563EB", "#10B981", "#F97316"],
    });
  }, [isPerfect]);

  // XP sanog'ini 0 dan xpEarned'gacha animatsiya qilish
  useEffect(() => {
    if (xpEarned === 0) return;
    const duration = 700;
    const stepTime = Math.max(10, duration / xpEarned);
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setDisplayedXp(current);
      if (current >= xpEarned) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [xpEarned]);

  return (
    <div className="flex flex-col items-center text-center max-w-sm mx-auto pt-6">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-5">
        <Star size={36} className="text-white" fill="white" />
      </div>

      <h1 className="text-2xl font-bold text-primary mb-1">
        {isPerfect ? "Perfect Dialog!" : "Ajoyib ish!"}
      </h1>
      <p className="text-neutral text-sm mb-8">
        {isPerfect ? "You crushed that lesson." : "Darsni muvaffaqiyatli yakunladingiz."}
      </p>

      {leveledUp && (
        <div className="tt-pill bg-amber-50 text-amber-600 mb-6">
          🎉 Yangi darajaga o'tdingiz!
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full mb-8">
        <StatCard
          icon={<Zap size={18} className="text-primary" />}
          value={`+${displayedXp}`}
          label="XP EARNED"
          bg="bg-blue-50"
        />
        <StatCard
          icon={<Target size={18} className="text-secondary" />}
          value={`${accuracy}%`}
          label="ACCURACY"
          bg="bg-green-50"
        />
        <StatCard
          icon={<BookOpen size={18} className="text-base-content" />}
          value={wordsLearned}
          label="WORDS LEARNED"
          bg="bg-base-200"
        />
        <StatCard
          icon={<Flame size={18} className="text-accent" />}
          value={user?.streak?.count ?? 0}
          label="DAY STREAK"
          bg="bg-orange-50"
        />
      </div>

      <button onClick={() => navigate("/dashboard")} className="tt-btn-primary">
        Davom etish →
      </button>
      <button
        onClick={() => navigate(-2)}
        className="text-primary text-sm font-semibold mt-4"
      >
        Review Lesson
      </button>
    </div>
  );
}

function StatCard({ icon, value, label, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-4 text-left`}>
      <div className="mb-2">{icon}</div>
      <p className="text-xl font-bold text-base-content">{value}</p>
      <p className="text-[10px] text-neutral font-semibold tracking-wide">
        {label}
      </p>
    </div>
  );
}