import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BellIcon,
  Cog6ToothIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import Settings from '../Settings/Settings';
import NotificationBell from '../Notifications/NotificationBell';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import Logo from '../ui/Logo';

interface HeaderProps {
  language?: string;
  onLanguageChange?: (language: string) => void;
}

function Header({ language = 'en', onLanguageChange }: HeaderProps) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  const headerRef = useRef<HTMLElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const settingsOptions = [
    { id: 'profile', name: t('header.profile'), icon: UserIcon },
    { id: 'notifications', name: t('header.notifications'), icon: BellIcon },
    { id: 'security', name: t('header.security'), icon: ShieldCheckIcon },
    { id: 'preferences', name: t('header.preferences'), icon: Cog6ToothIcon }
  ];

  return (
    <>
    <header ref={headerRef} className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center">
              <img 
                src="/generated-image 1.png" 
                alt="Company Logo" 
                className="object-contain"
                style={{ 
                  filter: 'brightness(1.1) contrast(1.2) saturate(1.05)',
                  imageRendering: 'crisp-edges',
                  width: '78px',
                  height: '78px',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
            </div>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                {t('header.title')}
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                {t('header.subtitle')}
              </p>
            </div>
          </div>

          {/* Right Side - Actions */}

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSwitcher onLanguageChange={onLanguageChange} />
            
            {/* Notifications */}
            <NotificationBell />

            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
              
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900">{t('header.settings')}</h3>
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
                      <span className="font-medium">{t('header.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Chatbot Indicator */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
              <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">{t('header.aiAssistant')}</span>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</div>
                <div className="text-xs text-gray-600">{user?.role || 'Administrator'}</div>
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
