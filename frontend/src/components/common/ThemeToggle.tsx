import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative p-2 rounded-lg w-9 h-9 flex items-center justify-center
        bg-neutral-100 dark:bg-neutral-800
        hover:bg-neutral-200 dark:hover:bg-neutral-700
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500
        outline-none
        ${className}
      `.trim()}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ scale: theme === 'dark' ? 1 : 0, opacity: theme === 'dark' ? 1 : 0, rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="w-4.5 h-4.5 text-yellow-300" style={{ width: 18, height: 18 }} />
      </motion.div>

      <motion.div
        initial={false}
        animate={{ scale: theme === 'light' ? 1 : 0, opacity: theme === 'light' ? 1 : 0, rotate: theme === 'light' ? 0 : -180 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center"
      >
        <Sun className="text-amber-500" style={{ width: 18, height: 18 }} />
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
