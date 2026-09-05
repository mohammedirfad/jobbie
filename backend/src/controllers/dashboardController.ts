import { Response } from 'express';
import { query } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const getDashboardStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalJobs,
      activeJobs,
      totalUsers,
      totalApplications,
      recentApplications,
      applicationsByStatus,
      jobsByCategory,
      jobsByType,
      recentJobs,
      topJobs,
      monthlyApplications,
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM jobs'),
      query('SELECT COUNT(*) FROM jobs WHERE is_active = true'),
      query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
      query('SELECT COUNT(*) FROM applications'),

      // Recent 5 applications
      query(
        `SELECT a.id, a.status, a.created_at,
                u.name as applicant_name, u.email as applicant_email,
                j.title as job_title, j.company
         FROM applications a
         JOIN users u ON a.user_id = u.id
         JOIN jobs j ON a.job_id = j.id
         ORDER BY a.created_at DESC LIMIT 5`
      ),

      // Applications grouped by status
      query(
        `SELECT status, COUNT(*) as count
         FROM applications
         GROUP BY status`
      ),

      // Jobs by category
      query(
        `SELECT c.name, c.icon, COUNT(j.id) as count
         FROM categories c
         LEFT JOIN jobs j ON j.category_id = c.id AND j.is_active = true
         WHERE c.is_active = true
         GROUP BY c.id
         ORDER BY count DESC LIMIT 8`
      ),

      // Jobs by type
      query(
        `SELECT job_type, COUNT(*) as count
         FROM jobs WHERE is_active = true
         GROUP BY job_type`
      ),

      // Recent 5 jobs
      query(
        `SELECT j.id, j.title, j.company, j.location, j.job_type,
                j.is_featured, j.is_active, j.created_at,
                c.name as category_name,
                COUNT(a.id) as application_count
         FROM jobs j
         LEFT JOIN categories c ON j.category_id = c.id
         LEFT JOIN applications a ON a.job_id = j.id
         GROUP BY j.id, c.name
         ORDER BY j.created_at DESC LIMIT 5`
      ),

      // Top 5 most applied jobs
      query(
        `SELECT j.id, j.title, j.company, j.location,
                COUNT(a.id) as application_count
         FROM jobs j
         LEFT JOIN applications a ON a.job_id = j.id
         GROUP BY j.id
         ORDER BY application_count DESC LIMIT 5`
      ),

      // Monthly applications for the last 6 months
      query(
        `SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
                COUNT(*) as count
         FROM applications
         WHERE created_at >= NOW() - INTERVAL '6 months'
         GROUP BY DATE_TRUNC('month', created_at)
         ORDER BY DATE_TRUNC('month', created_at) ASC`
      ),
    ]);

    sendSuccess(res, 'Dashboard stats fetched', {
      overview: {
        totalJobs: parseInt(totalJobs.rows[0].count),
        activeJobs: parseInt(activeJobs.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalApplications: parseInt(totalApplications.rows[0].count),
      },
      recentApplications: recentApplications.rows,
      applicationsByStatus: applicationsByStatus.rows,
      jobsByCategory: jobsByCategory.rows,
      jobsByType: jobsByType.rows,
      recentJobs: recentJobs.rows,
      topJobs: topJobs.rows,
      monthlyApplications: monthlyApplications.rows,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    sendError(res, 'Failed to fetch dashboard stats', 500);
  }
};

export const getAdminUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', search, role } = req.query as {
      page?: string; limit?: string; search?: string; role?: string;
    };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      conditions.push(`u.role = $${paramIndex++}`);
      params.push(role);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar_url,
              u.is_active, u.created_at,
              COUNT(a.id) as application_count
       FROM users u
       LEFT JOIN applications a ON a.user_id = u.id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limitNum, offset]
    );

    sendSuccess(res, 'Users fetched', result.rows, 200, {
      total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('Get admin users error:', err);
    sendError(res, 'Failed to fetch users', 500);
  }
};
