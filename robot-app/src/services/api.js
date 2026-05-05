import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const staticDataAPI = {
  getAll: () => api.get('/static-data/all'),
  getRobotTypes: () => api.get('/static-data/robot-types'),
  getBreeds: (robotType) => api.get(`/static-data/breeds${robotType ? `?robotType=${robotType}` : ''}`),
  getTraits: () => api.get('/static-data/traits'),
};

export const personalityAPI = {
  createOrUpdate: (robotId, data) =>
    api.post(`/personalities/${robotId}`, data),
  get: (robotId) =>
    api.get(`/personalities/${robotId}`),
};

export const interactionAPI = {
  chat: (robotId, userInput) =>
    api.post(`/interaction/${robotId}/chat`, { userInput }),
};

export const robotControlAPI = {
  sendCommand: (robotId, action) =>
    api.post(`/interaction/${robotId}/command`, { action }),
  chat: (robotId, userInput) =>
    api.post(`/interaction/${robotId}/chat`, { userInput }),
  testConnection: () =>
    api.get('/health'),
};

export default api;
