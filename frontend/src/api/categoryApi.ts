import api from './axios';
import { ApiResponse, Category } from '../types';

export const categoryApi = {
  getCategories: () => api.get<ApiResponse<Category[]>>('/categories'),
  getCategoryById: (id: string) => api.get<ApiResponse<Category>>(`/categories/${id}`),
  createCategory: (data: Partial<Category>) => api.post<ApiResponse<Category>>('/categories', data),
  updateCategory: (id: string, data: Partial<Category>) => api.put<ApiResponse<Category>>(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete<ApiResponse<null>>(`/categories/${id}`),
};
