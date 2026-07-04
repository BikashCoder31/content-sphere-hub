import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';

/**
 * Get dashboard statistics
 * GET /api/v1/dashboard/stats
 */
export async function getStats(req: Request, res: Response) {
  try {
    const stats = await analyticsService.getDashboardStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard statistics',
    });
  }
}

/**
 * Get content trend data
 * GET /api/v1/dashboard/trend
 */
export async function getContentTrend(req: Request, res: Response) {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trend = await analyticsService.getContentTrend(Math.min(days, 90));

    res.json({
      success: true,
      data: trend,
    });
  } catch (error) {
    console.error('Error getting content trend:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get content trend',
    });
  }
}

/**
 * Get recent activity
 * GET /api/v1/dashboard/activity
 */
export async function getRecentActivity(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const activity = await analyticsService.getRecentActivity(Math.min(limit, 50));

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent activity',
    });
  }
}

/**
 * Get recent content
 * GET /api/v1/dashboard/recent-content
 */
export async function getRecentContent(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const content = await analyticsService.getRecentContent(Math.min(limit, 20));

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Error getting recent content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent content',
    });
  }
}

/**
 * Get top performing content
 * GET /api/v1/dashboard/top-content
 */
export async function getTopContent(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const content = await analyticsService.getTopContent(Math.min(limit, 20));

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Error getting top content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get top content',
    });
  }
}

/**
 * Get content by status (for charts)
 * GET /api/v1/dashboard/content-by-status
 */
export async function getContentByStatus(req: Request, res: Response) {
  try {
    const data = await analyticsService.getContentByStatus();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error getting content by status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get content by status',
    });
  }
}
