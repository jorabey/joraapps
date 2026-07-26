import { api } from './client';

export const connectionsApi = {
  getMyConnections: ({ page = 1, limit = 50 } = {}) =>
    api.get(`/client/connections?page=${page}&limit=${limit}`),

  connect: (appId, scopes = []) => api.post('/client/connections', { appId, scopes }),

  disconnect: (appId) => api.post('/client/connections/disconnect', { appId }),

  block: (appId) => api.post('/client/connections/block', { appId }),
  unblock: (appId) => api.post('/client/connections/unblock', { appId }),
  report: (appId, reason, description) =>
    api.post('/client/connections/report', { appId, reason, description }),
};
