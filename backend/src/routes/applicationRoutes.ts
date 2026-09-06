import { Router } from 'express';
import { body } from 'express-validator';
import {
  applyForJob, getMyApplications, checkApplication,
  withdrawApplication, getJobApplications, getAllApplications,
  updateApplicationStatus,
} from '../controllers/applicationController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// User routes
router.post(
  '/jobs/:job_id/apply',
  authenticate,
  [
    body('applicant_name')
      .trim().notEmpty().withMessage('Full name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
    body('applicant_email')
      .trim().notEmpty().withMessage('Email is required')
      .isEmail().normalizeEmail().withMessage('Enter a valid email address'),
    body('applicant_phone')
      .trim().notEmpty().withMessage('Phone number is required')
      .isLength({ min: 7, max: 50 }).withMessage('Enter a valid phone number'),
    body('cover_letter')
      .optional().trim().isLength({ max: 2000 }).withMessage('Cover letter max 2000 chars'),
    body('resume_filename')
      .optional({ nullable: true }).trim(),
    // resume_url is now optional with no strict URL validation (user might not provide it)
    body('resume_url')
      .optional({ nullable: true }).trim(),
  ],
  validate,
  applyForJob
);

router.get('/jobs/:job_id/check', authenticate, checkApplication);
router.get('/my', authenticate, getMyApplications);
router.delete('/:id', authenticate, withdrawApplication);

// Admin routes
router.get('/jobs/:job_id/applications', authenticate, requireAdmin, getJobApplications);
router.get('/all', authenticate, requireAdmin, getAllApplications);
router.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  [
    body('status')
      .isIn(['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateApplicationStatus
);

export default router;
