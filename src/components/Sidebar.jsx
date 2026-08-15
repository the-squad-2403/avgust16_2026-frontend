import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

const navItems = [{ key: 'dashboardNav', path: '/dashboard' }];

const Sidebar = ({ open, onClose }) => {
  const { t } = useLanguage();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 transform transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200">
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600 shrink-0" />
          <span className="text-lg font-semibold text-gray-900 tracking-tight">
            Hackathon Starter
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
