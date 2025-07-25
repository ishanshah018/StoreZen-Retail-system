import React from 'react';
import { useTheme, getThemeStyles } from './theme';

const ThemeDebug = () => {
  const { currentTheme } = useTheme();
  const themeStyles = getThemeStyles(currentTheme);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div><strong>Current Theme:</strong> {currentTheme}</div>
      <div><strong>Card BG:</strong> {themeStyles.cardBg}</div>
      <div><strong>Accent:</strong> {themeStyles.accent}</div>
      <div><strong>Text:</strong> {themeStyles.text}</div>
      <div><strong>Background:</strong> {themeStyles.bg}</div>
    </div>
  );
};

export default ThemeDebug;
