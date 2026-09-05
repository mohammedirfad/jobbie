import { Router } from 'express';
import { body } from 'express-validator';
import {
  register, login, refreshToken, logout,
  getProfile, updateProfile, changePassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and a number'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  ],
  validate,
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// Refresh token
router.post('/refresh-token', refreshToken);

// Logout
router.post('/logout', authenticate, logout);

// Profile
router.get('/profile', authenticate, getProfile);
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
    body('avatar_url').optional().isURL().withMessage('Invalid URL'),
    body('resume_url').optional().isURL().withMessage('Invalid URL'),
  ],
  validate,
  updateProfile
);

// Change password
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and a number'),
  ],
  validate,
  changePassword
);

export default router;
