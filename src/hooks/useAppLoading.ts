import { useState, useEffect } from 'react';

interface UseAppLoadingOptions {
  minLoadingTime?: number;
  skipOnRevisit?: boolean;
}

export function useAppLoading(options: UseAppLoadingOptions = {}) {
  const { minLoadingTime = 3000, skipOnRevisit = true } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);

  useEffect(() => {
    // Check if app has loaded before (for skip on revisit)
    const hasVisited = localStorage.getItem('app_has_loaded');
    
    if (skipOnRevisit && hasVisited) {
      setHasLoadedBefore(true);
      setIsLoading(false);
      return;
    }

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Mark as loaded
      localStorage.setItem('app_has_loaded', 'true');
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [minLoadingTime, skipOnRevisit]);

  const resetLoading = () => {
    localStorage.removeItem('app_has_loaded');
    setHasLoadedBefore(false);
    setIsLoading(true);
  };

  const skipLoading = () => {
    setIsLoading(false);
  };

  return {
    isLoading,
    hasLoadedBefore,
    resetLoading,
    skipLoading
  };
}
