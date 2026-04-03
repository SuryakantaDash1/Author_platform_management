import React from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      dot = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    // Variant classes
    const variantClasses: Record<BadgeVariant, string> = {
      primary: 'badge badge-primary',
      success: 'badge badge-success',
      warning: 'badge badge-warning',
      error: 'badge badge-error',
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      neutral: 'bg-neutral-100 text-neutral-700 dark:bg-dark-200 dark:text-dark-700',
    };

    // Size classes
    const sizeClasses: Record<BadgeSize, string> = {
      sm: 'px-2 py-0.5 text-body-xs',
      md: 'px-3 py-1 text-body-sm',
      lg: 'px-4 py-1.5 text-body',
    };

    // Dot color classes
    const dotColorClasses: Record<BadgeVariant, string> = {
      primary: 'bg-primary-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      error: 'bg-red-600',
      info: 'bg-blue-600',
      neutral: 'bg-neutral-600',
    };

    // Combine all classes
    const badgeClasses = [
      variantClasses[variant],
      sizeClasses[size],
      'inline-flex items-center',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {dot && (
          <span
            className={`w-2 h-2 rounded-full mr-1.5 ${dotColorClasses[variant]}`}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
