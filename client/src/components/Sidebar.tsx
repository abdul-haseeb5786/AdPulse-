import React from 'react';
import { Link, useLocation } from 'react-router-dom';

type SidebarProps = {
  activeClient: string;
  onClientSelect: (client: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

const clients = [
  { name: 'All Clients', color: 'bg-blue-600' },
  { name: 'Lumiere Skincare', color: 'bg-pink-500' },
  { name: 'Nova Electronics', color: 'bg-indigo-500' },
  { name: 'Apex Fitness', color: 'bg-green-500' },
  { name: 'Drift Coffee', color: 'bg-amber-600' },
];

const campaigns = [
  { name: 'All Campaigns', badge: 'Active' },
  { name: 'Search - Brand Q1', badge: 'Pause' },
  { name: 'Meta - Video Ads', badge: 'Live' },
];

const bottomLinks = ['Settings', 'Reports'];

export const Sidebar: React.FC<SidebarProps> = ({ activeClient, onClientSelect, isOpen, onToggle }) => {
  const location = useLocation();

  const navItemClass = (active: boolean) => `
    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
    ${active
      ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)] font-semibold'
      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
    }
  `;

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen w-[280px] lg:w-[220px] bg-[var(--sidebar-bg)] border-r border-[var(--border)] z-50
        transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="h-full flex flex-col p-4">
        {/* Logo Area */}
        <div className="flex items-center justify-between h-12 mb-8 px-2 border-b border-[var(--border)] pb-4">
          <Link to="/" className="flex flex-col group">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] ring-4 ring-blue-500/10" />
              <h1 className="text-md font-bold tracking-tight text-[var(--text-primary)]">AdPulse</h1>
            </div>
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em] mt-0.5 ml-4.5">
              Campaign Intelligence
            </p>
          </Link>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Global Navigation */}
        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div>
            <h2 className="px-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
              Dashboard
            </h2>
            <Link to="/" className={navItemClass(location.pathname === '/')}>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Overview
            </Link>
          </div>

          <div>
            <h2 className="px-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
              Clients
            </h2>
            <nav className="space-y-0.5">
              {clients.map((client) => {
                const isActive = activeClient === client.name;
                return (
                  <button
                    key={client.name}
                    onClick={() => onClientSelect(client.name)}
                    className={navItemClass(isActive)}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${client.color} ring-2 ring-white/10`} />
                    {client.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <h2 className="px-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
              Campaigns
            </h2>
            <nav className="space-y-0.5">
              <Link to="/brief" className={navItemClass(location.pathname === '/brief')}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
                </svg>
                New Brief
              </Link>
              {campaigns.map((camp) => (
                <button
                  key={camp.name}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-all duration-150"
                >
                  <span className="truncate">{camp.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* AI Tools Section */}
          <div>
            <h2 className="px-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
              AI Tools
            </h2>
            <nav className="space-y-0.5">
              <Link
                to="/ai-tools?tab=copy"
                className={navItemClass(location.pathname === '/ai-tools' && (!location.search || location.search.includes('copy')))}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                AI Copywriter
              </Link>
              <Link
                to="/ai-tools?tab=social"
                className={navItemClass(location.pathname === '/ai-tools' && location.search.includes('social'))}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Social Captions
              </Link>
              <Link
                to="/ai-tools?tab=hashtags"
                className={navItemClass(location.pathname === '/ai-tools' && location.search.includes('hashtags'))}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Hashtag Generator
              </Link>
            </nav>
          </div>
        </div>

        {/* Support & Bottom Area */}
        <div className="pt-6 mt-6 border-t border-[var(--border)]">
          <nav className="space-y-0.5">
            {bottomLinks.map((link) => (
              <button
                key={link}
                className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-all duration-150"
              >
                {link}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};
