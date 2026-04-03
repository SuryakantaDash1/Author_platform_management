import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  fullScreen = false,
  text,
  className = '',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Spinner variant
  const SpinnerLoader = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} text-primary-600 dark:text-primary-400 animate-spin ${className}`} />
      {text && <p className="text-body-sm text-neutral-600 dark:text-dark-600">{text}</p>}
    </div>
  );

  // Dots variant
  const DotsLoader = () => {
    const dotSize = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4',
      xl: 'w-5 h-5',
    };

    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`${dotSize[size]} bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce`}
            style={{ animationDelay: '0ms' }}
          />
          <div
            className={`${dotSize[size]} bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce`}
            style={{ animationDelay: '150ms' }}
          />
          <div
            className={`${dotSize[size]} bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce`}
            style={{ animationDelay: '300ms' }}
          />
        </div>
        {text && <p className="text-body-sm text-neutral-600 dark:text-dark-600">{text}</p>}
      </div>
    );
  };

  // Pulse variant
  const PulseLoader = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} bg-primary-600 dark:bg-primary-400 rounded-full animate-pulse ${className}`} />
      {text && <p className="text-body-sm text-neutral-600 dark:text-dark-600">{text}</p>}
    </div>
  );

  // Select loader variant
  const LoaderVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'spinner':
      default:
        return <SpinnerLoader />;
    }
  };

  // Fullscreen wrapper
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark-50/80 backdrop-blur-sm">
        <LoaderVariant />
      </div>
    );
  }

  return <LoaderVariant />;
};

export default Loader;
