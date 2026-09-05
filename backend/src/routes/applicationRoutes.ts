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
    body('cover_letter').optional().trim().isLength({ max: 2000 }),
    body('resume_url').optional().isURL().withMessage('Invalid resume URL'),
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
