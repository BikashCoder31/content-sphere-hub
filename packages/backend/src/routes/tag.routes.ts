import { Router, IRouter } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createTagController,
  getTagByIdController,
  getTagBySlugController,
  listTagsController,
  updateTagController,
  deleteTagController,
  bulkTagOperationController,
  checkTagSlugController,
  findOrCreateTagsController,
  getPopularTagsController,
} from '../controllers/tag.controller.js';

const router: IRouter = Router();

// All tag routes require authentication
router.use(authenticate);

// List tags
router.get('/', listTagsController);

// Get popular tags
router.get('/popular', getPopularTagsController);

// Check slug availability
router.get('/check-slug/:slug', checkTagSlugController);

// Find or create tags from names
router.post('/find-or-create', findOrCreateTagsController);

// Bulk operations
router.post('/bulk', bulkTagOperationController);

// Get tag by slug (must be before :id route)
router.get('/by-slug/:slug', getTagBySlugController);

// CRUD operations
router.post('/', createTagController);
router.get('/:id', getTagByIdController);
router.patch('/:id', updateTagController);
router.delete('/:id', deleteTagController);

export default router;
