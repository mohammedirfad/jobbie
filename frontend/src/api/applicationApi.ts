import api from './axios';
import { ApiResponse, Application } from '../types';

export const applicationApi = {
  applyForJob: (jobId: string, data: { cover_letter?: string; resume_url?: string }) =>
    api.post<ApiResponse<Application>>(`/applications/jobs/${jobId}/apply`, data),
  checkApplication: (jobId: string) =>
    api.get<ApiResponse<{ hasApplied: boolean; application: Application | null }>>(`/applications/jobs/${jobId}/check`),
  getMyApplications: (params: { page?: number; limit?: number; status?: string } = {}) =>
    api.get<ApiResponse<Application[]>>('/applications/my', { params }),
  withdrawApplication: (id: string) => api.delete<ApiResponse<null>>(`/applications/${id}`),
  getJobApplications: (jobId: string, params = {}) =>
    api.get<ApiResponse<Application[]>>(`/applications/jobs/${jobId}/applications`, { params }),
  getAllApplications: (params = {}) =>
    api.get<ApiResponse<Application[]>>('/applications/all', { params }),
  updateApplicationStatus: (id: string, status: string, notes?: string) =>
    api.patch<ApiResponse<Application>>(`/applications/${id}/status`, { status, notes }),
};
