// Theme utilities and helper functions
export const getThemeEmoji = (currentTheme) => {
  switch (currentTheme) {
    case 'christmas':
      return '🎄';
    case 'halloween':
      return '🎃';
    case 'cyberpunk':
      return '🌟';
    case 'diwali':
      return '🪔';
    default:
      return '';
  }
};

export const getToastTheme = (currentTheme) => {
  return currentTheme === 'light' ? 'light' : 'dark';
};
