import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Headphones,
  Zap,
  BookOpen,
  Lock,
  Check,
  Flame,
  Coins,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

const LANGUAGE_NAMES = { uz: "O'zbek", ru: "Rus", en: "Ingliz" };

const LESSON_ICONS = {
  dialog: MessageCircle,
  listening: Headphones,
  speed_round: Zap,
  vocabulary: BookOpen,
};

// Backend hali tayyor bo'lmasa yoki so'rov muvaffaqiyatsiz bo'lsa ishlatiladigan mock
const MOCK_PATH = [
  { _id: "m1", type: "dialog", title: "Salomlashish", status: "completed" },
  { _id: "m2", type: "listening", title: "Aeroportda", status: "current" },
  { _id: "m3", type: "speed_round", title: "Tezkor mashq", status: "locked" },
  { _id: "m4", type: "vocabulary", title: "Yangi so'zlar", status: "locked" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [path, setPath] = useState(MOCK_PATH);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.targetLanguage) {
      setLoading(false);
      return;
    }
    axiosInstance
      .get(`/lessons/path?targetLanguage=${user.targetLanguage}`)
      .then((res) => {
        const data = res.data.lessons || res.data.path || res.data;
        if (Array.isArray(data) && data.length > 0) setPath(data);
      })
      .catch(() => {
        // mock bilan qolaveradi
      })
      .finally(() => setLoading(false));
  }, [user?.targetLanguage]);

  function handleNodeClick(lesson) {
    if (lesson.status === "locked") return;
    navigate(`/lesson/${lesson._id}`);
  }

  return (
    <DashboardLayout
      rightPanel={
        <>
          <DailyQuestsWidget />
          <MiniLeaderboardWidget />
        </>
      }
    >
      {/* ---- MOBIL: Daily Goal karta ---- */}
      <div className="lg:hidden tt-card flex items-center justify-between mb-6">
        <div className="flex-1">
          <p className="font-semibold text-base-content">Daily Goal: 15 mins</p>
          <p className="text-sm text-neutral mb-2">Keep up the momentum!</p>
          <div className="h-2 bg-base-300 rounded-full overflow-hidden">
            <div className="h-full w-2/5 bg-secondary rounded-full" />
          </div>
        </div>
        <div className="w-11 h-11 rounded-full bg-secondary/15 flex items-center justify-center ml-4 text-xl">
          🐰
        </div>
      </div>

      {/* ---- DESKTOP: Unit banner ---- */}
      <div className="hidden lg:block mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-base-content">
              Learn {LANGUAGE_NAMES[user?.targetLanguage] || "..."}
              <span className="text-primary text-sm font-semibold ml-2 cursor-pointer">
                Switch course ▾
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="tt-pill tt-pill-streak">
              <Flame size={14} strokeWidth={2.5} />
              {user?.streak?.count ?? 0}
            </span>
            <span className="tt-pill tt-pill-coin">
              <Coins size={14} strokeWidth={2.5} />
              {user?.xp ?? 0}
            </span>
          </div>
        </div>

        <div className="bg-secondary rounded-3xl px-6 py-5 text-white flex items-center justify-between">
          <div>
            <p className="font-bold text-lg">Unit 3</p>
            <p className="text-sm text-white/85">
              Talk about travel, describe destinations.
            </p>
          </div>
        </div>
      </div>

      {/* ---- Skill-path (mobil va desktop uchun umumiy) ---- */}
      {loading ? (
        <SkillPathSkeleton />
      ) : (
        <div className="relative py-8 max-w-xs mx-auto lg:max-w-sm">
          {/* fon chiziq */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-base-300 -translate-x-1/2 rounded-full" />

          <div className="relative flex flex-col items-center gap-10">
            {path.map((lesson, i) => {
              const Icon = LESSON_ICONS[lesson.type] || MessageCircle;
              const offset = i % 2 === 0 ? "-translate-x-10" : "translate-x-10";
              const isLocked = lesson.status === "locked";
              const isCurrent = lesson.status === "current";
              const isCompleted = lesson.status === "completed";

              return (
                <button
                  key={lesson._id}
                  onClick={() => handleNodeClick(lesson)}
                  disabled={isLocked}
                  className={`relative tt-path-node transition ${offset} ${
                    isLocked
                      ? "bg-base-300 cursor-not-allowed"
                      : isCurrent
                      ? "bg-primary ring-4 ring-primary/20 animate-pulse"
                      : "bg-secondary"
                  }`}
                >
                  {isLocked ? (
                    <Lock size={20} className="text-neutral" />
                  ) : isCompleted ? (
                    <Check size={22} className="text-white" strokeWidth={3} />
                  ) : (
                    <Icon size={22} className="text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function SkillPathSkeleton() {
  return (
    <div className="flex flex-col items-center gap-10 py-8 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="w-14 h-14 rounded-full bg-base-300" />
      ))}
    </div>
  );
}

function DailyQuestsWidget() {
  return (
    <div className="tt-card">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-base-content">Daily Quests</p>
        <span className="text-xs text-primary font-semibold cursor-pointer">
          View all
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral">Earn 50 XP</span>
            <span className="text-neutral font-medium">20/50</span>
          </div>
          <div className="h-1.5 bg-base-300 rounded-full overflow-hidden">
            <div className="h-full w-2/5 bg-accent rounded-full" />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral">Complete 3 Perfect Lessons</span>
            <span className="text-neutral font-medium">1/3</span>
          </div>
          <div className="h-1.5 bg-base-300 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-secondary rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniLeaderboardWidget() {
  const { user } = useAuth();
  return (
    <div className="tt-card">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-base-content capitalize">
          {user?.league || "Bronze"} League
        </p>
        <span className="text-xs text-primary font-semibold cursor-pointer">
          League
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-neutral">1. Alex P.</span>
          <span className="font-semibold text-base-content">1450 XP</span>
        </div>
        <div className="flex items-center justify-between text-primary font-semibold">
          <span>4. You</span>
          <span>{user?.xp ?? 0} XP</span>
        </div>
      </div>
    </div>
  );
}