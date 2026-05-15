import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  variant?: 'default' | 'glass';
  hoverable?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export default function Card({
  className = '',
  variant = 'default',
  hoverable = false,
  children,
  onClick,
}: CardProps) {
  const variantClasses = {
    default: 'bg-card border border-accent/10 shadow-sm',
    glass: 'glass-card',
  };

  return (
    <motion.div
      className={`rounded-xl p-4 ${variantClasses[variant]} ${hoverable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      whileHover={hoverable ? { y: -2 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}