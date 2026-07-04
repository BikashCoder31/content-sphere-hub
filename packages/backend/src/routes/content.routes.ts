import { Router, type IRouter } from 'express';
import { authenticate, optionalAuth, requirePermissions, loadUserRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createContentSchema,
  updateContentSchema,
  contentIdParamSchema,
  updateContentStatusSchema,
  bulkContentOperationSchema,
  checkSlugSchema,
} from '../schemas/content.schema.js';
import {
  getContentsHandler,
  getContentByIdHandler,
  getContentBySlugHandler,
  createContentHandler,
  updateContentHandler,
  updateContentStatusHandler,
  trashContentHandler,
  restoreContentHandler,
  deleteContentHandler,
  bulkContentOperationHandler,
  checkSlugHandler,
  getMyContentsHandler,
} from '../controllers/content.controller.js';

const router: IRouter = Router();

// Public routes (with optional auth for access control)

/**
 * @route   GET /api/v1/content
 * @desc    Get all contents (filtered by access)
 * @access  Public (filtered) / Admin (full)
 */
router.get('/', optionalAuth, loadUserRole, getContentsHandler);

/**
 * @route   GET /api/v1/content/slug/:slug
 * @desc    Get content by slug (for public pages)
 * @access  Public (if published) / Private (for drafts)
 */
router.get('/slug/:slug', optionalAuth, loadUserRole, getContentBySlugHandler);

// Authenticated routes

/**
 * @route   GET /api/v1/content/my
 * @desc    Get current user's own content
 * @access  Private (authenticated)
 */
router.get('/my', authenticate, loadUserRole, getMyContentsHandler);

/**
 * @route   GET /api/v1/content/check-slug
 * @desc    Check if a slug is available
 * @access  Private (authenticated)
 */
router.get('/check-slug', authenticate, validate(checkSlugSchema, 'query'), checkSlugHandler);

/**
 * @route   POST /api/v1/content/bulk
 * @desc    Bulk content operations (trash, restore, delete, publish, unpublish)
 * @access  Private (content permissions)
 */
router.post(
  '/bulk',
  authenticate,
  loadUserRole,
  requirePermissions('content:update'),
  validate(bulkContentOperationSchema),
  bulkContentOperationHandler
);

/**
 * @route   GET /api/v1/content/:id
 * @desc    Get content by ID
 * @access  Public (if published) / Private (for drafts)
 */
router.get('/:id', optionalAuth, loadUserRole, validate(contentIdParamSchema, 'params'), getContentByIdHandler);

/**
 * @route   POST /api/v1/content
 * @desc    Create new content
 * @access  Private (content:create permission)
 */
router.post(
  '/',
  authenticate,
  loadUserRole,
  requirePermissions('content:create'),
  validate(createContentSchema),
  createContentHandler
);

/**
 * @route   PATCH /api/v1/content/:id
 * @desc    Update content
 * @access  Private (owner or content:update permission)
 */
router.patch(
  '/:id',
  authenticate,
  loadUserRole,
  validate(contentIdParamSchema, 'params'),
  validate(updateContentSchema),
  updateContentHandler
);

/**
 * @route   PATCH /api/v1/content/:id/status
 * @desc    Update content status
 * @access  Private (owner or content:update permission)
 */
router.patch(
  '/:id/status',
  authenticate,
  loadUserRole,
  validate(contentIdParamSchema, 'params'),
  validate(updateContentStatusSchema),
  updateContentStatusHandler
);

/**
 * @route   POST /api/v1/content/:id/restore
 * @desc    Restore content from trash
 * @access  Private (owner or content:delete permission)
 */
router.post(
  '/:id/restore',
  authenticate,
  loadUserRole,
  validate(contentIdParamSchema, 'params'),
  restoreContentHandler
);

/**
 * @route   DELETE /api/v1/content/:id
 * @desc    Move content to trash (soft delete)
 * @access  Private (owner or content:delete permission)
 */
router.delete(
  '/:id',
  authenticate,
  loadUserRole,
  validate(contentIdParamSchema, 'params'),
  trashContentHandler
);

/**
 * @route   DELETE /api/v1/content/:id/permanent
 * @desc    Permanently delete content
 * @access  Private (admin only)
 */
router.delete(
  '/:id/permanent',
  authenticate,
  loadUserRole,
  requirePermissions('content:delete'),
  validate(contentIdParamSchema, 'params'),
  deleteContentHandler
);

export default router;
