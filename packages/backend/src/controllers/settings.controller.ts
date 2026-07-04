import { Request, Response } from 'express';
import { z } from 'zod';
import * as settingsService from '../services/settings.service';
import { SettingsCategory } from '../models/settings.model';

// Validation schemas
const updateSettingSchema = z.object({
  value: z.unknown(),
});

const updateSettingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.unknown(),
    })
  ),
});

const categorySchema = z.enum([
  'general',
  'seo',
  'content',
  'media',
  'security',
  'email',
  'appearance',
]);

/**
 * Get all settings
 * GET /api/v1/settings
 */
export async function getAllSettings(req: Request, res: Response) {
  try {
    const settings = await settingsService.getAllSettings();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get settings',
    });
  }
}

/**
 * Get settings grouped by category
 * GET /api/v1/settings/grouped
 */
export async function getSettingsGrouped(req: Request, res: Response) {
  try {
    const settings = await settingsService.getSettingsGrouped();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error getting grouped settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get grouped settings',
    });
  }
}

/**
 * Get settings by category
 * GET /api/v1/settings/category/:category
 */
export async function getSettingsByCategory(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = categorySchema.safeParse(req.params.category);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid category',
      });
      return;
    }

    const settings = await settingsService.getSettingsByCategory(
      parseResult.data as SettingsCategory
    );

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error getting settings by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get settings',
    });
  }
}

/**
 * Get a single setting by key
 * GET /api/v1/settings/:key
 */
export async function getSettingByKey(req: Request, res: Response): Promise<void> {
  try {
    const setting = await settingsService.getSettingByKey(req.params.key);

    if (!setting) {
      res.status(404).json({
        success: false,
        error: 'Setting not found',
      });
      return;
    }

    res.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error('Error getting setting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get setting',
    });
  }
}

/**
 * Update a single setting
 * PATCH /api/v1/settings/:key
 */
export async function updateSetting(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = updateSettingSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: parseResult.error.errors,
      });
      return;
    }

    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const setting = await settingsService.updateSetting(
      req.params.key,
      parseResult.data.value,
      userId
    );

    res.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    if ((error as Error).message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Setting not found',
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update setting',
    });
  }
}

/**
 * Update multiple settings
 * PATCH /api/v1/settings
 */
export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = updateSettingsSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: parseResult.error.errors,
      });
      return;
    }

    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const settings = await settingsService.updateSettings(
      parseResult.data.settings as { key: string; value: unknown }[],
      userId
    );

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
    });
  }
}

/**
 * Get public settings
 * GET /api/v1/settings/public
 */
export async function getPublicSettings(req: Request, res: Response) {
  try {
    const settings = await settingsService.getPublicSettings();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error getting public settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get public settings',
    });
  }
}

/**
 * Seed default settings
 * POST /api/v1/settings/seed
 */
export async function seedSettings(req: Request, res: Response) {
  try {
    const count = await settingsService.seedSettings();

    res.json({
      success: true,
      data: { seeded: count },
      message: `Seeded ${count} settings`,
    });
  } catch (error) {
    console.error('Error seeding settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed settings',
    });
  }
}

/**
 * Reset a setting to default
 * POST /api/v1/settings/:key/reset
 */
export async function resetSetting(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const setting = await settingsService.resetSetting(req.params.key, userId);

    if (!setting) {
      res.status(404).json({
        success: false,
        error: 'Setting not found or has no default value',
      });
      return;
    }

    res.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error('Error resetting setting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset setting',
    });
  }
}
