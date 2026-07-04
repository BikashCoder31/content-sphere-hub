import mongoose from 'mongoose';
import { Tag, ITag } from '../models/tag.model.js';
import {
  CreateTagInput,
  UpdateTagInput,
  TagListQuery,
  BulkTagOperation,
} from '../schemas/taxonomy.schema.js';

/**
 * Custom error for tag operations
 */
export class TagError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'TagError';
  }
}

/**
 * Tag response type
 */
export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  isActive: boolean;
  contentCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tag list response type
 */
export interface TagListResponse {
  success: boolean;
  data: TagResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Convert tag document to response
 */
function toTagResponse(tag: ITag): TagResponse {
  return {
    id: tag._id.toString(),
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    color: tag.color || '#6B7280',
    isActive: tag.isActive,
    contentCount: tag.contentCount,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };
}

/**
 * Generate slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Create a new tag
 */
export async function createTag(input: CreateTagInput): Promise<TagResponse> {
  // Generate slug if not provided
  const slug = input.slug || generateSlug(input.name);

  // Check for duplicate slug
  const existing = await Tag.findOne({ slug });
  if (existing) {
    throw new TagError('A tag with this slug already exists', 'DUPLICATE_SLUG', 409);
  }

  const tag = await Tag.create({
    ...input,
    slug,
  });

  return toTagResponse(tag);
}

/**
 * Get tag by ID
 */
export async function getTagById(id: string): Promise<TagResponse> {
  const tag = await Tag.findById(id);
  if (!tag) {
    throw new TagError('Tag not found', 'NOT_FOUND', 404);
  }
  return toTagResponse(tag);
}

/**
 * Get tag by slug
 */
export async function getTagBySlug(slug: string): Promise<TagResponse> {
  const tag = await Tag.findOne({ slug });
  if (!tag) {
    throw new TagError('Tag not found', 'NOT_FOUND', 404);
  }
  return toTagResponse(tag);
}

/**
 * List tags with filters
 */
export async function listTags(query: TagListQuery): Promise<TagListResponse> {
  const { search, isActive, page, limit, sortBy, sortOrder } = query;

  // Build filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  // Count total
  const total = await Tag.countDocuments(filter);

  // Build sort
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Fetch with pagination
  const tags = await Tag.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    success: true,
    data: tags.map(toTagResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update tag
 */
export async function updateTag(id: string, input: UpdateTagInput): Promise<TagResponse> {
  const tag = await Tag.findById(id);
  if (!tag) {
    throw new TagError('Tag not found', 'NOT_FOUND', 404);
  }

  // Check slug uniqueness if changed
  if (input.slug && input.slug !== tag.slug) {
    const existing = await Tag.findOne({ slug: input.slug, _id: { $ne: id } });
    if (existing) {
      throw new TagError('A tag with this slug already exists', 'DUPLICATE_SLUG', 409);
    }
  }

  // Update fields
  Object.assign(tag, input);
  await tag.save();

  return toTagResponse(tag);
}

/**
 * Delete tag
 */
export async function deleteTag(id: string): Promise<void> {
  const tag = await Tag.findById(id);
  if (!tag) {
    throw new TagError('Tag not found', 'NOT_FOUND', 404);
  }

  // Check if has content
  if (tag.contentCount > 0) {
    throw new TagError(
      `Cannot delete tag with ${tag.contentCount} content items. Remove tag from content first.`,
      'HAS_CONTENT',
      400
    );
  }

  await tag.deleteOne();
}

/**
 * Bulk tag operations
 */
export async function bulkTagOperation(
  operation: BulkTagOperation
): Promise<{ success: number; failed: number }> {
  const { action, ids, targetId } = operation;
  let success = 0;
  let failed = 0;

  switch (action) {
    case 'delete':
      for (const id of ids) {
        try {
          await deleteTag(id);
          success++;
        } catch {
          failed++;
        }
      }
      break;

    case 'activate':
      await Tag.updateMany(
        { _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } },
        { $set: { isActive: true } }
      );
      success = ids.length;
      break;

    case 'deactivate':
      await Tag.updateMany(
        { _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } },
        { $set: { isActive: false } }
      );
      success = ids.length;
      break;

    case 'merge':
      if (!targetId) {
        throw new TagError('Target tag ID required for merge', 'MISSING_TARGET', 400);
      }
      // TODO: Implement merge - update all content with source tags to use target tag
      // Then delete source tags
      throw new TagError('Merge operation not yet implemented', 'NOT_IMPLEMENTED', 501);
  }

  return { success, failed };
}

/**
 * Check if slug is available
 */
export async function checkTagSlugAvailability(
  slug: string,
  excludeId?: string
): Promise<{ available: boolean; suggestion?: string }> {
  const filter: { slug: string; _id?: { $ne: mongoose.Types.ObjectId } } = { slug };
  if (excludeId) {
    filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }

  const existing = await Tag.findOne(filter);
  if (!existing) {
    return { available: true };
  }

  // Generate suggestion
  let counter = 1;
  let suggestion = `${slug}-${counter}`;
  while (await Tag.findOne({ slug: suggestion })) {
    counter++;
    suggestion = `${slug}-${counter}`;
  }

  return { available: false, suggestion };
}

/**
 * Find or create tags from names
 */
export async function findOrCreateTags(names: string[]): Promise<TagResponse[]> {
  const tags: TagResponse[] = [];

  for (const name of names) {
    const tag = await Tag.findOrCreate(name.trim());
    tags.push(toTagResponse(tag));
  }

  return tags;
}

/**
 * Get popular tags
 */
export async function getPopularTags(limit: number = 20): Promise<TagResponse[]> {
  const tags = await Tag.find({ isActive: true, contentCount: { $gt: 0 } })
    .sort({ contentCount: -1 })
    .limit(limit);

  return tags.map(toTagResponse);
}
