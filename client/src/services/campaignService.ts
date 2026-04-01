import apiClient from './apiClient';

export interface Campaign {
  id: string;
  name: string;
  client_id: string;
  client_name?: string;
  status: 'active' | 'paused' | 'ended' | 'draft';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr?: number;
  roas?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignsResponse {
  data: Campaign[];
  total: number;
  page: number;
  limit: number;
}

export interface CampaignParams {
  status?: string;
  client_id?: string;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export type CreateCampaignPayload = Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'ctr' | 'roas' | 'client_name'>;
export type UpdateCampaignPayload = Partial<CreateCampaignPayload>;

export const getCampaigns = async (params: CampaignParams = {}): Promise<CampaignsResponse> => {
  const filteredParams = Object.keys(params).reduce((acc: any, key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      acc[key] = params[key];
    }
    return acc;
  }, {});

  return apiClient.get<any, CampaignsResponse>('/campaigns', { params: filteredParams });
};

export const getCampaign = async (id: string): Promise<Campaign> => {
  return apiClient.get<any, Campaign>(`/campaigns/${id}`);
};

export const createCampaign = async (payload: CreateCampaignPayload): Promise<Campaign> => {
  return apiClient.post<any, Campaign>('/campaigns', payload);
};

export const updateCampaign = async (id: string, payload: UpdateCampaignPayload): Promise<Campaign> => {
  return apiClient.put<any, Campaign>(`/campaigns/${id}`, payload);
};

export const deleteCampaign = async (id: string): Promise<{ message: string; id: string }> => {
  return apiClient.delete(`/campaigns/${id}`);
};
