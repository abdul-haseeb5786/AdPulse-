import React, { useState, useEffect, useRef } from 'react';
import { useAlerts } from '../../hooks/useAlerts';
import type { Alert } from '../../hooks/useAlerts';

type NotificationCenterProps = {
  showToast: (message: string, type: 'success' | 'info') => void;
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ showToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use the standardized alerts hook
  const { alerts, unreadCount, markAsRead, markAllRead } = useAlerts();

  // Show a toast when the unread count goes up (new alert received remotely)
  const prevUnreadRef = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      const latestAlert = alerts[0];
      if (latestAlert) {
        showToast(latestAlert.message, 'info');
      }
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, alerts, showToast]);

  // Outside click listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">!</div>;
      case 'warning': return <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">!</div>;
      case 'info': return <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">i</div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-all duration-200"
        aria-label="Notifications"
      >
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-black rounded-full shadow-sm animate-[pulse_2s_infinite]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[360px] bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-elevated)] z-40 overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-bold text-[var(--primary)] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto no-scrollbar">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-[13px] font-medium text-[var(--text-muted)]">No alerts yet</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => !alert.is_read && markAsRead(alert.id)}
                  className={`
                    flex items-start gap-4 p-4 border-b border-[var(--border)] last:border-0 cursor-pointer transition-colors
                    ${alert.is_read ? 'bg-transparent' : 'bg-blue-500/5 hover:bg-blue-500/10'}
                  `}
                >
                  <div className="shrink-0 mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-tight mb-1 ${alert.is_read ? 'text-[var(--text-secondary)] font-medium' : 'text-[var(--text-primary)] font-bold'}`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2">
			  <span className="text-[11px] font-semibold text-[var(--text-muted)]">{alert.campaign_name || 'Campaign'}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">•</span>
                      <span className="text-[11px] text-[var(--text-muted)]">{getTimeAgo(alert.triggered_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}} />
    </div>
  );
};
