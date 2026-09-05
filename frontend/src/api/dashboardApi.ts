import api from './axios';
import { ApiResponse, DashboardStats, User } from '../types';

export const dashboardApi = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/admin/stats'),
  getUsers: (params: { page?: number; limit?: number; search?: string; role?: string } = {}) =>
    api.get<ApiResponse<User[]>>('/admin/users', { params }),
};
