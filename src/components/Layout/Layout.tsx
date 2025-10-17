import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from '../Chatbot/Chatbot';

// Inline responsive hook for build compatibility
type Device = 'mobile' | 'tablet' | 'desktop';

const useResponsive = (): Device => {
  const [device, setDevice] = useState<Device>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDevice('mobile');
      } else if (width < 1024) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return device;
};

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
