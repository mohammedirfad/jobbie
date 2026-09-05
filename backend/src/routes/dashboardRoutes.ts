import { Router } from 'express';
import { getDashboardStats, getAdminUsers } from '../controllers/dashboardController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, requireAdmin, getDashboardStats);
router.get('/users', authenticate, requireAdmin, getAdminUsers);

export default router;
