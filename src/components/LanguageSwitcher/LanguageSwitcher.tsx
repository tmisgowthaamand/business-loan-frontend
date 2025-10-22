import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  GlobeAltIcon, 
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  value: string;
}

const languages: Language[] = [
  { 
    code: 'EN', 
    name: 'English', 
    nativeName: 'English',
    flag: '🇺🇸', 
    value: 'en' 
  },
  { 
    code: 'HI', 
    name: 'Hindi', 
    nativeName: 'हिंदी',
    flag: '🇮🇳', 
    value: 'hi' 
  },
  { 
    code: 'TA', 
    name: 'Tamil', 
    nativeName: 'தமிழ்',
    flag: '🇮🇳', 
    value: 'ta' 
  },
  { 
    code: 'TE', 
    name: 'Telugu', 
    nativeName: 'తెలుగు',
    flag: '🇮🇳', 
    value: 'te' 
  }
];

interface LanguageSwitcherProps {
  className?: string;
  onLanguageChange?: (language: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  onLanguageChange 
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update selected language when i18n language changes
  useEffect(() => {
    const currentLang = languages.find(lang => lang.value === i18n.language);
    if (currentLang) {
      setSelectedLanguage(currentLang.code);
    }
  }, [i18n.language]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = async (language: Language) => {
    try {
      await i18n.changeLanguage(language.value);
      setSelectedLanguage(language.code);
      setIsOpen(false);
      onLanguageChange?.(language.value);
      
      // Store in localStorage for persistence
      localStorage.setItem('selectedLanguage', language.value);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 min-w-[100px]"
        aria-label="Select Language"
      >
        <GlobeAltIcon className="h-4 w-4 text-gray-600" />
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="text-sm font-medium text-gray-700">{selectedLanguage}</span>
        <ChevronDownIcon className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Select Language</h3>
            <p className="text-xs text-gray-500">Choose your preferred language</p>
          </div>
          
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{language.flag}</span>
                <div className="text-left">
                  <div className="font-medium">{language.name}</div>
                  <div className="text-xs text-gray-500">{language.nativeName}</div>
                </div>
              </div>
              {selectedLanguage === language.code && (
                <CheckIcon className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}
          
          <div className="px-4 py-2 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-500">
              Language settings are saved automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
