import { useState, useEffect, useCallback } from 'react';
import { getCampaigns, type CampaignParams, type Campaign, type CampaignsResponse } from '../services/campaignService';

export function useCampaigns(initialParams: CampaignParams = {}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<CampaignParams>(initialParams);

  const fetchCampaigns = useCallback(async (overrideParams: CampaignParams = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const mergedParams = { ...params, ...overrideParams };
      const data: CampaignsResponse = await getCampaigns(mergedParams);
      setCampaigns(data.data || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred fetching campaigns';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const updateParams = useCallback((newParams: CampaignParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return { campaigns, total, isLoading, error, refetch: fetchCampaigns, updateParams };
}
