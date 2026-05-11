import { apiClient } from './apiClient';

export const deadlineService = {
  getAll:         ()        => apiClient.get('/api/deadlines'),
  getUpcoming:    (days = 3) => apiClient.get(`/api/deadlines/upcoming?days=${days}`),
  create:         (data)    => apiClient.post('/api/deadlines', data),
  toggleComplete: (id)      => apiClient.patch(`/api/deadlines/${id}/complete`, {}),
  delete:         (id)      => apiClient.delete(`/api/deadlines/${id}`),
};
