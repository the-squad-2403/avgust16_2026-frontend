import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-6">{t('notFoundMessage')}</p>
      <Link
        to="/"
        className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-500 transition"
      >
        {t('goHome')}
      </Link>
    </div>
  );
};

export default NotFound;
