import { useState, useEffect } from 'react';
import { EditCampaignModal } from './modals/EditCampaignModal';
import { deleteCampaign, type Campaign, type CampaignParams } from '../services/campaignService';

type CampaignTableProps = {
  campaigns: Campaign[];
  isLoading: boolean;
  total: number;
  onFilterChange: (params: CampaignParams) => void;
  onRefetch: () => void;
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    paused: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    ended: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    draft: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
  };

  const currentStyle = styles[status as keyof typeof styles] || styles.draft;

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${currentStyle} uppercase tracking-wider`}>
      {status}
    </span>
  );
};

export const CampaignTable = ({
  campaigns = [],
  isLoading,
  total = 0,
  onFilterChange,
  onRefetch
}: CampaignTableProps) => {
  const [sortColumn, setSortColumn] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({ search: searchQuery, page: 1 });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, onFilterChange]);

  const handleSort = (col: string) => {
    let newAsc = true;
    if (sortColumn === col) {
      newAsc = !sortAsc;
    }
    setSortColumn(col);
    setSortAsc(newAsc);
    onFilterChange({ sort: col, order: newAsc ? 'asc' : 'desc' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
        onRefetch();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete';
        alert(message);
      }
    }
  };

  const columns = [
    { label: 'Campaign', key: 'name', sticky: true },
    { label: 'Client', key: 'client_id' },
    { label: 'Status', key: 'status' },
    { label: 'Impressions', key: 'impressions' },
    { label: 'Clicks', key: 'clicks' },
    { label: 'Spend', key: 'spend' },
    { label: 'ROAS', key: 'roas' },
    { label: 'Actions', key: 'actions' },
  ];

  return (
    <>
      <div className="card overflow-hidden flex flex-col">
        {/* Table Header / Search */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-subtle)]/50">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            All Campaigns
          </h3>
          <div className="relative max-w-sm w-full">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search campaigns..."
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-0 font-medium">
            <thead>
              <tr className="bg-[var(--bg-subtle)]/30 border-b border-[var(--border)]">
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.key !== 'actions' && handleSort(col.key)}
                    className={`
                      px-6 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] transition-colors
                      ${col.key !== 'actions' ? 'cursor-pointer hover:bg-[var(--bg-subtle)]' : ''}
                      ${col.sticky ? 'sticky left-0 bg-[var(--bg-surface)] z-10' : ''}
                    `}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {sortColumn === col.key && (
                        <span className={`text-[#2563eb] transition-transform duration-200 ${sortAsc ? '' : 'rotate-180'}`}>
                          ↑
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map(col => (
                      <td key={col.key} className="px-6 py-4">
                        <div className="h-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded animate-pulse w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-[var(--text-muted)] text-sm">
                    No campaigns found
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => {
                  const numSpend = Number(campaign.spend) || 0;
                  const numRevenue = Number(campaign.revenue) || 0;
                  const roas = numSpend > 0 ? numRevenue / numSpend : 0;
                  return (
                    <tr
                      key={campaign.id}
                      className="hover:bg-[var(--bg-subtle)]/50 transition-colors group cursor-default"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-[var(--text-primary)] sticky left-0 bg-[var(--bg-surface)] group-hover:bg-transparent z-10 transition-colors">
                        {campaign.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {campaign.client_id || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={campaign.status} />
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-[var(--text-secondary)]">
                        {Number(campaign.impressions || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-[var(--text-secondary)]">
                        {Number(campaign.clicks || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-bold text-[var(--text-primary)]">
                        ${numSpend.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-mono font-bold ${roas >= 4 ? 'text-green-600' : roas >= 2 ? 'text-amber-600' : 'text-red-500'}`}>
                          {roas.toFixed(1)}x
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingCampaign(campaign)}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50 px-3 py-1.5 rounded text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            className="bg-[var(--danger-light)] text-[var(--danger)] hover:bg-[var(--danger-light)] px-3 py-1.5 rounded text-xs font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 10 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--border)]">
            <span className="text-sm font-medium text-[var(--text-muted)]">
              Showing {campaigns.length} campaigns out of {total} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onFilterChange({ page: 1 })}
                className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-subtle)] text-xs font-semibold"
              >
                Previous
              </button>
              <button
                onClick={() => onFilterChange({ page: 2 })}
                className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-subtle)] text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {editingCampaign && (
        <EditCampaignModal
          campaign={editingCampaign}
          isOpen={!!editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSuccess={onRefetch}
        />
      )}
    </>
  );
};
