// =============================================================================
// THEME SYSTEM - CENTRALIZED EXPORT MODULE
// =============================================================================

/**
 * Theme System Components and Utilities
 * 
 * This module exports all theme-related components and utilities for the
 * StoreZen application, providing consistent theming across the entire app.
 * 
 * Features:
 * - Light/Dark theme support
 * - Gradient components with consistent styling
 * - Theme-aware utilities and helper functions
 * - Glassmorphism and modern UI effects
 */

// =============================================================================
// CORE THEME PROVIDERS AND HOOKS
// =============================================================================

export { ThemeProvider, useTheme } from './ThemeProvider';
export { getThemeStyles, useThemeStyles } from './themeStyles';
export { default as ThemeBackground } from './ThemeBackground';
export { getThemeEmoji, getToastTheme } from './themeUtils';

// =============================================================================
// GRADIENT UI COMPONENTS
// =============================================================================

export { default as GradientButton } from './GradientButton';
export { default as GradientCard } from './GradientCard';
export { default as GradientText } from './GradientText';
export { default as GradientBadge } from './GradientBadge';
export { default as ActionCard } from './ActionCard';
export { default as GlassmorphismModal } from './GlassmorphismModal';
export { default as ThemeCollections, ThemedComponents } from './ThemeCollections';
