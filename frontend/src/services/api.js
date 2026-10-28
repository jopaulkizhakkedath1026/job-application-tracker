import axios from 'axios';

const API_BASE = '/api/applications';

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getApplications = async (status = '', search = '') => {
  const params = {};
  if (status && status !== 'All') params.status = status;
  if (search && search.trim()) params.search = search.trim();

  const response = await apiClient.get(API_BASE, { params });
  return response.data;
};

export const getApplicationById = async (id) => {
  const response = await apiClient.get(`${API_BASE}/${id}`);
  return response.data;
};

export const getApplicationStats = async () => {
  const response = await apiClient.get(`${API_BASE}/stats`);
  return response.data;
};

export const createApplication = async (data) => {
  const response = await apiClient.post(API_BASE, data);
  return response.data;
};

export const updateApplication = async (id, data) => {
  const response = await apiClient.put(`${API_BASE}/${id}`, data);
  return response.data;
};

export const updateApplicationStatus = async (id, status, comment = '') => {
  const response = await apiClient.patch(`${API_BASE}/${id}/status`, {
    status,
    comment
  });
  return response.data;
};

export const deleteApplication = async (id) => {
  const response = await apiClient.delete(`${API_BASE}/${id}`);
  return response.data;
};

export default {
  getApplications,
  getApplicationById,
  getApplicationStats,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
};
