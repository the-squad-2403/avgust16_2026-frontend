import { NavLink } from "react-router-dom";
import { Home, Swords, Trophy, User } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/duel", label: "Duel", icon: Swords },
  { to: "/leaderboard", label: "League", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-300
                 px-4 py-2 flex items-center justify-between z-30"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className="flex-1 flex flex-col items-center py-1"
        >
          {({ isActive }) => (
            <>
              <div className={isActive ? "tt-nav-pill-active" : "px-3 py-1"}>
                <Icon
                  size={20}
                  strokeWidth={2.2}
                  className={isActive ? "text-secondary" : "text-neutral"}
                />
              </div>
              <span
                className={`text-[10px] mt-0.5 font-medium ${
                  isActive ? "text-secondary" : "text-neutral"
                }`}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}