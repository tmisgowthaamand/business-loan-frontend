// Mock type declarations for react-i18next compatibility
declare module 'react-i18next' {
  export function useTranslation(): {
    t: (key: string) => string;
    i18n: {
      changeLanguage: (lang: string) => Promise<void>;
      language: string;
      languages: string[];
    };
    ready: boolean;
  };
  
  export const initReactI18next: {
    type: string;
    init: () => void;
  };
}

declare module 'i18next' {
  interface i18n {
    changeLanguage: (lang: string) => Promise<void>;
    language: string;
    languages: string[];
    use: (plugin: any) => i18n;
    init: (options: any) => Promise<void>;
    t: (key: string) => string;
  }
  
  const i18n: i18n;
  export default i18n;
}

declare module 'i18next-browser-languagedetector' {
  const LanguageDetector: any;
  export default LanguageDetector;
}
