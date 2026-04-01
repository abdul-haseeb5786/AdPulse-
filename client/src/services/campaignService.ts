import apiClient from './apiClient';

export interface CampaignParams {
  status?: string;
  client_id?: string;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export const getCampaigns = async (params: CampaignParams = {}) => {
  // Filter out undefined, null, or empty string values
  const filteredParams = Object.keys(params).reduce((acc: any, key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      acc[key] = params[key];
    }
    return acc;
  }, {});

  return apiClient.get('/campaigns', { params: filteredParams });
};

export const getCampaign = async (id: string) => {
  return apiClient.get(`/campaigns/${id}`);
};

export const createCampaign = async (payload: any) => {
  return apiClient.post('/campaigns', payload);
};

export const updateCampaign = async (id: string, payload: any) => {
  return apiClient.put(`/campaigns/${id}`, payload);
};

export const deleteCampaign = async (id: string) => {
  return apiClient.delete(`/campaigns/${id}`);
};
