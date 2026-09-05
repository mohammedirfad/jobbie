import { Request, Response } from 'express';
import { query } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT c.*, COUNT(j.id) FILTER (WHERE j.is_active = true) AS job_count
       FROM categories c
       LEFT JOIN jobs j ON j.category_id = c.id
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    sendSuccess(res, 'Categories fetched', result.rows);
  } catch (err) {
    console.error('Get categories error:', err);
    sendError(res, 'Failed to fetch categories', 500);
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      sendError(res, 'Category not found', 404);
      return;
    }
    sendSuccess(res, 'Category fetched', result.rows[0]);
  } catch (err) {
    console.error('Get category error:', err);
    sendError(res, 'Failed to fetch category', 500);
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, icon, description } = req.body;

    const existing = await query('SELECT id FROM categories WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      sendError(res, 'Category with this slug already exists', 409);
      return;
    }

    const result = await query(
      `INSERT INTO categories (name, slug, icon, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, slug, icon || null, description || null]
    );
    sendSuccess(res, 'Category created', result.rows[0], 201);
  } catch (err) {
    console.error('Create category error:', err);
    sendError(res, 'Failed to create category', 500);
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, icon, description, is_active } = req.body;

    const result = await query(
      `UPDATE categories SET
        name = COALESCE($1, name), slug = COALESCE($2, slug),
        icon = COALESCE($3, icon), description = COALESCE($4, description),
        is_active = COALESCE($5, is_active)
       WHERE id = $6 RETURNING *`,
      [name, slug, icon, description, is_active, id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Category not found', 404);
      return;
    }
    sendSuccess(res, 'Category updated', result.rows[0]);
  } catch (err) {
    console.error('Update category error:', err);
    sendError(res, 'Failed to update category', 500);
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      sendError(res, 'Category not found', 404);
      return;
    }
    sendSuccess(res, 'Category deleted');
  } catch (err) {
    console.error('Delete category error:', err);
    sendError(res, 'Failed to delete category', 500);
  }
};
