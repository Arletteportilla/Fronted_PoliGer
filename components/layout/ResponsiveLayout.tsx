import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSidebar } from '@/contexts/SidebarContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TabNavigation, Navbar } from '@/components/navigation';

interface ResponsiveLayoutProps {
  children: ReactNode;
  currentTab?: string;
  style?: any;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  currentTab,
  style 
}) => {
  const { sidebarWidth } = useSidebar();
  const { colors: themeColors } = useTheme();

  const styles = createStyles(themeColors);

  return (
    <View style={styles.container}>
      <TabNavigation currentTab={currentTab} />
      {/* Navbar positioned absolutely to cover everything including sidebar */}
      <View style={styles.navbarContainer}>
        <Navbar />
      </View>
      <View style={[
        styles.content,
        { marginLeft: sidebarWidth },
        style
      ]}>
        <View style={styles.navbarSpacer} />
        <View style={styles.childrenContainer}>
          {children}
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  content: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    position: 'relative',
  },
  navbarContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 64,
    zIndex: 10001,
    elevation: 11,
    backgroundColor: 'transparent',
  },
  navbarSpacer: {
    height: 64,
  },
  childrenContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});