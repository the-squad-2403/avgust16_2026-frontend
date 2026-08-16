import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";

/**
 * Barcha ichki (protected) sahifalar shu Layout bilan o'raladi.
 *
 * Mobil (< lg):  Topbar (tepada) + children (markazda) + BottomNav (pastda)
 * Desktop (>= lg): Sidebar (chapda) + children (markazda) + rightPanel (o'ngda, ixtiyoriy)
 *
 * rightPanel — faqat Dashboard kabi sahifalarda beriladi (Daily Quests, mini-leaderboard).
 * Boshqa sahifalarda (Duel, Leaderboard, Profile) rightPanel berilmasa,
 * desktop'da ham markaziy ustun sodda tarzda ko'rinadi.
 */
export default function DashboardLayout({ children, rightPanel }) {
  return (
    <div className="min-h-screen bg-base-100 lg:flex">
      {/* Desktop sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Markaziy ustun */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 w-full max-w-md mx-auto lg:max-w-2xl px-5 lg:px-8 lg:py-8 pb-24 lg:pb-8">
            {children}
          </main>
          <BottomNav />
        </div>

        {/* Desktop o'ng panel (ixtiyoriy) */}
        {rightPanel && (
          <aside className="hidden lg:block w-80 shrink-0 border-l border-base-300 px-6 py-8 space-y-4">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}