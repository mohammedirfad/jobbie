export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  phone?: string;
  resume_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  job_count?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  category_id: string;
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  is_featured: boolean;
  is_active: boolean;
  deadline?: string;
  view_count?: number;
  created_by?: string;
  created_by_name?: string;
  application_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  applicant_name?: string;
  applicant_email?: string;
  applicant_phone?: string;
  cover_letter?: string;
  resume_url?: string;
  resume_filename?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  notes?: string;
  job_title?: string;
  company?: string;
  location?: string;
  job_type?: string;
  company_logo?: string;
  category_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ msg: string; path: string }>;
  pagination?: Pagination;
}

export interface JobFilters {
  search?: string;
  category?: string;
  experience_level?: string;
  job_type?: string;
  location?: string;
  is_featured?: boolean;
  is_active?: boolean | string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  overview: {
    totalJobs: number;
    activeJobs: number;
    totalUsers: number;
    totalApplications: number;
  };
  recentApplications: Application[];
  applicationsByStatus: Array<{ status: string; count: string }>;
  jobsByCategory: Array<{ name: string; icon: string; count: string }>;
  jobsByType: Array<{ job_type: string; count: string }>;
  recentJobs: Job[];
  topJobs: Array<{ id: string; title: string; company: string; location: string; application_count: string }>;
  monthlyApplications: Array<{ month: string; count: string }>;
}
