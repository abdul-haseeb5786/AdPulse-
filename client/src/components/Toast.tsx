import React, { useEffect, useState } from 'react';

type ToastType = 'success' | 'info';

type ToastProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
};

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const borderStyles = {
    success: 'border-l-[4px] border-l-[var(--success)]',
    info: 'border-l-[4px] border-l-[var(--primary)]',
  };

  return (
    <div 
      className={`
        fixed bottom-6 right-6 z-50 w-[320px] bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-elevated)] p-4 flex items-start gap-3 transition-all duration-300 transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}
        ${borderStyles[type]}
      `}
    >
      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${type === 'success' ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--primary-light)] text-[var(--primary)]'}`}>
        {type === 'success' ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">{message}</p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="text-[var(--text-muted)] hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
