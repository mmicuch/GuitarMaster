import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePreferences } from '../hooks/usePreferences';

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  danger: string;
  text: string;
  textSecondary: string;
  border: string;
}

interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

const darkTheme: Theme = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#2a2a2a',
    primary: '#007AFF',
    secondary: '#5856D6',
    danger: '#FF3B30',
    text: '#ffffff',
    textSecondary: '#999999',
    border: '#2a2a2a',
  },
};

const lightTheme: Theme = {
  dark: false,
  colors: {
    background: '#ffffff',
    surface: '#f5f5f5',
    primary: '#007AFF',
    secondary: '#5856D6',
    danger: '#FF3B30',
    text: '#000000',
    textSecondary: '#666666',
    border: '#e0e0e0',
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences, updatePreferences } = usePreferences();
  const [theme, setTheme] = useState<Theme>(preferences.darkMode ? darkTheme : lightTheme);

  useEffect(() => {
    setTheme(preferences.darkMode ? darkTheme : lightTheme);
  }, [preferences.darkMode]);

  const toggleTheme = async () => {
    const newDarkMode = !preferences.darkMode;
    await updatePreferences({ darkMode: newDarkMode });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};