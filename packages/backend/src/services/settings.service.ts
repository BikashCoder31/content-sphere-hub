import mongoose from 'mongoose';
import { Settings, ISettings, SettingsCategory, defaultSettings } from '../models/settings.model';

/**
 * Settings response type
 */
export interface SettingResponse {
  key: string;
  value: unknown;
  category: SettingsCategory;
  label: string;
  description?: string;
  type: string;
  isPublic: boolean;
  updatedAt: Date;
}

/**
 * Convert setting document to response
 */
function toSettingResponse(setting: ISettings): SettingResponse {
  return {
    key: setting.key,
    value: setting.value,
    category: setting.category,
    label: setting.label,
    description: setting.description,
    type: setting.type,
    isPublic: setting.isPublic,
    updatedAt: setting.updatedAt,
  };
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<SettingResponse[]> {
  const settings = await Settings.find().sort({ category: 1, key: 1 });
  return settings.map(toSettingResponse);
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(
  category: SettingsCategory
): Promise<SettingResponse[]> {
  const settings = await Settings.getByCategory(category);
  return settings.map(toSettingResponse);
}

/**
 * Get a single setting by key
 */
export async function getSettingByKey(key: string): Promise<SettingResponse | null> {
  const setting = await Settings.findOne({ key });
  return setting ? toSettingResponse(setting) : null;
}

/**
 * Get setting value by key
 */
export async function getSettingValue(key: string): Promise<unknown> {
  return Settings.getSetting(key);
}

/**
 * Update a setting
 */
export async function updateSetting(
  key: string,
  value: unknown,
  userId?: string
): Promise<SettingResponse> {
  const setting = await Settings.setSetting(
    key,
    value,
    userId ? new mongoose.Types.ObjectId(userId) : undefined
  );
  return toSettingResponse(setting);
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(
  updates: { key: string; value: unknown }[],
  userId?: string
): Promise<SettingResponse[]> {
  const results: SettingResponse[] = [];

  for (const update of updates) {
    const setting = await updateSetting(update.key, update.value, userId);
    results.push(setting);
  }

  return results;
}

/**
 * Get public settings as key-value map
 */
export async function getPublicSettings(): Promise<Record<string, unknown>> {
  return Settings.getPublicSettings();
}

/**
 * Seed default settings if they don't exist
 */
export async function seedSettings(): Promise<number> {
  let seeded = 0;

  for (const setting of defaultSettings) {
    const exists = await Settings.findOne({ key: setting.key });
    if (!exists) {
      await Settings.create(setting);
      seeded++;
    }
  }

  return seeded;
}

/**
 * Reset a setting to its default value
 */
export async function resetSetting(key: string, userId?: string): Promise<SettingResponse | null> {
  const defaultSetting = defaultSettings.find((s) => s.key === key);
  if (!defaultSetting) {
    return null;
  }

  return updateSetting(key, defaultSetting.value, userId);
}

/**
 * Reset all settings to defaults
 */
export async function resetAllSettings(userId?: string): Promise<number> {
  let reset = 0;

  for (const setting of defaultSettings) {
    await updateSetting(setting.key, setting.value, userId);
    reset++;
  }

  return reset;
}

/**
 * Get settings grouped by category
 */
export async function getSettingsGrouped(): Promise<Record<SettingsCategory, SettingResponse[]>> {
  const settings = await getAllSettings();
  const grouped: Record<string, SettingResponse[]> = {};

  for (const setting of settings) {
    if (!grouped[setting.category]) {
      grouped[setting.category] = [];
    }
    grouped[setting.category].push(setting);
  }

  return grouped as Record<SettingsCategory, SettingResponse[]>;
}
