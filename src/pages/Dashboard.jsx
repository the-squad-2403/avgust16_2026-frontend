import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import DashboardLayout from '../components/DashboardLayout.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
          {t('welcomeBack')} {user?.name}
        </h1>
        <p className="text-gray-500 mb-8">{user?.email}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                {t('gettingStartedTitle')}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">{t('gettingStartedBody')}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
