import { Router } from 'express';
import { body } from 'express-validator';
import {
  getJobs, getJobById, createJob, updateJob, deleteJob,
  toggleJobStatus, getFeaturedJobs, getJobsByCategory,
} from '../controllers/jobController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const jobValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('job_type')
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'remote'])
    .withMessage('Invalid job type'),
  body('experience_level')
    .isIn(['entry', 'mid', 'senior', 'lead', 'executive'])
    .withMessage('Invalid experience level'),
  body('category_id').isUUID().withMessage('Valid category ID required'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 50 }),
  body('requirements').optional().isArray(),
  body('responsibilities').optional().isArray(),
  body('skills').optional().isArray(),
  body('salary_min').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Salary must be a positive number'),
  body('salary_max').optional({ nullable: true }).isInt({ min: 0 }),
  body('is_featured').optional().isBoolean(),
  body('deadline').optional({ nullable: true }).isISO8601().withMessage('Invalid deadline date'),
];

// Public routes
router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/by-category', getJobsByCategory);
router.get('/:id', getJobById);

// Admin routes
router.post('/', authenticate, requireAdmin, jobValidation, validate, createJob);
router.put('/:id', authenticate, requireAdmin, validate, updateJob);
router.delete('/:id', authenticate, requireAdmin, deleteJob);
router.patch('/:id/toggle-status', authenticate, requireAdmin, toggleJobStatus);

export default router;
