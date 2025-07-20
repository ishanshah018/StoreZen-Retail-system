import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import GradientCard from './GradientCard';

/**
 * ActionCard - Interactive card component with gradient background and hover effects
 * Used for navigation actions, feature cards, and menu items
 */
const ActionCard = ({
  title,                    // Card title text
  description,              // Card description/subtitle
  icon: Icon,              // Lucide icon component
  onClick,                 // Click handler function
  variant = 'primary',     // Visual variant (primary, success, warning, danger, etc.)
  isDanger = false,        // Danger state for destructive actions
  theme,                   // Theme object for styling
  className,               // Additional CSS classes
  iconRotateOnHover = false, // Whether icon should rotate on hover
  ...props
}) => {
  // Variant to gradient mapping for consistent theming
  const variantMap = {
    primary: 'primary',      // Blue gradient
    success: 'stats',        // Green gradient
    info: 'analytics',       // Blue gradient  
    warning: 'warning',      // Orange gradient
    danger: 'critical',      // Red gradient
    destructive: 'critical', // Red gradient (alias)
    secondary: 'info',       // Purple gradient
  };
  
  // Icon and text color mapping for each variant
  const colorMap = {
    primary: { icon: 'blue', text: 'blue' },
    success: { icon: 'green', text: 'green' },
    info: { icon: 'blue', text: 'blue' },
    warning: { icon: 'orange', text: 'orange' },
    danger: { icon: 'red', text: 'red' },
    destructive: { icon: 'red', text: 'red' },
    secondary: { icon: 'purple', text: 'purple' },
  };
  
  // Get gradient variant and colors for current variant
  const gradientVariant = variantMap[variant] || 'primary';
  const colors = colorMap[variant] || colorMap.primary;
  
  return (
    <GradientCard 
      variant={gradientVariant}
      className={cn('group cursor-pointer', className)}
      {...props}
    >
      <Button 
        className={cn(
          // Base button styles
          'w-full bg-transparent text-left p-0 h-auto justify-start',
          'transition-all duration-300 hover:bg-transparent',
          // Hover background color based on variant
          `group-hover:bg-${colors.icon}-500/10`
        )}
        onClick={onClick}
      >
        <div className="flex items-center space-x-3 w-full">
          {/* Icon container with background */}
          <div className={cn(
            'p-2 rounded-lg transition-all duration-300',
            `bg-${colors.icon}-500/20 group-hover:bg-${colors.icon}-500/30`
          )}>
            <Icon className={cn(
              'h-4 w-4 transition-transform duration-300',
              `text-${colors.icon}-400`,
              iconRotateOnHover && 'group-hover:rotate-90'
            )} />
          </div>
          
          {/* Text content */}
          <div className="flex-1 min-w-0">
            {/* Title with hover color change */}
            <h4 className={cn(
              'font-semibold text-sm transition-colors duration-300',
              isDanger 
                ? `text-${colors.text}-400 group-hover:text-${colors.text}-300` 
                : `${theme?.text} group-hover:text-${colors.text}-400`
            )}>
              {title}
            </h4>
            
            {/* Description with proper truncation */}
            <p className={cn(
              'text-xs opacity-70 truncate transition-opacity duration-300',
              'group-hover:opacity-90',
              isDanger 
                ? `text-${colors.text}-500/70` 
                : `${theme?.textSecondary}`
            )}>
              {description}
            </p>
          </div>
        </div>
      </Button>
    </GradientCard>
  );
};

export default ActionCard;
