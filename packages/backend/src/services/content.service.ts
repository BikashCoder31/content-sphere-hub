import mongoose from 'mongoose';
import { Content, IContent } from '../models/content.model.js';
import { User } from '../models/user.model.js';
import { generateUniqueSlug, isValidSlug, sanitizeSlug } from '../utils/slug.js';
import { sanitizeContent } from '../utils/sanitize.js';
import { CONTENT_STATUS, CONTENT_VISIBILITY, ROLES } from '@content-sphere-hub/shared';
import type {
  CreateContentInput,
  UpdateContentInput,
  ContentListQueryParams,
  UpdateContentStatusInput,
  BulkContentOperation,
} from '../schemas/content.schema.js';

/**
 * Content service error
 */
export class ContentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ContentError';
  }
}

/**
 * Content paginated response
 */
export interface ContentPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Content response type
 */
export interface ContentResponse {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: object;
  contentHtml?: string;
  contentType: string;
  status: string;
  visibility: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    avatar?: string;
  };
  categoryIds: string[];
  tagIds: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    noFollow?: boolean;
  };
  publishedAt?: Date;
  scheduledAt?: Date;
  readingTime?: number;
  wordCount?: number;
  viewCount: number;
  isFeatured: boolean;
  allowComments: boolean;
  sortOrder: number;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Content list item response
 */
export interface ContentListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentType: string;
  status: string;
  visibility: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
  };
  featuredImage?: string;
  publishedAt?: Date;
  viewCount: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transform content document to response
 */
function toContentResponse(content: IContent): ContentResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = content as any;
  const author = doc.author || {};

  return {
    id: content._id.toString(),
    title: content.title,
    slug: content.slug,
    excerpt: content.excerpt,
    content: content.content,
    contentHtml: content.contentHtml,
    contentType: content.contentType,
    status: content.status,
    visibility: content.visibility,
    author: {
      id: content.authorId.toString(),
      firstName: author.firstName || '',
      lastName: author.lastName || '',
      displayName: author.displayName,
      avatar: author.avatar,
    },
    categoryIds: content.categoryIds.map((id) => id.toString()),
    tagIds: content.tagIds.map((id) => id.toString()),
    featuredImage: content.featuredImage,
    featuredImageAlt: content.featuredImageAlt,
    seo: {
      metaTitle: content.seo?.metaTitle,
      metaDescription: content.seo?.metaDescription,
      metaKeywords: content.seo?.metaKeywords || [],
      ogImage: content.seo?.ogImage,
      ogTitle: content.seo?.ogTitle,
      ogDescription: content.seo?.ogDescription,
      canonicalUrl: content.seo?.canonicalUrl,
      noIndex: content.seo?.noIndex || false,
      noFollow: content.seo?.noFollow || false,
    },
    publishedAt: content.publishedAt,
    scheduledAt: content.scheduledAt,
    readingTime: content.readingTime,
    wordCount: content.wordCount,
    viewCount: content.viewCount,
    isFeatured: content.isFeatured,
    allowComments: content.allowComments,
    sortOrder: content.sortOrder,
    parentId: content.parentId?.toString(),
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };
}

/**
 * Transform content document to list item
 */
function toContentListItem(content: IContent): ContentListItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = content as any;
  const author = doc.author || {};

  return {
    id: content._id.toString(),
    title: content.title,
    slug: content.slug,
    excerpt: content.excerpt,
    contentType: content.contentType,
    status: content.status,
    visibility: content.visibility,
    author: {
      id: content.authorId.toString(),
      firstName: author.firstName || '',
      lastName: author.lastName || '',
      displayName: author.displayName,
    },
    featuredImage: content.featuredImage,
    publishedAt: content.publishedAt,
    viewCount: content.viewCount,
    isFeatured: content.isFeatured,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };
}

/**
 * Calculate word count from TipTap JSON content
 */
