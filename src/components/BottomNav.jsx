// TODO: wire up active-state highlighting (NavLink) and mobile-only visibility;
// currently just renders the four nav targets so it's visible during layout work.

const items = [
  { label: 'Home', path: '/dashboard' },
  { label: 'Duel', path: '/duel' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Profile', path: '/profile' },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around">
      {items.map((item) => (
        <div key={item.path} className="flex flex-col items-center text-xs text-gray-500">
          <div className="w-5 h-5 rounded-sm bg-gray-200 mb-1" />
          {item.label}
        </div>
      ))}
    </nav>
  );
};

export default BottomNav;
