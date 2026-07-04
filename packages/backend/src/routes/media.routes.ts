import { Router, IRouter } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  uploadSingle,
  uploadMultiple,
  handleMulterError,
  uploadSingleFile,
  uploadMultipleFiles,
  getMediaByIdController,
  listMediaController,
  updateMediaController,
  deleteMediaController,
  restoreMediaController,
  permanentlyDeleteMediaController,
  bulkMediaOperationController,
  createMediaFolderController,
  listMediaFoldersController,
  updateMediaFolderController,
  deleteMediaFolderController,
} from '../controllers/media.controller.js';

const router: IRouter = Router();

// All media routes require authentication
router.use(authenticate);

// ==================== MEDIA ROUTES ====================

// Upload single file
router.post('/upload', uploadSingle, handleMulterError, uploadSingleFile);

// Upload multiple files
router.post('/upload/batch', uploadMultiple, handleMulterError, uploadMultipleFiles);

// List all media with filters
router.get('/', listMediaController);

// Get single media by ID
router.get('/:id', getMediaByIdController);

// Update media metadata
router.patch('/:id', updateMediaController);

// Soft delete media
router.delete('/:id', deleteMediaController);

// Restore soft-deleted media
router.post('/:id/restore', restoreMediaController);

// Permanently delete media
router.delete('/:id/permanent', permanentlyDeleteMediaController);

// Bulk operations
router.post('/bulk', bulkMediaOperationController);

// ==================== FOLDER ROUTES ====================

// Create folder
router.post('/folders', createMediaFolderController);

// List folders
router.get('/folders', listMediaFoldersController);

// Update folder
router.patch('/folders/:id', updateMediaFolderController);

// Delete folder
router.delete('/folders/:id', deleteMediaFolderController);

export default router;