function calculateWordCount(content: object): number {
  const extractText = (node: { text?: string; content?: object[] }): string => {
    if (!node) return '';
    if (node.text) return node.text;
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join(' ');
    }
    return '';
  };

  const text = extractText(content as { text?: string; content?: object[] });
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(wordCount: number): number {
  const WORDS_PER_MINUTE = 200;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/**
 * Check if user can access content based on visibility and permissions
 */
export interface ContentAccessContext {
  userId?: string;
  userRoleSlug?: string;
  userPermissions?: string[];
}

export function canAccessContent(
  content: IContent,
  context: ContentAccessContext
): boolean {
  const { userId, userRoleSlug } = context;

  // Admins and Super Admins can access everything
  if (userRoleSlug === ROLES.SUPER_ADMIN || userRoleSlug === ROLES.ADMIN) {
    return true;
  }

  // Author can always access their own content
  if (userId && content.authorId.toString() === userId) {
    return true;
  }

  // Check visibility
  switch (content.visibility) {
    case CONTENT_VISIBILITY.PUBLIC:
      return content.status === CONTENT_STATUS.PUBLISHED;
    case CONTENT_VISIBILITY.PRIVATE:
      return false; // Only author/admin
    case CONTENT_VISIBILITY.MEMBERS_ONLY:
      return !!userId; // Must be authenticated
    case CONTENT_VISIBILITY.PASSWORD_PROTECTED:
      return false; // Requires password verification (handled separately)
    default:
      return false;
  }
}

/**
 * Check if user can edit content
 */
export function canEditContent(
  content: IContent,
  context: ContentAccessContext
): boolean {
  const { userId, userRoleSlug, userPermissions = [] } = context;

  // Super Admin and Admin can edit anything
  if (userRoleSlug === ROLES.SUPER_ADMIN || userRoleSlug === ROLES.ADMIN) {
    return true;
  }

  // Editor can edit any content
  if (userRoleSlug === ROLES.EDITOR) {
    return true;
  }

  // Author can edit their own content
  if (userId && content.authorId.toString() === userId) {
    return true;
  }

  // Check for explicit permission
  return userPermissions.includes('content:update');
}

/**
 * Check if user can delete content
 */
export function canDeleteContent(
  content: IContent,
  context: ContentAccessContext
): boolean {
  const { userId, userRoleSlug, userPermissions = [] } = context;

  // Super Admin and Admin can delete anything
  if (userRoleSlug === ROLES.SUPER_ADMIN || userRoleSlug === ROLES.ADMIN) {
    return true;
  }

  // Editor can delete any content
  if (userRoleSlug === ROLES.EDITOR) {
    return true;
  }

  // Author can delete their own content
  if (userId && content.authorId.toString() === userId) {
    return true;
  }

  // Check for explicit permission
  return userPermissions.includes('content:delete');
}

/**
 * Get paginated content list
 */
export async function getContents(
  query: ContentListQueryParams,
  context: ContentAccessContext
): Promise<ContentPaginatedResponse<ContentListItem>> {
  const {
    page,
    limit,
    search,
    status,
    contentType,
    visibility,
    authorId,
    categoryId,
    tagId,
    isFeatured,
    includeTrash,
    sortBy,
    sortOrder,
  } = query;
  const skip = (page - 1) * limit;
  const { userId, userRoleSlug } = context;

  // Build filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  // Handle trash filter
  if (!includeTrash) {
    filter.status = { $ne: CONTENT_STATUS.TRASH };
  }

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Content type filter
  if (contentType) {
    filter.contentType = contentType;
  }

  // Visibility filter
  if (visibility) {
    filter.visibility = visibility;
  }

  // Author filter
  if (authorId) {
    filter.authorId = new mongoose.Types.ObjectId(authorId);
  }

  // Category filter
  if (categoryId) {
    filter.categoryIds = new mongoose.Types.ObjectId(categoryId);
  }

  // Tag filter
  if (tagId) {
    filter.tagIds = new mongoose.Types.ObjectId(tagId);
  }

  // Featured filter
  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured;
  }

  // Search filter
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
    ];
  }

  // For non-admin users, filter by ownership or published public content
  const isAdmin =
    userRoleSlug === ROLES.SUPER_ADMIN ||
    userRoleSlug === ROLES.ADMIN ||
    userRoleSlug === ROLES.EDITOR;

  if (!isAdmin && userId) {
    // Authors can see their own content + published public content
    const accessFilter = {
      $or: [
        { authorId: new mongoose.Types.ObjectId(userId) },
        { status: CONTENT_STATUS.PUBLISHED, visibility: CONTENT_VISIBILITY.PUBLIC },
      ],
    };
    filter.$and = filter.$and || [];
    filter.$and.push(accessFilter);
  } else if (!isAdmin && !userId) {
    // Unauthenticated users can only see published public content
    filter.status = CONTENT_STATUS.PUBLISHED;
    filter.visibility = CONTENT_VISIBILITY.PUBLIC;
  }

  // Build sort
  const sort: Record<string, 1 | -1> = {
    [sortBy]: sortOrder === 'asc' ? 1 : -1,
  };

  // Execute query
  const [contents, total] = await Promise.all([
    Content.find(filter)
      .populate('author', 'firstName lastName displayName avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Content.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: contents.map((c) => toContentListItem(c as unknown as IContent)),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Get content by ID
 */
export async function getContentById(
  id: string,
  context: ContentAccessContext
): Promise<ContentResponse> {
  const content = await Content.findById(id).populate(
    'author',
    'firstName lastName displayName avatar'
  );

  if (!content) {
    throw new ContentError('Content not found', 'CONTENT_NOT_FOUND', 404);
  }

  // Check access
  const { userRoleSlug } = context;
  const isAdmin =
    userRoleSlug === ROLES.SUPER_ADMIN ||
    userRoleSlug === ROLES.ADMIN ||
    userRoleSlug === ROLES.EDITOR;

  if (!isAdmin && !canAccessContent(content, context)) {
    throw new ContentError('Access denied', 'ACCESS_DENIED', 403);
  }

  return toContentResponse(content);
}

/**
 * Get content by slug
 */
export async function getContentBySlug(
  slug: string,
  context: ContentAccessContext
): Promise<ContentResponse> {
  const content = await Content.findOne({ slug }).populate(
    'author',
    'firstName lastName displayName avatar'
  );

  if (!content) {
    throw new ContentError('Content not found', 'CONTENT_NOT_FOUND', 404);
  }

  // Check access
  const { userRoleSlug } = context;
  const isAdmin =
    userRoleSlug === ROLES.SUPER_ADMIN ||
    userRoleSlug === ROLES.ADMIN ||
    userRoleSlug === ROLES.EDITOR;

  if (!isAdmin && !canAccessContent(content, context)) {
    throw new ContentError('Access denied', 'ACCESS_DENIED', 403);
  }

  return toContentResponse(content);
}

/**
 * Create new content
 */
export async function createContent(
  input: CreateContentInput,
  authorId: string
): Promise<ContentResponse> {
  // Verify author exists
  const author = await User.findById(authorId);
  if (!author) {
    throw new ContentError('Author not found', 'AUTHOR_NOT_FOUND', 404);
  }

  // Generate or validate slug
  let slug: string;
  if (input.slug) {
    if (!isValidSlug(input.slug)) {
      throw new ContentError('Invalid slug format', 'INVALID_SLUG', 400);
    }
    // Check uniqueness
    const existing = await Content.findOne({ slug: input.slug });
    if (existing) {
      throw new ContentError('Slug already exists', 'SLUG_EXISTS', 409);
    }
    slug = input.slug;
  } else {
    slug = await generateUniqueSlug(input.title);
  }

  // Calculate word count and reading time
  const wordCount = calculateWordCount(input.content);
  const readingTime = calculateReadingTime(wordCount);

  // Set publishedAt if status is published
  let publishedAt: Date | undefined;
  if (input.status === CONTENT_STATUS.PUBLISHED) {
    publishedAt = new Date();
  }

  // Create content
  const content = new Content({
    title: input.title,
    slug,
    excerpt: input.excerpt,
    content: input.content,
    contentType: input.contentType,
    status: input.status,
    visibility: input.visibility,
    authorId: new mongoose.Types.ObjectId(authorId),
    categoryIds: input.categoryIds?.map((id) => new mongoose.Types.ObjectId(id)) || [],
    tagIds: input.tagIds?.map((id) => new mongoose.Types.ObjectId(id)) || [],
    featuredImage: input.featuredImage,
    featuredImageAlt: input.featuredImageAlt,
    seo: input.seo || {},
    isFeatured: input.isFeatured,
    allowComments: input.allowComments,
    sortOrder: input.sortOrder,
    parentId: input.parentId ? new mongoose.Types.ObjectId(input.parentId) : undefined,
    scheduledAt: input.scheduledAt,
    wordCount,
    readingTime,
    publishedAt,
  });

  await content.save();

  // Populate author and return
  await content.populate('author', 'firstName lastName displayName avatar');

  return toContentResponse(content);
}

/**
 * Update content
 */
export async function updateContent(
  id: string,
  input: UpdateContentInput,
  context: ContentAccessContext
): Promise<ContentResponse> {
  const content = await Content.findById(id);

  if (!content) {
    throw new ContentError('Content not found', 'CONTENT_NOT_FOUND', 404);
  }

  // Check permission
  if (!canEditContent(content, context)) {
    throw new ContentError('Permission denied', 'PERMISSION_DENIED', 403);
  }

  // Handle slug update
  if (input.slug && input.slug !== content.slug) {
    if (!isValidSlug(input.slug)) {
      throw new ContentError('Invalid slug format', 'INVALID_SLUG', 400);
    }
    const existing = await Content.findOne({ slug: input.slug, _id: { $ne: id } });
    if (existing) {
      throw new ContentError('Slug already exists', 'SLUG_EXISTS', 409);
    }
    content.slug = input.slug;
  }

  // Update fields
  if (input.title !== undefined) content.title = input.title;
  if (input.excerpt !== undefined) content.excerpt = input.excerpt;
  if (input.content !== undefined) {
    content.content = input.content;
    content.wordCount = calculateWordCount(input.content);
    content.readingTime = calculateReadingTime(content.wordCount);
  }
  if (input.contentType !== undefined) content.contentType = input.contentType;
  if (input.visibility !== undefined) content.visibility = input.visibility;
  if (input.categoryIds !== undefined) {
    content.categoryIds = input.categoryIds.map((id) => new mongoose.Types.ObjectId(id));
  }
  if (input.tagIds !== undefined) {
    content.tagIds = input.tagIds.map((id) => new mongoose.Types.ObjectId(id));
  }
  if (input.featuredImage !== undefined) content.featuredImage = input.featuredImage;
  if (input.featuredImageAlt !== undefined) content.featuredImageAlt = input.featuredImageAlt;
  if (input.seo !== undefined) {
    content.seo = { ...content.seo, ...input.seo };
  }
  if (input.isFeatured !== undefined) content.isFeatured = input.isFeatured;
  if (input.allowComments !== undefined) content.allowComments = input.allowComments;
  if (input.sortOrder !== undefined) content.sortOrder = input.sortOrder;
  if (input.parentId !== undefined) {
    content.parentId = input.parentId
      ? new mongoose.Types.ObjectId(input.parentId)
      : undefined;
  }
  if (input.scheduledAt !== undefined) content.scheduledAt = input.scheduledAt;

  // Handle status change
  if (input.status !== undefined && input.status !== content.status) {
    // Set publishedAt when publishing
    if (input.status === CONTENT_STATUS.PUBLISHED && !content.publishedAt) {
      content.publishedAt = new Date();
    }
    content.status = input.status;
  }

  await content.save();
  await content.populate('author', 'firstName lastName displayName avatar');

  return toContentResponse(content);
}

/**
 * Update content status
 */
export async function updateContentStatus(
  id: string,
  input: UpdateContentStatusInput,
  context: ContentAccessContext
): Promise<ContentResponse> {
  const content = await Content.findById(id);

  if (!content) {
    throw new ContentError('Content not found', 'CONTENT_NOT_FOUND', 404);
  }

  // Check permission
  if (!canEditContent(content, context)) {
    throw new ContentError('Permission denied', 'PERMISSION_DENIED', 403);
  }

  // Update status
  if (input.status === CONTENT_STATUS.PUBLISHED && !content.publishedAt) {
    content.publishedAt = new Date();
  }
  content.status = input.status;

  await content.save();
  await content.populate('author', 'firstName lastName displayName avatar');

  return toContentResponse(content);
}

/**
 * Move content to trash (soft delete)
 */
export async function trashContent(
  id: string,
  context: ContentAccessContext
): Promise<ContentResponse> {
  const content = await Content.findById(id);

  if (!content) {
    throw new ContentError('Content not found', 'CONTENT_NOT_FOUND', 404);
  }

  // Check permission
  if (!canDeleteContent(content, context)) {
    throw new ContentError('Permission denied', 'PERMISSION_DENIED', 403);
  }

  // Move to trash
  content.status = CONTENT_STATUS.TRASH;
  await content.save();
  await content.populate('author', 'firstName lastName displayName avatar');

  return toContentResponse(content);
}

/**
 * Restore content from trash
 */
export async function restoreContent(
  id: string,
  context: ContentAccessContext
): Promise<ContentResponse> {
  const content = await Content.findById(id);

  if (!content) {
    throw new ContentError('Content not found', 'CONTENT_NOT_FOUND', 404);
  }

  if (content.status !== CONTENT_STATUS.TRASH) {
    throw new ContentError('Content is not in trash', 'NOT_IN_TRASH', 400);
  }

  // Check permission
  if (!canDeleteContent(content, context)) {
    throw new ContentError('Permission denied', 'PERMISSION_DENIED', 403);
  }

  // Restore to draft
  content.status = CONTENT_STATUS.DRAFT;
  await content.save();
  await content.populate('author', 'firstName lastName displayName avatar');

  return toContentResponse(content);
}

/**
 * Permanently delete content
 */
export async function deleteContent(
  id: string,
  context: ContentAccessContext
): Promise<void> {
  const content = await Content.findById(id);

  if (!content) {
    throw new ContentError('Content not found', 'CONTENT_NOT_FOUND', 404);
  }

  // Check permission - only admins can permanently delete
  const { userRoleSlug } = context;
  if (userRoleSlug !== ROLES.SUPER_ADMIN && userRoleSlug !== ROLES.ADMIN) {
    throw new ContentError('Only administrators can permanently delete content', 'PERMISSION_DENIED', 403);
  }

  await content.deleteOne();
}

/**
 * Bulk content operations
 */
export async function bulkContentOperation(
  input: BulkContentOperation,
  context: ContentAccessContext
): Promise<{ success: number; failed: number; errors: string[] }> {
  const { ids, action } = input;
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const id of ids) {
    try {
      switch (action) {
        case 'trash':
          await trashContent(id, context);
          break;
        case 'restore':
          await restoreContent(id, context);
          break;
        case 'delete':
          await deleteContent(id, context);
          break;
        case 'publish':
          await updateContentStatus(id, { status: CONTENT_STATUS.PUBLISHED }, context);
          break;
        case 'unpublish':
          await updateContentStatus(id, { status: CONTENT_STATUS.DRAFT }, context);
          break;
      }
      success++;
    } catch (error) {
      failed++;
      errors.push(`${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { success, failed, errors };
}

/**
 * Check slug availability
 */
export async function checkSlugAvailability(
  slug: string,
  excludeId?: string
): Promise<{ available: boolean; suggestion?: string }> {
  const sanitized = sanitizeSlug(slug);
  
  const query: { slug: string; _id?: { $ne: mongoose.Types.ObjectId } } = { slug: sanitized };
  if (excludeId) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }

  const existing = await Content.findOne(query).select('_id').lean();

  if (!existing) {
    return { available: true };
  }

  // Generate suggestion
  const suggestion = await generateUniqueSlug(sanitized, { excludeId });
  return { available: false, suggestion };
}

/**
 * Increment view count
 */
export async function incrementViewCount(id: string): Promise<void> {
  await Content.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
}
