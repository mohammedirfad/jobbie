import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
} from '../controllers/categoryController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('slug')
      .trim().notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must be lowercase letters, numbers, hyphens'),
    body('icon').optional().trim(),
    body('description').optional().trim(),
  ],
  validate,
  createCategory
);

router.put('/:id', authenticate, requireAdmin, validate, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export default router;
