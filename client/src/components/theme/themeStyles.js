// Theme styles configuration
export const getThemeStyles = (currentTheme) => {
  switch (currentTheme) {
    case 'christmas':
      return {
        bg: 'bg-gradient-to-br from-red-900 via-green-900 to-red-900',
        navBg: 'bg-red-900/80 border-green-600/50',
        cardBg: 'bg-red-800/30 border-green-600/30',
        text: 'text-green-100',
        accent: 'text-red-400',
        input: 'bg-red-800/50 border-green-600/50 text-green-100 placeholder-green-300',
        button: 'bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700',
        link: 'text-red-400 hover:text-red-300',
        hoverBg: 'hover:bg-red-700/30'
      };
    case 'halloween':
      return {
        bg: 'bg-gradient-to-br from-orange-900 via-black to-purple-900',
        navBg: 'bg-orange-900/80 border-purple-600/50',
        cardBg: 'bg-orange-800/30 border-purple-600/30',
        text: 'text-orange-100',
        accent: 'text-orange-400',
        input: 'bg-orange-800/50 border-purple-600/50 text-orange-100 placeholder-orange-300',
        button: 'bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700',
        link: 'text-orange-400 hover:text-orange-300',
        hoverBg: 'hover:bg-orange-700/30'
      };
    case 'cyberpunk':
      return {
        bg: 'bg-gradient-to-br from-gray-900 via-purple-900 to-cyan-900',
        navBg: 'bg-gray-900/80 border-cyan-600/50',
        cardBg: 'bg-gray-800/30 border-cyan-600/30',
        text: 'text-cyan-100',
        accent: 'text-cyan-400',
        input: 'bg-gray-800/50 border-cyan-600/50 text-cyan-100 placeholder-cyan-300',
        button: 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700',
        link: 'text-cyan-400 hover:text-cyan-300',
        hoverBg: 'hover:bg-gray-700/30'
      };
    case 'diwali':
      return {
        bg: 'bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100',
        navBg: 'bg-orange-200/80 border-yellow-400/50',
        cardBg: 'bg-yellow-50/30 border-orange-400/30',
        text: 'text-orange-900',
        accent: 'text-red-600',
        input: 'bg-white/50 border-orange-400/50 text-orange-900 placeholder-orange-600',
        button: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
        link: 'text-red-600 hover:text-red-700',
        hoverBg: 'hover:bg-yellow-100/30'
      };
    case 'dark':
      return {
        bg: 'bg-gray-900',
        navBg: 'bg-gray-900/80 border-gray-700/50',
        cardBg: 'bg-gray-800/50 border-gray-700/50',
        text: 'text-white',
        accent: 'text-blue-400',
        input: 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400',
        button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
        link: 'text-blue-400 hover:text-blue-300',
        hoverBg: 'hover:bg-gray-700/30'
      };
    default: // light
      return {
        bg: 'bg-white',
        navBg: 'bg-white/80 border-gray-200/50',
        cardBg: 'bg-white/50 border-gray-200/50',
        text: 'text-gray-900',
        accent: 'text-blue-600',
        input: 'bg-gray-50/50 border-gray-300/50 text-gray-900 placeholder-gray-500',
        button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
        link: 'text-blue-600 hover:text-blue-700',
        hoverBg: 'hover:bg-gray-100/30'
      };
  }
};

// Custom hook to get theme styles
export const useThemeStyles = () => {
  // This hook can be used in components that import useTheme
  // It will be used like: const themeStyles = useThemeStyles(currentTheme);
  return getThemeStyles;
};
