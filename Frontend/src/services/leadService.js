import api from './api';

export const leadService = {
  getLeads: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/leads?${queryString}`);
    return response.data;
  },

  getLeadById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  createLead: async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  bulkCreateLeads: async (leadsArray) => {
    const response = await api.post('/leads/bulk', { leads: leadsArray });
    return response.data;
  },

  updateLead: async (id, leadData) => {
    const response = await api.put(`/leads/${id}`, leadData);
    return response.data;
  },

  deleteLead: async (id) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
};