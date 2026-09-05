import { Request, Response } from 'express';
import { query } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest, PaginationQuery } from '../types';

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      category,
      experience_level,
      job_type,
      location,
      is_featured,
      is_active = 'true',
      sort_by = 'created_at',
      sort_order = 'desc',
    } = req.query as PaginationQuery;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (is_active !== undefined) {
      conditions.push(`j.is_active = $${paramIndex++}`);
      params.push(is_active === 'true');
    }

    if (search) {
      conditions.push(
        `(j.title ILIKE $${paramIndex} OR j.company ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex} OR $${paramIndex} = ANY(j.skills))`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      conditions.push(`c.slug = $${paramIndex++}`);
      params.push(category);
    }

    if (experience_level) {
      conditions.push(`j.experience_level = $${paramIndex++}`);
      params.push(experience_level);
    }

    if (job_type) {
      conditions.push(`j.job_type = $${paramIndex++}`);
      params.push(job_type);
    }

    if (location) {
      conditions.push(`j.location ILIKE $${paramIndex++}`);
      params.push(`%${location}%`);
    }

    if (is_featured !== undefined) {
      conditions.push(`j.is_featured = $${paramIndex++}`);
      params.push(is_featured === 'true');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSortFields: Record<string, string> = {
      created_at: 'j.created_at',
      title: 'j.title',
      company: 'j.company',
      salary_min: 'j.salary_min',
    };
    const sortField = allowedSortFields[sort_by] || 'j.created_at';
    const sortDir = sort_order === 'asc' ? 'ASC' : 'DESC';

    const countResult = await query(
      `SELECT COUNT(*) FROM jobs j
       LEFT JOIN categories c ON j.category_id = c.id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const jobsResult = await query(
      `SELECT j.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
       FROM jobs j
       LEFT JOIN categories c ON j.category_id = c.id
       ${whereClause}
       ORDER BY j.is_featured DESC, ${sortField} ${sortDir}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limitNum, offset]
    );

    sendSuccess(res, 'Jobs fetched successfully', jobsResult.rows, 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('Get jobs error:', err);
    sendError(res, 'Failed to fetch jobs', 500);
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT j.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon,
              u.name as created_by_name
       FROM jobs j
       LEFT JOIN categories c ON j.category_id = c.id
       LEFT JOIN users u ON j.created_by = u.id
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Job not found', 404);
      return;
    }

    // increment view count
    await query('UPDATE jobs SET view_count = view_count + 1 WHERE id = $1', [id]);

    sendSuccess(res, 'Job fetched successfully', result.rows[0]);
  } catch (err) {
    console.error('Get job error:', err);
    sendError(res, 'Failed to fetch job', 500);
  }
};

export const createJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title, company, company_logo, location, job_type, experience_level,
      category_id, description, requirements, responsibilities, skills,
      salary_min, salary_max, salary_currency, is_featured, deadline,
    } = req.body;

    const result = await query(
      `INSERT INTO jobs (
        title, company, company_logo, location, job_type, experience_level,
        category_id, description, requirements, responsibilities, skills,
        salary_min, salary_max, salary_currency, is_featured, deadline, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *`,
      [
        title, company, company_logo || null, location, job_type, experience_level,
        category_id, description,
        requirements || [], responsibilities || [], skills || [],
        salary_min || null, salary_max || null, salary_currency || 'USD',
        is_featured ?? false, deadline || null, req.user!.id,
      ]
    );

    // fetch with category
    const job = await query(
      `SELECT j.*, c.name as category_name FROM jobs j
       LEFT JOIN categories c ON j.category_id = c.id WHERE j.id = $1`,
      [result.rows[0].id]
    );

    sendSuccess(res, 'Job created successfully', job.rows[0], 201);
  } catch (err) {
    console.error('Create job error:', err);
    sendError(res, 'Failed to create job', 500);
  }
};

export const updateJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM jobs WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      sendError(res, 'Job not found', 404);
      return;
    }

    const {
      title, company, company_logo, location, job_type, experience_level,
      category_id, description, requirements, responsibilities, skills,
      salary_min, salary_max, salary_currency, is_featured, is_active, deadline,
    } = req.body;

    const result = await query(
      `UPDATE jobs SET
        title = COALESCE($1, title),
        company = COALESCE($2, company),
        company_logo = COALESCE($3, company_logo),
        location = COALESCE($4, location),
        job_type = COALESCE($5, job_type),
        experience_level = COALESCE($6, experience_level),
        category_id = COALESCE($7, category_id),
        description = COALESCE($8, description),
        requirements = COALESCE($9, requirements),
        responsibilities = COALESCE($10, responsibilities),
        skills = COALESCE($11, skills),
        salary_min = COALESCE($12, salary_min),
        salary_max = COALESCE($13, salary_max),
        salary_currency = COALESCE($14, salary_currency),
        is_featured = COALESCE($15, is_featured),
        is_active = COALESCE($16, is_active),
        deadline = COALESCE($17, deadline)
      WHERE id = $18
      RETURNING *`,
      [
        title, company, company_logo, location, job_type, experience_level,
        category_id, description, requirements, responsibilities, skills,
        salary_min, salary_max, salary_currency, is_featured, is_active,
        deadline, id,
      ]
    );

    const job = await query(
      `SELECT j.*, c.name as category_name FROM jobs j
       LEFT JOIN categories c ON j.category_id = c.id WHERE j.id = $1`,
      [result.rows[0].id]
    );

    sendSuccess(res, 'Job updated successfully', job.rows[0]);
  } catch (err) {
    console.error('Update job error:', err);
    sendError(res, 'Failed to update job', 500);
  }
};

export const deleteJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      sendError(res, 'Job not found', 404);
      return;
    }

    sendSuccess(res, 'Job deleted successfully');
  } catch (err) {
    console.error('Delete job error:', err);
    sendError(res, 'Failed to delete job', 500);
  }
};

export const toggleJobStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE jobs SET is_active = NOT is_active WHERE id = $1 RETURNING id, is_active',
      [id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Job not found', 404);
      return;
    }

    sendSuccess(res, `Job ${result.rows[0].is_active ? 'activated' : 'deactivated'}`, result.rows[0]);
  } catch (err) {
    console.error('Toggle job error:', err);
    sendError(res, 'Failed to toggle job status', 500);
  }
};

export const getFeaturedJobs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT j.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
       FROM jobs j
       LEFT JOIN categories c ON j.category_id = c.id
       WHERE j.is_featured = true AND j.is_active = true
       ORDER BY j.created_at DESC
       LIMIT 6`
    );
    sendSuccess(res, 'Featured jobs fetched', result.rows);
  } catch (err) {
    console.error('Featured jobs error:', err);
    sendError(res, 'Failed to fetch featured jobs', 500);
  }
};

export const getJobsByCategory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT c.id, c.name, c.slug, c.icon, c.description,
              COUNT(j.id) FILTER (WHERE j.is_active = true) as job_count
       FROM categories c
       LEFT JOIN jobs j ON j.category_id = c.id
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY job_count DESC`
    );
    sendSuccess(res, 'Categories with job counts fetched', result.rows);
  } catch (err) {
    console.error('Jobs by category error:', err);
    sendError(res, 'Failed to fetch categories', 500);
  }
};
