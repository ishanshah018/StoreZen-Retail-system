import React from 'react';

// Theme collections for different sections
export const ThemeCollections = {
  // Inventory & Stock themes
  inventory: {
    primary: {
      cardBg: 'bg-gradient-to-br from-blue-900 via-purple-900 to-black',
      text: 'text-white',
      textSecondary: 'text-blue-200',
      buttonGradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
      borderGradient: 'bg-gradient-to-r from-blue-500 to-purple-500',
      glowColor: 'shadow-blue-500/25'
    },
    cyan: {
      cardBg: 'bg-gradient-to-br from-gray-900 via-cyan-900 to-black',
      text: 'text-white',
      textSecondary: 'text-cyan-200',
      buttonGradient: 'bg-gradient-to-r from-cyan-600 to-blue-600',
      borderGradient: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      glowColor: 'shadow-cyan-500/25'
    }
  },

  // Analytics & Reports themes
  analytics: {
    emerald: {
      cardBg: 'bg-gradient-to-br from-gray-900 via-green-900 to-black',
      text: 'text-white',
      textSecondary: 'text-emerald-200',
      buttonGradient: 'bg-gradient-to-r from-emerald-600 to-green-600',
      borderGradient: 'bg-gradient-to-r from-emerald-500 to-green-500',
      glowColor: 'shadow-emerald-500/25'
    },
    purple: {
      cardBg: 'bg-gradient-to-br from-purple-900 via-pink-900 to-black',
      text: 'text-white',
      textSecondary: 'text-purple-200',
      buttonGradient: 'bg-gradient-to-r from-purple-600 to-pink-600',
      borderGradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
      glowColor: 'shadow-purple-500/25'
    }
  },

  // Finance & Orders themes
  finance: {
    amber: {
      cardBg: 'bg-gradient-to-br from-gray-900 via-yellow-900 to-black',
      text: 'text-white',
      textSecondary: 'text-amber-200',
      buttonGradient: 'bg-gradient-to-r from-amber-600 to-yellow-600',
      borderGradient: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      glowColor: 'shadow-amber-500/25'
    },
    rose: {
      cardBg: 'bg-gradient-to-br from-gray-900 via-red-900 to-black',
      text: 'text-white',
      textSecondary: 'text-rose-200',
      buttonGradient: 'bg-gradient-to-r from-rose-600 to-red-600',
      borderGradient: 'bg-gradient-to-r from-rose-500 to-red-500',
      glowColor: 'shadow-rose-500/25'
    }
  },

  // Settings & Profile themes
  settings: {
    slate: {
      cardBg: 'bg-gradient-to-br from-slate-900 via-gray-900 to-black',
      text: 'text-white',
      textSecondary: 'text-slate-300',
      buttonGradient: 'bg-gradient-to-r from-slate-600 to-gray-600',
      borderGradient: 'bg-gradient-to-r from-slate-500 to-gray-500',
      glowColor: 'shadow-slate-500/25'
    },
    indigo: {
      cardBg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black',
      text: 'text-white',
      textSecondary: 'text-indigo-200',
      buttonGradient: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      borderGradient: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      glowColor: 'shadow-indigo-500/25'
    }
  },

  // Dashboard & Overview themes
  dashboard: {
    vibrant: {
      cardBg: 'bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900',
      text: 'text-white',
      textSecondary: 'text-blue-100',
      buttonGradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
      borderGradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
      glowColor: 'shadow-purple-500/25'
    },
    ocean: {
      cardBg: 'bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900',
      text: 'text-white',
      textSecondary: 'text-cyan-100',
      buttonGradient: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600',
      borderGradient: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500',
      glowColor: 'shadow-blue-500/25'
    }
  },

  // Customer specific themes
  customer: {
    forest: {
      cardBg: 'bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900',
      text: 'text-white',
      textSecondary: 'text-emerald-100',
      buttonGradient: 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600',
      borderGradient: 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500',
      glowColor: 'shadow-emerald-500/25'
    },
    sunset: {
      cardBg: 'bg-gradient-to-br from-orange-900 via-red-900 to-pink-900',
      text: 'text-white',
      textSecondary: 'text-orange-100',
      buttonGradient: 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600',
      borderGradient: 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500',
      glowColor: 'shadow-orange-500/25'
    }
  }
};

// Pre-configured component variants using theme collections
export const ThemedComponents = {
  // Inventory cards
  InventoryCard: ({ theme = ThemeCollections.inventory.primary, children, ...props }) => (
    <div className={`rounded-xl p-4 ${theme.cardBg} border border-white/10 ${theme.glowColor} shadow-lg`} {...props}>
      {children}
    </div>
  ),

  // Analytics dashboard card
  AnalyticsCard: ({ theme = ThemeCollections.analytics.emerald, children, ...props }) => (
    <div className={`rounded-xl p-4 ${theme.cardBg} border border-white/10 ${theme.glowColor} shadow-lg`} {...props}>
      {children}
    </div>
  ),

  // Financial report card
  FinanceCard: ({ theme = ThemeCollections.finance.amber, children, ...props }) => (
    <div className={`rounded-xl p-4 ${theme.cardBg} border border-white/10 ${theme.glowColor} shadow-lg`} {...props}>
      {children}
    </div>
  ),

  // Settings panel card
  SettingsCard: ({ theme = ThemeCollections.settings.slate, children, ...props }) => (
    <div className={`rounded-xl p-4 ${theme.cardBg} border border-white/10 ${theme.glowColor} shadow-lg`} {...props}>
      {children}
    </div>
  ),

  // Dashboard overview card
  DashboardCard: ({ theme = ThemeCollections.dashboard.vibrant, children, ...props }) => (
    <div className={`rounded-xl p-4 ${theme.cardBg} border border-white/10 ${theme.glowColor} shadow-lg`} {...props}>
      {children}
    </div>
  ),

  // Customer interface card
  CustomerCard: ({ theme = ThemeCollections.customer.forest, children, ...props }) => (
    <div className={`rounded-xl p-4 ${theme.cardBg} border border-white/10 ${theme.glowColor} shadow-lg`} {...props}>
      {children}
    </div>
  )
};

export default ThemeCollections;
