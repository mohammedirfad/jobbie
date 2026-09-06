import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const isProd = process.env.NODE_ENV === 'production';

/** Cookie options — SameSite must be 'none' for cross-origin (Render API ↔ Vercel frontend).
 *  SameSite=None requires Secure=true, which is fine because both are HTTPS in production. */
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'strict') as 'none' | 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, 'user', $4)
       RETURNING id, name, email, role, phone, avatar_url, created_at`,
      [name, email, password_hash, phone || null]
    );

    const user = result.rows[0];
    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

    await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    sendSuccess(res, 'Registration successful', { user, accessToken }, 201);
  } catch (err) {
    console.error('Register error:', err);
    sendError(res, 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await query(
      `SELECT id, name, email, password_hash, role, avatar_url, phone, resume_url, is_active
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const user = result.rows[0];

    if (!user.is_active) {
      sendError(res, 'Account has been deactivated', 403);
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

    await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    const { password_hash: _, ...safeUser } = user;
    sendSuccess(res, 'Login successful', { user: safeUser, accessToken });
  } catch (err) {
    console.error('Login error:', err);
    sendError(res, 'Login failed', 500);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      sendError(res, 'Refresh token required', 401);
      return;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      sendError(res, 'Invalid or expired refresh token', 401);
      return;
    }

    const result = await query(
      'SELECT id, email, role, refresh_token, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0 || result.rows[0].refresh_token !== token) {
      sendError(res, 'Invalid refresh token', 401);
      return;
    }

    if (!result.rows[0].is_active) {
      sendError(res, 'Account has been deactivated', 403);
      return;
    }

    const user = result.rows[0];
    const newAccessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

    await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    sendSuccess(res, 'Token refreshed', { accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh token error:', err);
    sendError(res, 'Token refresh failed', 500);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await query('UPDATE users SET refresh_token = NULL WHERE id = $1', [req.user.id]);
    }
    res.clearCookie('refreshToken', cookieOptions);
    sendSuccess(res, 'Logged out successfully');
  } catch (err) {
    console.error('Logout error:', err);
    sendError(res, 'Logout failed', 500);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT id, name, email, role, avatar_url, phone, resume_url, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, 'Profile fetched', result.rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    sendError(res, 'Failed to fetch profile', 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, avatar_url, resume_url } = req.body;

    const result = await query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone),
       avatar_url = COALESCE($3, avatar_url), resume_url = COALESCE($4, resume_url)
       WHERE id = $5
       RETURNING id, name, email, role, avatar_url, phone, resume_url, updated_at`,
      [name, phone, avatar_url, resume_url, req.user!.id]
    );

    sendSuccess(res, 'Profile updated', result.rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    sendError(res, 'Failed to update profile', 500);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user!.id]);
    if (result.rows.length === 0) {
      sendError(res, 'User not found', 404);
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isMatch) {
      sendError(res, 'Current password is incorrect', 400);
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user!.id]);

    sendSuccess(res, 'Password changed successfully');
  } catch (err) {
    console.error('Change password error:', err);
    sendError(res, 'Failed to change password', 500);
  }
};
