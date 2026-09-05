import api from './axios';
import { ApiResponse, Job, JobFilters } from '../types';

export const jobApi = {
  getJobs: (filters: JobFilters = {}) => api.get<ApiResponse<Job[]>>('/jobs', { params: filters }),
  getJobById: (id: string) => api.get<ApiResponse<Job>>(`/jobs/${id}`),
  getFeaturedJobs: () => api.get<ApiResponse<Job[]>>('/jobs/featured'),
  getJobsByCategory: () => api.get<ApiResponse<unknown[]>>('/jobs/by-category'),
  createJob: (data: Partial<Job>) => api.post<ApiResponse<Job>>('/jobs', data),
  updateJob: (id: string, data: Partial<Job>) => api.put<ApiResponse<Job>>(`/jobs/${id}`, data),
  deleteJob: (id: string) => api.delete<ApiResponse<null>>(`/jobs/${id}`),
  toggleJobStatus: (id: string) => api.patch<ApiResponse<{ id: string; is_active: boolean }>>(`/jobs/${id}/toggle-status`),
};
