import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { KPIGrid } from '../components/KPIGrid';
import { TrendChart } from '../components/TrendChart';
import { CampaignTable } from '../components/CampaignTable';
import { useDarkMode } from '../hooks/useDarkMode';
import { useCampaigns } from '../hooks/useCampaigns';

export const Dashboard: React.FC = () => {
  const { activeClient, onMenuToggle, showToast } = useOutletContext<{ activeClient: string, onMenuToggle: () => void, showToast: (m: string, t: 'success' | 'info') => void }>();
  const [isDark, toggleDark] = useDarkMode();
  const [activeDate, setActiveDate] = useState<string>('30D');

  const { 
    campaigns, 
    total,
    isLoading, 
    error, 
    refetch,
    updateParams 
  } = useCampaigns({ page: 1, limit: 50, client_id: activeClient !== 'All Clients' ? activeClient : undefined });

  React.useEffect(() => {
    updateParams({ client_id: activeClient !== 'All Clients' ? activeClient : undefined });
  }, [activeClient, updateParams]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] transition-all duration-200">
      <TopBar 
        isDark={isDark} 
        toggleDark={toggleDark} 
        activeDate={activeDate} 
        onDateChange={(range) => setActiveDate(range)}
        onMenuToggle={onMenuToggle}
        title="Dashboard Overview"
        subtitle={`Real-time reports for ${activeClient}`}
        showToast={showToast}
      />
      
      <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 animate-fadeIn max-w-[1600px] mx-auto w-full">
        {error && (
           <div className="bg-[var(--danger-light)] text-[var(--danger)] border border-[rgba(220,38,38,0.2)] rounded-lg p-3 text-[13px] font-medium">
             Error loading dashboard data: {error}
           </div>
        )}

        {/* KPI Metrics */}
        <section>
          <KPIGrid campaigns={campaigns} isLoading={isLoading} />
        </section>

        {/* Charts & Trends */}
        <section className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <TrendChart activeDate={activeDate} campaigns={campaigns} isLoading={isLoading} />
        </section>

        {/* Campaign List */}
        <section className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <CampaignTable 
            campaigns={campaigns} 
            isLoading={isLoading}
            total={total}
            onFilterChange={updateParams}
            onRefetch={refetch}
          />
        </section>
      </div>
    </div>
  );
};
