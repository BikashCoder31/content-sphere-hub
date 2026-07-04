import { Router, IRouter } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as dashboardController from '../controllers/dashboard.controller';

const router: IRouter = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Dashboard statistics
router.get('/stats', dashboardController.getStats);

// Content trend
router.get('/trend', dashboardController.getContentTrend);

// Recent activity
router.get('/activity', dashboardController.getRecentActivity);

// Recent content
router.get('/recent-content', dashboardController.getRecentContent);

// Top performing content
router.get('/top-content', dashboardController.getTopContent);

// Content by status (for charts)
router.get('/content-by-status', dashboardController.getContentByStatus);

export const dashboardRouter: IRouter = router;
