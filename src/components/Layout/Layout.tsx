import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from '../Chatbot/Chatbot';
import useResponsive from '../../hooks/useResponsive';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const device = useResponsive();
  const isMobile = device === 'mobile';
  const [language, setLanguage] = useState('en');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex">
        {!isMobile && <Sidebar />}
        <div className={`flex-1 ${!isMobile ? 'ml-72' : ''}`}>
          <Header language={language} onLanguageChange={setLanguage} />
          <main className="p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* AI Chatbot */}
      <Chatbot language={language} />
    </div>
  );
}

export default Layout;
