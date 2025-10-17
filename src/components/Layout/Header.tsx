import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  GlobeAltIcon, 
  BellIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  CheckIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import Settings from '../Settings/Settings';
import NotificationBell from '../Notifications/NotificationBell';

interface HeaderProps {
  language?: string;
  onLanguageChange?: (language: string) => void;
}

function Header({ language = 'en', onLanguageChange }: HeaderProps) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  // Removed useNotifications as we're using the new NotificationBell component
  const [languageOpen, setLanguageOpen] = useState(false);
  // Removed notificationsOpen state as it's handled by NotificationBell
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  
  const headerRef = useRef<HTMLElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setLanguageOpen(false);
        setSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languages = [
    { code: 'EN', name: 'English', flag: '🇺🇸', value: 'en' },
    { code: 'HI', name: 'हिंदी', flag: '🇮🇳', value: 'hi' },
    { code: 'TA', name: 'தமிழ்', flag: '🇮🇳', value: 'ta' },
    { code: 'TE', name: 'తెలుగు', flag: '🇮🇳', value: 'te' }
  ];

  // Update selected language when prop changes
  useEffect(() => {
    const currentLang = languages.find(lang => lang.value === language);
    if (currentLang) {
      setSelectedLanguage(currentLang.code);
    }
  }, [language]);


  const settingsOptions = [
    { id: 'profile', name: 'Profile Settings', icon: UserIcon },
    { id: 'notifications', name: 'Notification Settings', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'Preferences', icon: Cog6ToothIcon }
  ];

  return (
    <>
    <header ref={headerRef} className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center">
                <img 
                  src="/generated-image.png" 
                  alt="Company Logo" 
                  className="h-16 w-16 object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300"
                  style={{ 
                    filter: 'contrast(2.2) saturate(2.0) brightness(1.8)',
                    imageRendering: 'crisp-edges',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                />
              </div>
              <h1 className="text-2xl font-poppins font-bold text-slate-900">
                {t('header.title')}
              </h1>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                className="input-search w-80"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <GlobeAltIcon className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{selectedLanguage}</span>
                <ChevronDownIcon className="h-3 w-3 text-slate-500" />
              </button>
              
              {languageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setLanguageOpen(false);
                        i18n.changeLanguage(lang.value);
                        onLanguageChange?.(lang.value);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <div className="flex items-center space-x-3">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      {selectedLanguage === lang.code && (
                        <CheckIcon className="h-4 w-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Notifications */}
            <NotificationBell />

            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
              
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900">Settings</h3>
                  </div>
                  {settingsOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSettingsOpen(false);
                          setSettingsModalOpen(true);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <IconComponent className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">{option.name}</span>
                      </button>
                    );
                  })}
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <ArrowRightOnRectangleIcon className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Chatbot Indicator */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">{t('header.aiAssistant')}</span>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-600">{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Settings Modal */}
    <Settings 
      isOpen={settingsModalOpen} 
      onClose={() => setSettingsModalOpen(false)} 
    />
    </>
  );
}

export default Header;
