import { Response } from 'express';
import { query } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

// User: apply for a job
export const applyForJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { job_id } = req.params;
    const { applicant_name, applicant_email, applicant_phone, cover_letter, resume_url, resume_filename } = req.body;
    const user_id = req.user!.id;

    // Check job exists and is active
    const jobResult = await query(
      'SELECT id, title, is_active, deadline FROM jobs WHERE id = $1',
      [job_id]
    );
    if (jobResult.rows.length === 0) {
      sendError(res, 'Job not found', 404);
      return;
    }
    const job = jobResult.rows[0];
    if (!job.is_active) {
      sendError(res, 'This job is no longer accepting applications', 400);
      return;
    }
    if (job.deadline && new Date(job.deadline) < new Date()) {
      sendError(res, 'Application deadline has passed', 400);
      return;
    }

    // Check duplicate application
    const existing = await query(
      'SELECT id FROM applications WHERE job_id = $1 AND user_id = $2',
      [job_id, user_id]
    );
    if (existing.rows.length > 0) {
      sendError(res, 'You have already applied for this job', 409);
      return;
    }

    const result = await query(
      `INSERT INTO applications (job_id, user_id, applicant_name, applicant_email, applicant_phone, cover_letter, resume_url, resume_filename)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        job_id, user_id,
        applicant_name || null,
        applicant_email || null,
        applicant_phone || null,
        cover_letter || null,
        resume_url || null,
        resume_filename || null,
      ]
    );

    sendSuccess(res, 'Application submitted successfully', result.rows[0], 201);
  } catch (err) {
    console.error('Apply error:', err);
    sendError(res, 'Failed to submit application', 500);
  }
};

// User: get own applications
export const getMyApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user_id = req.user!.id;
    const { page = '1', limit = '10', status } = req.query as { page?: string; limit?: string; status?: string };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = ['a.user_id = $1'];
    const params: unknown[] = [user_id];
    let paramIndex = 2;

    if (status) {
      conditions.push(`a.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM applications a ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT a.*, j.title as job_title, j.company, j.location, j.job_type,
              j.company_logo, c.name as category_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       LEFT JOIN categories c ON j.category_id = c.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limitNum, offset]
    );

    sendSuccess(res, 'Applications fetched', result.rows, 200, {
      total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('Get my applications error:', err);
    sendError(res, 'Failed to fetch applications', 500);
  }
};

// User: check if applied
export const checkApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { job_id } = req.params;
    const result = await query(
      'SELECT id, status FROM applications WHERE job_id = $1 AND user_id = $2',
      [job_id, req.user!.id]
    );
    sendSuccess(res, 'Check complete', {
      hasApplied: result.rows.length > 0,
      application: result.rows[0] || null,
    });
  } catch (err) {
    console.error('Check application error:', err);
    sendError(res, 'Failed to check application', 500);
  }
};

// User: withdraw application
export const withdrawApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query(
      `DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user!.id]
    );
    if (result.rows.length === 0) {
      sendError(res, 'Application not found or unauthorized', 404);
      return;
    }
    sendSuccess(res, 'Application withdrawn');
  } catch (err) {
    console.error('Withdraw error:', err);
    sendError(res, 'Failed to withdraw application', 500);
  }
};

// Admin: get all applications for a job
export const getJobApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { job_id } = req.params;
    const { page = '1', limit = '10', status } = req.query as { page?: string; limit?: string; status?: string };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = ['a.job_id = $1'];
    const params: unknown[] = [job_id];
    let paramIndex = 2;

    if (status) {
      conditions.push(`a.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM applications a ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT a.*, u.name as applicant_name, u.email as applicant_email,
              u.phone as applicant_phone, u.avatar_url
       FROM applications a
       JOIN users u ON a.user_id = u.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limitNum, offset]
    );

    sendSuccess(res, 'Job applications fetched', result.rows, 200, {
      total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('Get job applications error:', err);
    sendError(res, 'Failed to fetch job applications', 500);
  }
};

// Admin: get ALL applications
export const getAllApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', status } = req.query as { page?: string; limit?: string; status?: string };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`a.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM applications a ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT a.*, u.name as applicant_name, u.email as applicant_email,
              j.title as job_title, j.company
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN jobs j ON a.job_id = j.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limitNum, offset]
    );

    sendSuccess(res, 'All applications fetched', result.rows, 200, {
      total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('Get all applications error:', err);
    sendError(res, 'Failed to fetch applications', 500);
  }
};

// Admin: update application status
export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      sendError(res, 'Invalid status value', 400);
      return;
    }

    const result = await query(
      `UPDATE applications SET status = $1, notes = COALESCE($2, notes)
       WHERE id = $3
       RETURNING *`,
      [status, notes, id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Application not found', 404);
      return;
    }

    sendSuccess(res, 'Application status updated', result.rows[0]);
  } catch (err) {
    console.error('Update application status error:', err);
    sendError(res, 'Failed to update application status', 500);
  }
};
