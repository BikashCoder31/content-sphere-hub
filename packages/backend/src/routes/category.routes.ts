import { Router, IRouter } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createCategoryController,
  getCategoryByIdController,
  getCategoryBySlugController,
  listCategoriesController,
  updateCategoryController,
  deleteCategoryController,
  checkCategorySlugController,
  reorderCategoriesController,
  getCategoryPathController,
} from '../controllers/category.controller.js';

const router: IRouter = Router();

// All category routes require authentication
router.use(authenticate);

// List categories (with optional tree view)
router.get('/', listCategoriesController);

// Check slug availability
router.get('/check-slug/:slug', checkCategorySlugController);

// Reorder categories
router.post('/reorder', reorderCategoriesController);

// Get category by slug (must be before :id route)
router.get('/by-slug/:slug', getCategoryBySlugController);

// Get category path (breadcrumb)
router.get('/:id/path', getCategoryPathController);

// CRUD operations
router.post('/', createCategoryController);
router.get('/:id', getCategoryByIdController);
router.patch('/:id', updateCategoryController);
router.delete('/:id', deleteCategoryController);

export default router;
