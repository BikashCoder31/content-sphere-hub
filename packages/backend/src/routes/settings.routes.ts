import { Router, IRouter } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as settingsController from '../controllers/settings.controller';

const router: IRouter = Router();

// Public settings (no auth required)
router.get('/public', settingsController.getPublicSettings);

// All other routes require authentication
router.use(authenticate);

// Get all settings
router.get('/', settingsController.getAllSettings);

// Get settings grouped by category
router.get('/grouped', settingsController.getSettingsGrouped);

// Get settings by category
router.get('/category/:category', settingsController.getSettingsByCategory);

// Get a single setting
router.get('/:key', settingsController.getSettingByKey);

// Admin-only routes
// Update a single setting
router.patch('/:key', requireRole('admin'), settingsController.updateSetting);

// Update multiple settings
router.patch('/', requireRole('admin'), settingsController.updateSettings);

// Seed default settings
router.post('/seed', requireRole('admin'), settingsController.seedSettings);

// Reset a setting to default
router.post('/:key/reset', requireRole('admin'), settingsController.resetSetting);

export const settingsRouter: IRouter = router;
