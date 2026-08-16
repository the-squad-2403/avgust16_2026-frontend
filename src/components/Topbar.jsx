import { Flame, Coins } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-base-100 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || "T"}
          </div>
        )}
        <span className="text-lg font-bold text-primary">TripleTalk</span>
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
        {user?.league && (
          <span className="tt-pill tt-pill-league capitalize">
            {user.league}
          </span>
        )}
      </div>
    </div>
  );
}