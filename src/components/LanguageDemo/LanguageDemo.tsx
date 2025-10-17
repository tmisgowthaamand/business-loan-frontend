import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

function LanguageDemo() {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' }
  ];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t('header.title')}
        </h1>

        {/* Language Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {t('header.language')} / भाषा / மொழி / భాష
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  i18n.language === lang.code
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-2">{lang.flag}</div>
                <div className="font-medium">{lang.name}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">{t('dashboard.totalEnquiries')}</h3>
              <p className="text-3xl font-bold">150</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">{t('dashboard.pendingReview')}</h3>
              <p className="text-3xl font-bold">25</p>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">{t('dashboard.approved')}</h3>
              <p className="text-3xl font-bold">98</p>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">{t('dashboard.rejected')}</h3>
              <p className="text-3xl font-bold">27</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t('sidebar.enquiries')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">TechCorp Solutions</p>
                  <p className="text-sm text-gray-600">{t('enquiries.loanAmount')}: ₹50,00,000</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {t('enquiries.pending')}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Global Enterprises</p>
                  <p className="text-sm text-gray-600">{t('enquiries.loanAmount')}: ₹75,00,000</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {t('enquiries.approved')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t('chatbot.title')} 🤖
            </h3>
            <p className="text-gray-700 mb-4">
              {t('chatbot.welcome', { name: 'Demo User' })}
            </p>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600">
                {t('chatbot.placeholder')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Current Language: <strong>{i18n.language.toUpperCase()}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Click any language above to see the entire interface change instantly!
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LanguageDemo;
