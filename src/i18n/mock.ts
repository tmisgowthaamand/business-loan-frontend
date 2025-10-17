// Mock i18n implementation for Vercel build compatibility
// This provides basic functionality without the full i18next library

// Mock translation function
export const t = (key: string): string => {
  // Return the key itself or a default translation
  const translations: Record<string, string> = {
    'header.title': 'Business Loan Portal',
    'header.searchPlaceholder': 'Search...',
    'header.aiAssistant': 'AI Assistant',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.submit': 'Submit',
    'common.close': 'Close',
    // Add more translations as needed
  };
  
  return translations[key] || key.split('.').pop() || key;
};

// Mock i18n object
export const i18n = {
  changeLanguage: (lang: string) => {
    console.log('Mock i18n: Language change to', lang);
    return Promise.resolve();
  },
  language: 'en',
  languages: ['en', 'hi', 'ta', 'te'],
  use: () => i18n,
  init: () => Promise.resolve(),
  t,
};

// Mock useTranslation hook
export const useTranslation = () => {
  return {
    t,
    i18n,
    ready: true,
  };
};

// Mock react-i18next exports
export const initReactI18next = {
  type: '3rdParty',
  init: () => {},
};

export default i18n;
