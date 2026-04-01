import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { useSidebar } from '../hooks/useSidebar';
import { Toast } from './Toast';

export const Layout = () => {
  const [activeClient, setActiveClient] = useState<string>('All Clients');
  const { isOpen, toggle, close } = useSidebar();
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  const location = useLocation();

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200 antialiased overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        activeClient={activeClient} 
        onClientSelect={(client) => {
          setActiveClient(client);
          close();
        }}
        isOpen={isOpen}
        onToggle={toggle}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[220px] flex flex-col min-w-0 min-h-screen relative overflow-y-auto overflow-x-hidden no-scrollbar">
        <main className="flex-1 flex flex-col min-w-0">
          <div 
            key={location.pathname}
            className="animate-fadeIn transition-all duration-300"
            style={{ animationFillMode: 'both' }}
          >
            <Outlet context={{ activeClient, onMenuToggle: toggle, showToast }} />
          </div>
        </main>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};
