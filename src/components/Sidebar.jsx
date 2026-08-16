import { NavLink } from "react-router-dom";
import { Home, Swords, Trophy, User, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/duel", label: "Duel", icon: Swords },
  { to: "/leaderboard", label: "League", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside
      className="hidden lg:flex flex-col w-60 shrink-0 bg-base-200 border-r border-base-300
                 h-screen sticky top-0 px-4 py-6"
    >
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
          T
        </div>
        <span className="text-lg font-bold text-primary">TripleTalk</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-primary-content"
                  : "text-neutral hover:bg-base-300/50"
              }`
            }
          >
            <Icon size={18} strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral hover:bg-base-300/50 transition"
      >
        <Settings size={18} strokeWidth={2.2} />
        Settings
      </button>
    </aside>
  );
}