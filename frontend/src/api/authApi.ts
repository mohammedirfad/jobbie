import api from './axios';
import { ApiResponse, User } from '../types';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; phone?: string; }
export interface AuthData { user: User; accessToken: string; }

export const authApi = {
  login: (data: LoginPayload) => api.post<ApiResponse<AuthData>>('/auth/login', data),
  register: (data: RegisterPayload) => api.post<ApiResponse<AuthData>>('/auth/register', data),
  logout: () => api.post<ApiResponse<null>>('/auth/logout'),
  getProfile: () => api.get<ApiResponse<User>>('/auth/profile'),
  updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse<null>>('/auth/change-password', data),
  refreshToken: () => api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token'),
};
