import { useState, useEffect } from 'react';

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

export default useResponsive;
