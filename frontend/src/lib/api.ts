import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('nexusai_token') || (typeof window !== 'undefined' ? localStorage.getItem('nexusai_token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('nexusai_token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const chatApi = {
  getConversations: () => api.get('/chat/conversations'),
  createConversation: () => api.post('/chat/conversations'),
  getConversation: (id: string) => api.get(`/chat/conversations/${id}`),
  sendMessage: (id: string, content: string, model?: string) => api.post(`/chat/conversations/${id}/messages`, { content, model }),
  deleteConversation: (id: string) => api.delete(`/chat/conversations/${id}`),
};

export const generateApi = {
  generate: (data: { type: string; prompt: string; tone?: string; language?: string }) => api.post('/generate/content', data),
  getHistory: (page = 1, type?: string) => api.get('/generate/history', { params: { page, type } }),
  toggleFavorite: (id: string) => api.patch(`/generate/${id}/favorite`),
  delete: (id: string) => api.delete(`/generate/${id}`),
};

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: { name?: string; avatar?: string }) => api.put('/user/profile', data),
  getUsage: () => api.get('/user/usage'),
};

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) return error.response?.data?.message || error.message || 'Something went wrong';
  return 'Something went wrong';
};
