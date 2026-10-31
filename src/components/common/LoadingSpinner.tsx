import { motion } from 'framer-motion';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const strokeMap = {
  sm: 2,
  md: 2.5,
  lg: 3,
};

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const dim = size === 'sm' ? 20 : size === 'md' ? 32 : 48;
  const radius = (dim - strokeMap[size] * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={clsx('relative', sizeMap[size])}>
      <motion.svg
        className={clsx(sizeMap[size])}
        viewBox={`0 0 ${dim} ${dim}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      >
        {/* Track */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeMap[size]}
          className="text-brand-border-subtle"
        />
        {/* Animated arc */}
        <motion.circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="url(#spinner-gradient)"
          strokeWidth={strokeMap[size]}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.7}
        />
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
}
