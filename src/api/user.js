import { api } from './client';

export const userApi = {
  getMe: () => api.get('/client/user/me'),

  updateMe: (payload) => api.patch('/client/user/me', payload),

  updatePassword: (oldPassword, newPassword) =>
    api.put('/client/user/password', { oldPassword, newPassword }),

  getSessions: () => api.get('/client/user/sessions'),

  terminateOtherSessions: () => api.delete('/client/user/sessions/other'),
};
