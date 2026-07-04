import { Settings } from '../models/settings.model.js';
import logger from '../config/logger.js';

/**
 * Default settings configuration
 */
const defaultSettings = [
  // General
  {
    key: 'site.name',
    value: 'Content Sphere Hub',
    type: 'string' as const,
    category: 'general',
    label: 'Site Name',
    description: 'The name of your website',
    isPublic: true,
    isEditable: true,
  },
  {
    key: 'site.tagline',
    value: 'Enterprise Content Management',
    type: 'string' as const,
    category: 'general',
    label: 'Site Tagline',
    description: 'A short description of your website',
    isPublic: true,
    isEditable: true,
  },
  {
    key: 'site.description',
    value: 'A powerful and flexible content management system',
    type: 'string' as const,
    category: 'general',
    label: 'Site Description',
    description: 'Full description for SEO',
    isPublic: true,
    isEditable: true,
  },
  {
    key: 'site.logo',
    value: '',
    type: 'string' as const,
    category: 'general',
    label: 'Site Logo',
    description: 'URL to the site logo',
    isPublic: true,
    isEditable: true,
  },
  {
    key: 'site.favicon',
    value: '',
    type: 'string' as const,
    category: 'general',
    label: 'Favicon',
    description: 'URL to the favicon',
    isPublic: true,
    isEditable: true,
  },

  // Content
  {
    key: 'content.posts_per_page',
    value: 10,
    type: 'number' as const,
    category: 'content',
    label: 'Posts Per Page',
    description: 'Number of posts to display per page',
    isPublic: true,
    isEditable: true,
  },
  {
    key: 'content.excerpt_length',
    value: 150,
    type: 'number' as const,
    category: 'content',
    label: 'Excerpt Length',
    description: 'Maximum characters for auto-generated excerpts',
    isPublic: false,
    isEditable: true,
  },
  {
    key: 'content.allow_comments',
    value: true,
    type: 'boolean' as const,
    category: 'content',
    label: 'Allow Comments',
    description: 'Enable comments on new content by default',
    isPublic: false,
    isEditable: true,
  },
  {
    key: 'content.moderate_comments',
    value: true,
    type: 'boolean' as const,
    category: 'content',
    label: 'Moderate Comments',
    description: 'Require approval for comments before publishing',
    isPublic: false,
    isEditable: true,
  },

  // Media
  {
    key: 'media.max_upload_size',
    value: 10485760,
    type: 'number' as const,
    category: 'media',
    label: 'Max Upload Size',
    description: 'Maximum file upload size in bytes (default: 10MB)',
    isPublic: false,
    isEditable: true,
  },
  {
    key: 'media.allowed_types',
    value: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    type: 'array' as const,
    category: 'media',
    label: 'Allowed File Types',
    description: 'MIME types allowed for upload',
    isPublic: false,
    isEditable: true,
  },
  {
    key: 'media.image_quality',
    value: 85,
    type: 'number' as const,
    category: 'media',
    label: 'Image Quality',
    description: 'JPEG/WebP compression quality (1-100)',
    isPublic: false,
    isEditable: true,
  },

  // SEO
  {
    key: 'seo.meta_title_suffix',
    value: ' | Content Sphere Hub',
    type: 'string' as const,
    category: 'seo',
    label: 'Meta Title Suffix',
    description: 'Appended to all page titles',
    isPublic: true,
    isEditable: true,
  },
  {
    key: 'seo.default_og_image',
    value: '',
    type: 'string' as const,
    category: 'seo',
    label: 'Default OG Image',
    description: 'Default social media sharing image',
    isPublic: true,
    isEditable: true,
  },

  // Users
  {
    key: 'users.allow_registration',
    value: true,
    type: 'boolean' as const,
    category: 'users',
    label: 'Allow Registration',
    description: 'Allow new user registrations',
    isPublic: true,
    isEditable: true,
  },
  {
    key: 'users.require_email_verification',
    value: true,
    type: 'boolean' as const,
    category: 'users',
    label: 'Require Email Verification',
    description: 'Require email verification for new accounts',
    isPublic: false,
    isEditable: true,
  },
  {
    key: 'users.default_role',
    value: 'contributor',
    type: 'string' as const,
    category: 'users',
    label: 'Default Role',
    description: 'Role assigned to new users',
    isPublic: false,
    isEditable: true,
  },
];

/**
 * Seed default settings
 */
export async function seedSettings(): Promise<void> {
  logger.info('Seeding default settings...');

  for (const setting of defaultSettings) {
    const existing = await Settings.findOne({ key: setting.key });

    if (!existing) {
      await Settings.create(setting);
      logger.info(`Created setting: ${setting.key}`);
    } else {
      logger.info(`Skipped setting (exists): ${setting.key}`);
    }
  }

  logger.info('Settings seeding completed');
}

export default seedSettings;
