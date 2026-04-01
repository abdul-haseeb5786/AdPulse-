import React, { useState, useRef, useEffect } from 'react';
import { NotificationCenter } from './notifications/NotificationCenter';
import { useAuth } from '../context/AuthContext';

type TopBarProps = {
  isDark: boolean;
  toggleDark: () => void;
  activeDate: string;
  onDateChange: (range: string) => void;
  onMenuToggle: () => void;
  title: string;
  subtitle: string;
  token?: string | null;
  showToast?: (message: string, type: 'success' | 'info') => void;
};

const dateRanges = ['7D', '30D', '90D', 'Custom'];

export const TopBar: React.FC<TopBarProps> = ({
  isDark,
  toggleDark,
  activeDate,
  onDateChange,
  onMenuToggle,
  title,
  subtitle,
  showToast = (m, t) => console.log(m, t)
}) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col bg-[var(--bg-surface)] border-b border-[var(--border)] shadow-sm transition-all duration-200">
      {/* Row 1: Logo/Title + Controls */}
      <div className="h-[60px] flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            aria-label="Toggle Menu"
          >
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm lg:text-md font-bold tracking-tight text-[var(--text-primary)] leading-none mb-0.5">
              {title}
            </h1>
            <p className="text-[11px] font-medium text-[var(--text-muted)] lg:block hidden">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* Desktop Date Range */}
          <div className="hidden lg:flex items-center bg-[var(--bg-subtle)] rounded-lg p-0.75 border border-[var(--border)]">
            {dateRanges.map((range) => (
              <button
                key={range}
                onClick={() => onDateChange(range)}
                className={`
                  px-3 height-8 py-1 rounded-md text-[13px] font-semibold transition-all duration-150
                  ${activeDate === range
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                {range}
              </button>
            ))}
          </div>

          <NotificationCenter showToast={showToast} />

          <button
            onClick={toggleDark}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.636l-.707.707M6.364 6.364l.707.707m11.364 11.364l.707.707M12 5a7 7 0 000 14 7 7 0 000-14z" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* User Avatar Dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-[12px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              {getInitials(user?.name)}
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-[200px] bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] shadow-[var(--shadow-elevated)] z-40 overflow-hidden animate-fadeIn">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">{user?.name || 'User'}</p>
                  <p className="text-[12px] text-[var(--text-muted)] truncate">{user?.email || 'user@example.com'}</p>
                </div>
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 h-[36px] text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 h-[36px] text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] md:hover:bg-[var(--danger-light)] md:hover:text-[var(--danger)] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Mobile Date Range Buttons */}
      <div className="lg:hidden flex border-t border-[var(--border)] bg-[var(--bg-subtle)]/50 divide-x divide-[var(--border)] overflow-x-auto no-scrollbar">
        {dateRanges.map((range) => (
          <button
            key={range}
            onClick={() => onDateChange(range)}
            className={`
              flex-1 px-4 py-2.5 text-[12px] font-bold transition-all text-center whitespace-nowrap
              ${activeDate === range
                ? 'bg-[var(--primary)] text-white shadow-inner'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
              }
            `}
          >
            {range}
          </button>
        ))}
      </div>
    </header>
  );
};
