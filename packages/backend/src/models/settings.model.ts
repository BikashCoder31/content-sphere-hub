import mongoose, { Document, Schema, Model, Types } from 'mongoose';

/**
 * Settings category types
 */
export type SettingsCategory =
  | 'general'
  | 'seo'
  | 'content'
  | 'media'
  | 'security'
  | 'email'
  | 'appearance';

/**
 * Settings document interface
 */
export interface ISettings extends Document {
  _id: Types.ObjectId;
  key: string;
  value: unknown;
  category: SettingsCategory;
  label: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  isPublic: boolean;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Settings model interface
 */
export interface ISettingsModel extends Model<ISettings> {
  getSetting(key: string): Promise<unknown>;
  setSetting(key: string, value: unknown, userId?: Types.ObjectId | string): Promise<ISettings>;
  getByCategory(category: SettingsCategory): Promise<ISettings[]>;
  getPublicSettings(): Promise<Record<string, unknown>>;
}

/**
 * Settings schema
 */
const settingsSchema = new Schema<ISettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
      match: /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/i, // dot-notation keys
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['general', 'seo', 'content', 'media', 'security', 'email', 'appearance', 'users', 'analytics', 'social', 'integrations'],
      index: true,
    },
    label: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    type: {
      type: String,
      required: true,
      enum: ['string', 'number', 'boolean', 'json', 'array'],
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for key lookups
settingsSchema.index({ key: 1 }, { unique: true });

/**
 * Get a setting value by key
 */
settingsSchema.statics.getSetting = async function (key: string): Promise<unknown> {
  const setting = await this.findOne({ key });
  return setting?.value;
};

/**
 * Set a setting value by key
 */
settingsSchema.statics.setSetting = async function (
  key: string,
  value: unknown,
  userId?: Types.ObjectId | string
): Promise<ISettings> {
  const setting = await this.findOneAndUpdate(
    { key },
    {
      value,
      ...(userId && { updatedBy: new mongoose.Types.ObjectId(userId.toString()) }),
    },
    { new: true }
  );

  if (!setting) {
    throw new Error(`Setting '${key}' not found`);
  }

  return setting;
};

/**
 * Get all settings by category
 */
settingsSchema.statics.getByCategory = async function (
  category: SettingsCategory
): Promise<ISettings[]> {
  return this.find({ category }).sort({ key: 1 });
};

/**
 * Get all public settings as a key-value map
 */
settingsSchema.statics.getPublicSettings = async function (): Promise<Record<string, unknown>> {
  const settings = await this.find({ isPublic: true });
  return settings.reduce(
    (acc: Record<string, unknown>, s: ISettings) => {
      acc[s.key] = s.value;
      return acc;
    },
    {} as Record<string, unknown>
  );
};

export const Settings = mongoose.model<ISettings, ISettingsModel>('Settings', settingsSchema);

/**
 * Default settings to seed
 */
export const defaultSettings: Omit<ISettings, '_id' | 'createdAt' | 'updatedAt' | 'updatedBy'>[] = [
  // General
  {
    key: 'site.name',
    value: 'Content Sphere Hub',
    category: 'general',
    label: 'Site Name',
    description: 'The name of your website',
    type: 'string',
    isPublic: true,
  },
  {
    key: 'site.description',
    value: 'A modern content management system',
    category: 'general',
    label: 'Site Description',
    description: 'A short description of your website',
    type: 'string',
    isPublic: true,
  },
  {
    key: 'site.url',
    value: 'http://localhost:3000',
    category: 'general',
    label: 'Site URL',
    description: 'The public URL of your website',
    type: 'string',
    isPublic: true,
  },
  {
    key: 'site.timezone',
    value: 'UTC',
    category: 'general',
    label: 'Timezone',
    description: 'Default timezone for dates',
    type: 'string',
    isPublic: false,
  },
  {
    key: 'site.dateFormat',
    value: 'YYYY-MM-DD',
    category: 'general',
    label: 'Date Format',
    description: 'Default date format',
    type: 'string',
    isPublic: true,
  },

  // SEO
  {
    key: 'seo.defaultTitle',
    value: 'Content Sphere Hub',
    category: 'seo',
    label: 'Default Meta Title',
    description: 'Default title for pages without custom title',
    type: 'string',
    isPublic: true,
  },
  {
    key: 'seo.titleSeparator',
    value: ' | ',
    category: 'seo',
    label: 'Title Separator',
    description: 'Separator between page title and site name',
    type: 'string',
    isPublic: true,
  },
  {
    key: 'seo.defaultDescription',
    value: 'Welcome to Content Sphere Hub - A modern CMS',
    category: 'seo',
    label: 'Default Meta Description',
    description: 'Default description for pages',
    type: 'string',
    isPublic: true,
  },
  {
    key: 'seo.robotsDefault',
    value: 'index, follow',
    category: 'seo',
    label: 'Default Robots',
    description: 'Default robots meta tag value',
    type: 'string',
    isPublic: false,
  },

  // Content
  {
    key: 'content.postsPerPage',
    value: 10,
    category: 'content',
    label: 'Posts Per Page',
    description: 'Number of posts to display per page',
    type: 'number',
    isPublic: true,
  },
  {
    key: 'content.excerptLength',
    value: 160,
    category: 'content',
    label: 'Excerpt Length',
    description: 'Maximum characters for auto-generated excerpts',
    type: 'number',
    isPublic: false,
  },
  {
    key: 'content.allowComments',
    value: true,
    category: 'content',
    label: 'Allow Comments',
    description: 'Enable comments on new content by default',
    type: 'boolean',
    isPublic: false,
  },
  {
    key: 'content.moderateComments',
    value: true,
    category: 'content',
    label: 'Moderate Comments',
    description: 'Require approval for new comments',
    type: 'boolean',
    isPublic: false,
  },

  // Media
  {
    key: 'media.maxUploadSize',
    value: 10485760, // 10MB
    category: 'media',
    label: 'Max Upload Size',
    description: 'Maximum file upload size in bytes',
    type: 'number',
    isPublic: false,
  },
  {
    key: 'media.allowedTypes',
    value: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    category: 'media',
    label: 'Allowed File Types',
    description: 'MIME types allowed for upload',
    type: 'array',
    isPublic: false,
  },
  {
    key: 'media.thumbnailSizes',
    value: { small: 150, medium: 400, large: 800 },
    category: 'media',
    label: 'Thumbnail Sizes',
    description: 'Sizes for generated thumbnails',
    type: 'json',
    isPublic: false,
  },

  // Security
  {
    key: 'security.sessionTimeout',
    value: 86400, // 24 hours in seconds
    category: 'security',
    label: 'Session Timeout',
    description: 'Session timeout in seconds',
    type: 'number',
    isPublic: false,
  },
  {
    key: 'security.maxLoginAttempts',
    value: 5,
    category: 'security',
    label: 'Max Login Attempts',
    description: 'Maximum failed login attempts before lockout',
    type: 'number',
    isPublic: false,
  },
  {
    key: 'security.lockoutDuration',
    value: 900, // 15 minutes
    category: 'security',
    label: 'Lockout Duration',
    description: 'Account lockout duration in seconds',
    type: 'number',
    isPublic: false,
  },

  // Appearance
  {
    key: 'appearance.theme',
    value: 'system',
    category: 'appearance',
    label: 'Default Theme',
    description: 'Default color theme (light, dark, system)',
    type: 'string',
    isPublic: true,
  },
  {
    key: 'appearance.primaryColor',
    value: '#3B82F6',
    category: 'appearance',
    label: 'Primary Color',
    description: 'Primary brand color',
    type: 'string',
    isPublic: true,
  },
  {
    key: 'appearance.logo',
    value: '',
    category: 'appearance',
    label: 'Site Logo',
    description: 'URL to site logo image',
    type: 'string',
    isPublic: true,
  },
  {
    key: 'appearance.favicon',
    value: '',
    category: 'appearance',
    label: 'Favicon',
    description: 'URL to favicon image',
    type: 'string',
    isPublic: true,
  },
] as unknown as Omit<ISettings, '_id' | 'createdAt' | 'updatedAt' | 'updatedBy'>[];
