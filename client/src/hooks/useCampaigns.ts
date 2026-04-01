import { useState, useEffect, useCallback } from 'react';
import { getCampaigns, type CampaignParams,  } from '../services/campaignService';

export function useCampaigns(initialParams: CampaignParams = {}) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<CampaignParams>(initialParams);

  const fetchCampaigns = useCallback(async (overrideParams: CampaignParams = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const mergedParams = { ...params, ...overrideParams };
      const data: any = await getCampaigns(mergedParams);
      // Using .data since typical paginated endpoints wrap inside a data property root
      setCampaigns(data.data || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching campaigns');
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
