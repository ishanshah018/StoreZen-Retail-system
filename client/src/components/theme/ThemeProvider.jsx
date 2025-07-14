import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Theme Context
const ThemeContext = createContext();

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('storeZenTheme');
    return saved || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'christmas', 'halloween', 'cyberpunk', 'diwali');
    if (currentTheme !== 'light') {
      document.documentElement.classList.add(currentTheme);
    }
  }, [currentTheme]);

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'storeZenTheme' && e.newValue !== null) {
        setCurrentTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    currentTheme,
    setCurrentTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
