import { useLanguage } from '../context/LanguageContext.jsx';

const LABELS = { uz: 'UZ', ru: 'RU', en: 'EN' };

const LanguageSwitcher = () => {
  const { language, setLanguage, languages } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
      {languages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className={`px-2 py-1 text-xs font-medium rounded transition ${
            language === lang ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
