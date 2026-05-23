import api from './api.js';

export const getProfile = () => api.get('/users/profile');

export const updateProfile = (data) => api.put('/users/profile', data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post('/users/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
