import React, { useState, useEffect } from 'react';
import { updateCampaign } from '../../services/campaignService';

type EditCampaignModalProps = {
  campaign: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const EditCampaignModal: React.FC<EditCampaignModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        status: campaign.status || 'draft',
        budget: campaign.budget || 0,
        spend: campaign.spend || 0,
        impressions: campaign.impressions || 0,
        clicks: campaign.clicks || 0,
        conversions: campaign.conversions || 0,
      });
    }
  }, [campaign]);

  if (!isOpen || !campaign) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    setError('');
    try {
      await updateCampaign(campaign.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 md:p-7 w-full max-w-[520px] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Edit Campaign</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-[var(--danger-light)] text-[var(--danger)] border border-[rgba(220,38,38,0.2)] rounded-lg p-3 text-[13px] font-medium mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[var(--text-secondary)] mb-1.5">Campaign Name</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              type="text" 
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[var(--text-secondary)] mb-1.5">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[var(--text-secondary)] mb-1.5">Budget ($)</label>
              <input 
                name="budget" 
                value={formData.budget} 
                onChange={handleChange} 
                type="number" 
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[var(--text-secondary)] mb-1.5">Spend ($)</label>
              <input 
                name="spend" 
                value={formData.spend} 
                onChange={handleChange} 
                type="number" 
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[var(--text-secondary)] mb-1.5">Impressions</label>
              <input 
                name="impressions" 
                value={formData.impressions} 
                onChange={handleChange} 
                type="number" 
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[var(--text-secondary)] mb-1.5">Clicks</label>
              <input 
                name="clicks" 
                value={formData.clicks} 
                onChange={handleChange} 
                type="number" 
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[var(--text-secondary)] mb-1.5">Conversions</label>
              <input 
                name="conversions" 
                value={formData.conversions} 
                onChange={handleChange} 
                type="number" 
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] text-sm font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpdate}
            disabled={isLoading}
            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
