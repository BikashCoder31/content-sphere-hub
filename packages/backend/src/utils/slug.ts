/**
 * Slug generation utility
 * Generates URL-friendly slugs from titles with uniqueness support
 */

import { Content } from '../models/content.model.js';

/**
 * Options for slug generation
 */
export interface SlugOptions {
  /** Maximum length of the slug */
  maxLength?: number;
  /** ID to exclude when checking for uniqueness (for updates) */
  excludeId?: string;
  /** Custom separator (default: '-') */
  separator?: string;
}

/**
 * Generate a base slug from a title
 * Converts to lowercase, replaces spaces and special chars with hyphens
 */
export function generateBaseSlug(title: string, options: SlugOptions = {}): string {
  const { maxLength = 200, separator = '-' } = options;

  let slug = title
    // Convert to lowercase
    .toLowerCase()
    // Replace accented characters with ASCII equivalents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with separator
    .replace(/[\s_]+/g, separator)
    // Remove all non-alphanumeric characters except the separator
    .replace(new RegExp(`[^a-z0-9${separator}]`, 'g'), '')
    // Replace multiple separators with a single one
    .replace(new RegExp(`${separator}+`, 'g'), separator)
    // Remove leading/trailing separators
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');

  // Truncate to max length, but don't cut in the middle of a word
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    const lastSeparator = slug.lastIndexOf(separator);
    if (lastSeparator > maxLength * 0.7) {
      slug = slug.substring(0, lastSeparator);
    }
  }

  return slug || 'untitled';
}

/**
 * Check if a slug exists in the database
 */
export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  const query: { slug: string; _id?: { $ne: string } } = { slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existing = await Content.findOne(query).select('_id').lean();
  return !!existing;
}

/**
 * Generate a unique slug by appending a number if necessary
 */
export async function generateUniqueSlug(
  title: string,
  options: SlugOptions = {}
): Promise<string> {
  const baseSlug = generateBaseSlug(title, options);
  let slug = baseSlug;
  let counter = 1;
  const maxAttempts = 100;

  while (await slugExists(slug, options.excludeId)) {
    if (counter >= maxAttempts) {
      // If we've tried too many times, append a timestamp
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate a slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Sanitize an existing slug
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled';
}
