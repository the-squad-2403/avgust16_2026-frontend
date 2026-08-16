import { useEffect, useState } from "react";
import { Trophy, Clock } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const MOCK_ENTRIES = [
  { rank: 1, name: "Sarah J.", xp: 4520 },
  { rank: 2, name: "Mike T.", xp: 4100 },
  { rank: 3, name: "Elena R.", xp: 3850 },
  { rank: 12, name: "You", xp: 2140, isCurrentUser: true },
  { rank: 28, name: "David K.", xp: 850 },
  { rank: 30, name: "Alex W.", xp: 420 },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState(MOCK_ENTRIES);
  const [league, setLeague] = useState(user?.league || "gold");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/leaderboard")
      .then((res) => {
        const data = res.data;
        const list = data.leaderboard || data.entries || data;
        if (Array.isArray(list) && list.length > 0) {
          const normalized = list.map((e, i) => ({
            rank: e.rank ?? i + 1,
            name: e.name ?? e.userName ?? "User",
            xp: e.xp ?? e.weeklyXp ?? 0,
            isCurrentUser: e.userId === user?._id || e._id === user?._id,
          }));
          setEntries(normalized);
        }
        if (data.league) setLeague(data.league);
      })
      .catch(() => {
        // mock bilan qolaveradi
      })
      .finally(() => setLoading(false));
  }, [user?._id]);

  const totalVisible = entries.length;

  return (
    <div className="max-w-sm mx-auto">
      {/* Liga karta */}
      <div className="tt-card mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={18} className="text-amber-500" />
          <p className="font-bold text-base-content capitalize">{league} League</p>
        </div>
        <p className="text-sm text-neutral mb-3">Top 5 advance to Platinum</p>
        <span className="tt-pill bg-blue-50 text-primary">
          <Clock size={12} /> League ends in 2d 14h
        </span>
      </div>

      {/* Reyting ro'yxati */}
      <div className="tt-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-sm text-neutral">Yuklanmoqda...</div>
        ) : (
          entries.map((entry, i) => {
            const showGapBefore =
              i > 0 && entry.rank - entries[i - 1].rank > 1;
            const isPromotion = entry.rank <= 5;
            const isDemotion = entry.rank > totalVisible - 3 && entry.rank > 5;

            return (
              <div key={entry.rank}>
                {showGapBefore && (
                  <div className="text-center text-neutral text-xs py-1">···</div>
                )}
                <div
                  className={`flex items-center justify-between px-4 py-3 border-l-4 ${
                    isPromotion
                      ? "border-secondary"
                      : isDemotion
                      ? "border-error"
                      : "border-transparent"
                  } ${entry.isCurrentUser ? "bg-blue-50/70" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-neutral w-5">
                      {entry.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {entry.name?.[0]}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        entry.isCurrentUser ? "text-primary font-bold" : "text-base-content"
                      }`}
                    >
                      {entry.name}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      entry.isCurrentUser ? "text-primary" : "text-base-content"
                    }`}
                  >
                    {entry.xp} XP
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}