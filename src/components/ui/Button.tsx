import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'bg-card text-text hover:bg-accent/10 border border-accent/20',
    ghost: 'bg-transparent text-text hover:bg-accent/10',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}