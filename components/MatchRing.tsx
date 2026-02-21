import React from 'react';

interface MatchRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const MatchRing: React.FC<MatchRingProps> = ({ score, size = 'md' }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-sm', // Slightly bigger for impact
    lg: 'w-24 h-24 text-xl'
  };

  // Unique ID for gradients to avoid conflicts if multiple rings exist
  const gradientId = `match-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
      <svg className="transform -rotate-90 w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7F47" /> {/* Tinder Orange */}
            <stop offset="100%" stopColor="#FF0072" /> {/* Tinder Pink */}
          </linearGradient>
          <linearGradient id={`${gradientId}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#e2e8f0" />
             <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>
        
        {/* Background Circle */}
        <circle
          stroke={`url(#${gradientId}-bg)`}
          strokeWidth="4"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
          className="opacity-50"
        />
        
        {/* Progress Circle */}
        <circle
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
          className="transition-all duration-1000 ease-out drop-shadow-sm"
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="font-bold text-slate-700">{score}%</span>
      </div>
    </div>
  );
};