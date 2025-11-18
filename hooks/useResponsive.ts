// Responsive hook - extracted from germinaciones.tsx
import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export const useResponsive = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);
  
  return {
    width: screenData.width,
    height: screenData.height,
    isMobile: screenData.width < 768,
    isTablet: screenData.width >= 768 && screenData.width < 1024,
    isDesktop: screenData.width >= 1024,
    isLargeDesktop: screenData.width >= 1440,
    isSmallScreen: screenData.width < 400,
    isLandscape: screenData.width > screenData.height,
    // Breakpoints específicos para diseño
    columns: screenData.width >= 1024 ? 3 : screenData.width >= 768 ? 2 : 1,
    cardWidth: screenData.width >= 1024 ? (screenData.width - 120) / 3 : 
               screenData.width >= 768 ? (screenData.width - 80) / 2 : 
               screenData.width - 40,
  };
};