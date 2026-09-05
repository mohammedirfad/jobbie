import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'user';
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  phone?: string;
  resume_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  job_count?: number;
  created_at: Date;
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
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  is_featured: boolean;
  is_active: boolean;
  deadline?: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter?: string;
  resume_url?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  created_at: Date;
  updated_at: Date;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  experience_level?: string;
  job_type?: string;
  location?: string;
  is_featured?: string;
  is_active?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
