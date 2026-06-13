import React from 'react';

interface ProgressProps {
  value: number; // 0 to 100
  className?: string;
  label?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className = '', label }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="mb-2 flex justify-between text-sm font-medium text-[var(--fg-text)]">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-neutral)]">
        <div
          className="h-full bg-[var(--brand-accent)] transition-all duration-500 ease-out shadow-[0_0_10px_var(--shadow-brand)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
