// Theme styles configuration
export const getThemeStyles = (currentTheme) => {
  switch (currentTheme) {
    case 'christmas':
      return {
        bg: 'bg-gradient-to-br from-red-50 via-green-50 to-red-50',
        navBg: 'bg-red-900/80 border-green-600/50',
        cardBg: 'bg-white/90 backdrop-blur-sm border-red-200',
        text: 'text-green-800',
        textSecondary: 'text-red-700',
        accent: 'text-red-600',
        border: 'border-red-200',
        input: 'bg-red-800/50 border-green-600/50 text-green-100 placeholder-green-300',
        button: 'bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700',
        link: 'text-red-400 hover:text-red-300',
        hover: 'hover:shadow-xl hover:shadow-red-500/20 hover:border-green-300',
        hoverBg: 'hover:bg-red-700/30',
        gradientOverlay: 'bg-gradient-to-r from-red-500/20 to-green-500/20'
      };
    case 'halloween':
      return {
        bg: 'bg-gradient-to-br from-orange-100 via-purple-50 to-orange-100',
        navBg: 'bg-orange-900/80 border-purple-600/50',
        cardBg: 'bg-gray-900/90 backdrop-blur-sm border-orange-400',
        text: 'text-orange-200',
        textSecondary: 'text-purple-300',
        accent: 'text-orange-400',
        border: 'border-orange-400',
        input: 'bg-orange-800/50 border-purple-600/50 text-orange-100 placeholder-orange-300',
        button: 'bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700',
        link: 'text-orange-400 hover:text-orange-300',
        hover: 'hover:shadow-xl hover:shadow-orange-500/30 hover:border-purple-400',
        hoverBg: 'hover:bg-orange-700/30',
        gradientOverlay: 'bg-gradient-to-r from-orange-500/20 to-purple-500/20'
      };
    case 'cyberpunk':
      return {
        bg: 'bg-gradient-to-br from-gray-900 via-purple-900 to-cyan-900',
        navBg: 'bg-gray-900/80 border-cyan-600/50',
        cardBg: 'bg-gray-800/90 backdrop-blur-sm border-cyan-400',
        text: 'text-cyan-100',
        textSecondary: 'text-purple-300',
        accent: 'text-cyan-400',
        border: 'border-cyan-400',
        input: 'bg-gray-800/50 border-cyan-600/50 text-cyan-100 placeholder-cyan-300',
        button: 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700',
        link: 'text-cyan-400 hover:text-cyan-300',
        hover: 'hover:shadow-xl hover:shadow-cyan-500/30 hover:border-purple-400',
        hoverBg: 'hover:bg-gray-700/30',
        gradientOverlay: 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20'
      };
    case 'diwali':
      return {
        bg: 'bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100',
        navBg: 'bg-orange-200/80 border-yellow-400/50',
        cardBg: 'bg-white/90 backdrop-blur-sm border-yellow-300',
        text: 'text-orange-900',
        textSecondary: 'text-red-700',
        accent: 'text-yellow-600',
        border: 'border-yellow-300',
        input: 'bg-white/50 border-orange-400/50 text-orange-900 placeholder-orange-600',
        button: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
        link: 'text-red-600 hover:text-red-700',
        hover: 'hover:shadow-xl hover:shadow-yellow-500/20 hover:border-orange-300',
        hoverBg: 'hover:bg-yellow-100/30',
        gradientOverlay: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20'
      };
    case 'dark':
      return {
        bg: 'bg-gradient-to-br from-gray-900 to-gray-800',
        navBg: 'bg-gray-900/80 border-gray-700/50',
        cardBg: 'bg-gray-800',
        text: 'text-white',
        textSecondary: 'text-gray-300',
        accent: 'text-purple-400',
        border: 'border-gray-700',
        input: 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400',
        button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
        link: 'text-blue-400 hover:text-blue-300',
        hover: 'hover:shadow-xl hover:shadow-purple-500/30',
        hoverBg: 'hover:bg-gray-700/30',
        gradientOverlay: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
      };
    default: // light
      return {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
        navBg: 'bg-white/80 border-gray-200/50',
        cardBg: 'bg-white',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        accent: 'text-purple-600',
        border: 'border-gray-200',
        input: 'bg-gray-50/50 border-gray-300/50 text-gray-900 placeholder-gray-500',
        button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
        link: 'text-blue-600 hover:text-blue-700',
        hover: 'hover:shadow-xl hover:shadow-purple-500/20',
        hoverBg: 'hover:bg-gray-100/30',
        gradientOverlay: 'bg-gradient-to-r from-purple-600/10 to-pink-600/10'
      };
  }
};

// Custom hook to get theme styles
export const useThemeStyles = () => {
  // This hook can be used in components that import useTheme
  // It will be used like: const themeStyles = useThemeStyles(currentTheme);
  return getThemeStyles;
};
