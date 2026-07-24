import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const theme = {
    isDarkMode,
    colors: {
      background: isDarkMode ? '#121212' : '#ffffff',
      surface: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      surfaceLight: isDarkMode ? '#242424' : '#ffffff',
      primary: isDarkMode ? '#00f5ff' : '#2196F3',
      primaryDark: isDarkMode ? '#00c8d4' : '#1976D2',
      secondary: isDarkMode ? '#ff2e63' : '#f50057',
      secondaryDark: isDarkMode ? '#d4004d' : '#c51162',
      text: isDarkMode ? '#ffffff' : '#121212',
      textSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      success: isDarkMode ? '#4CAF50' : '#43A047',
      successDark: isDarkMode ? '#388E3C' : '#2E7D32',
      error: isDarkMode ? '#f44336' : '#e53935',
      errorDark: isDarkMode ? '#d32f2f' : '#c62828',
    },
    toggleTheme: () => setIsDarkMode(prev => !prev),
  };

  return (
    <ThemeContext.Provider value={theme}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};