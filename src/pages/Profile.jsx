import { useEffect, useState } from "react";
import { BookOpen, MessageSquare, Award, Home, LogIn, Users, GraduationCap } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const LANGUAGE_NAMES = { uz: "Uzbek", ru: "Russian", en: "English" };

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    wordsLearned: 0,
    dialogsCompleted: 0,
    fluency: 0,
  });

  useEffect(() => {
    if (!user?._id) return;
    axiosInstance
      .get(`/users/${user._id}`)
      .then((res) => {
        const data = res.data.user || res.data;
        setStats({
          wordsLearned: data.wordsLearned ?? 0,
          dialogsCompleted: data.dialogsCompleted ?? 0,
          fluency: data.fluency ?? Math.min(100, Math.round((data.xp || 0) / 20)),
        });
      })
      .catch(() => {
        // Backend hali "wordsLearned/dialogsCompleted" kabi aggregat maydonlarni
        // qaytarmasa, XP asosida taxminiy fluency ko'rsatiladi
        setStats({
          wordsLearned: 0,
          dialogsCompleted: 0,
          fluency: Math.min(100, Math.round((user?.xp || 0) / 20)),
        });
      });
  }, [user?._id]);

  const streakCount = user?.streak?.count ?? 0;

  const achievements = [
    {
      key: "streak",
      icon: Home,
      title: "Streak Master",
      subtitle: "7 Day Streak",
      earned: streakCount >= 7,
    },
    {
      key: "early",
      icon: LogIn,
      title: "Early Bird",
      subtitle: "Login before 8am",
      earned: false,
    },
    {
      key: "social",
      icon: Users,
      title: "Social Butterfly",
      subtitle: "Add 5 friends",
      earned: false,
    },
    {
      key: "scholar",
      icon: GraduationCap,
      title: "Scholar",
      subtitle: "Read 20 lessons",
      earned: stats.dialogsCompleted >= 20,
    },
  ];
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div className="max-w-sm mx-auto space-y-4">
      {/* Avatar + fluency ring */}
      <div className="tt-card flex flex-col items-center text-center">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover mb-3" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-3">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <p className="font-bold text-base-content">{user?.name || "Foydalanuvchi"}</p>
        <p className="text-xs text-neutral mb-4">
          {LANGUAGE_NAMES[user?.nativeLanguage] || "—"} Learning{" "}
          {LANGUAGE_NAMES[user?.targetLanguage] || "—"}
        </p>

        <FluencyRing percent={stats.fluency} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox icon={<BookOpen size={18} className="text-primary" />} value={stats.wordsLearned} label="Words Learned" />
        <StatBox icon={<MessageSquare size={18} className="text-secondary" />} value={stats.dialogsCompleted} label="Dialog Completed" />
      </div>

      <div className="tt-card flex items-center gap-3">
        <Award size={22} className="text-accent" />
        <div>
          <p className="font-bold text-base-content">{earnedCount}</p>
          <p className="text-xs text-neutral">Badges Earned</p>
        </div>
      </div>

      {/* Learning activity heatmap */}
      <div className="tt-card">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-base-content text-sm">Learning Activity</p>
          <span className="text-xs text-neutral">Last 3 Months</span>
        </div>
        <Heatmap />
        <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-neutral">
          Less
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span key={lvl} className={`w-2.5 h-2.5 rounded-sm ${heatColor(lvl)}`} />
          ))}
          More
        </div>
      </div>

      {/* Achievements */}
      <div className="tt-card">
        <p className="font-bold text-base-content text-sm mb-3">Achievements</p>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.key}
                className={`rounded-2xl p-3 text-center ${
                  a.earned ? "bg-secondary/10" : "bg-base-300/40 opacity-60"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    a.earned ? "bg-secondary text-white" : "bg-base-300 text-neutral"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <p className="text-xs font-semibold text-base-content">{a.title}</p>
                <p className="text-[10px] text-neutral">{a.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full text-center text-error text-sm font-semibold py-3"
      >
        Chiqish
      </button>
    </div>
  );
}

function FluencyRing({ percent }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg className="w-28 h-28 -rotate-90">
        <circle cx="56" cy="56" r={radius} stroke="#E5E7EB" strokeWidth="8" fill="none" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          stroke="#10B981"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-secondary">{percent}%</span>
        <span className="text-[9px] text-neutral font-semibold">FLUENCY</span>
      </div>
    </div>
  );
}

function StatBox({ icon, value, label }) {
  return (
    <div className="tt-card text-left">
      <div className="mb-2">{icon}</div>
      <p className="text-lg font-bold text-base-content">{value}</p>
      <p className="text-xs text-neutral">{label}</p>
    </div>
  );
}

function heatColor(level) {
  const colors = ["bg-base-300", "bg-green-100", "bg-green-300", "bg-green-500", "bg-secondary"];
  return colors[level] || colors[0];
}

function Heatmap() {
  // Mock: 5 qator x 7 ustun, tasodifiy intensivlik (0-4)
  const cells = Array.from({ length: 35 }, () => Math.floor(Math.random() * 5));
  return (
    <div className="grid grid-cols-7 gap-1">
      {cells.map((level, i) => (
        <div key={i} className={`w-full aspect-square rounded-sm ${heatColor(level)}`} />
      ))}
    </div>
  );
}