import mongoose from 'mongoose';
import { Media, MediaFolder, IMedia, IMediaFolder, IMediaVariant } from '../models/media.model.js';
import {
  getStorageProvider,
  DEFAULT_IMAGE_VARIANTS,
  isImageMimeType,
  getMediaType,
} from '../storage/index.js';
import { validateFile } from '../utils/fileValidation.js';
import type {
  MediaListQueryParams,
  UpdateMediaInput,
  CreateMediaFolderInput,
  UpdateMediaFolderInput,
  BulkMediaOperation,
  MediaResponse,
  MediaUploadResponse,
} from '../schemas/media.schema.js';
import { logger } from '../config/logger.js';

/**
 * Media service error
 */
export class MediaError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'MediaError';
  }
}

/**
 * Paginated media response
 */
export interface MediaPaginatedResponse {
  data: MediaResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Transform media document to response
 */
function toMediaResponse(media: IMedia): MediaResponse {
  return {
    id: media._id.toString(),
    filename: media.filename,
    originalName: media.originalName,
    path: media.path,
    url: media.url,
    mimeType: media.mimeType,
    size: media.size,
    mediaType: media.mediaType,
    width: media.width,
    height: media.height,
    variants: media.variants?.map((v: IMediaVariant) => ({
      name: v.name,
      path: v.path,
      url: v.url,
      width: v.width,
      height: v.height,
      size: v.size,
      mimeType: v.mimeType,
    })),
    alt: media.alt,
    caption: media.caption,
    title: media.title,
    description: media.description,
    folderId: media.folderId?.toString(),
    uploadedBy: {
      id: media.uploadedBy.toString(),
      email: '', // Will be populated when needed
      displayName: undefined,
    },
    usageCount: media.usageCount,
    isDeleted: media.isDeleted,
    deletedAt: media.deletedAt?.toISOString(),
    createdAt: media.createdAt.toISOString(),
    updatedAt: media.updatedAt.toISOString(),
  };
}

/**
 * Upload a file
 */
export async function uploadMedia(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  uploaderId: string,
  folderId?: string
): Promise<MediaUploadResponse> {
  // Validate file
  const validation = await validateFile(buffer, originalName, mimeType);
  if (!validation.valid) {
    throw new MediaError(validation.errors.join('; '), 'VALIDATION_FAILED', 400);
  }

  const storage = getStorageProvider();
  const mediaType = getMediaType(mimeType);

  let result;
  if (isImageMimeType(mimeType)) {
    // Upload as image with variants
    result = await storage.uploadImage(
      buffer,
      originalName,
      mimeType,
      DEFAULT_IMAGE_VARIANTS,
      { directory: 'images' }
    );
  } else {
    // Upload as regular file
    result = await storage.upload(buffer, originalName, mimeType, {
      directory: mediaType === 'document' ? 'documents' : 'files',
    });
  }

  // Create media record
  const media = new Media({
    filename: result.filename,
    originalName: result.originalName,
    path: result.path,
    url: result.url,
    mimeType: result.mimeType,
    size: result.size,
    mediaType,
    width: 'width' in result ? result.width : undefined,
    height: 'height' in result ? result.height : undefined,
    variants:
      'variants' in result && result.variants
        ? Object.entries(result.variants).map(([name, v]) => {
            const variant = v as { path: string; url: string; width: number; height: number; size: number; mimeType: string };
            return {
              name,
              path: variant.path,
              url: variant.url,
              width: variant.width,
              height: variant.height,
              size: variant.size,
              mimeType: variant.mimeType,
            };
          })
        : undefined,
    uploadedBy: new mongoose.Types.ObjectId(uploaderId),
    folderId: folderId ? new mongoose.Types.ObjectId(folderId) : undefined,
  });

  await media.save();

  logger.info(`Media uploaded: ${media._id} (${originalName})`);

  return {
    id: media._id.toString(),
    filename: media.filename,
    originalName: media.originalName,
    path: media.path,
    url: media.url,
    mimeType: media.mimeType,
    size: media.size,
    mediaType: media.mediaType,
    width: media.width,
    height: media.height,
    variants: media.variants?.map((v: IMediaVariant) => ({
      name: v.name,
      path: v.path,
      url: v.url,
      width: v.width,
      height: v.height,
      size: v.size,
      mimeType: v.mimeType,
    })),
  };
}

/**
 * Get media by ID
 */
export async function getMediaById(id: string): Promise<MediaResponse | null> {
  const media = await Media.findById(id).populate('uploadedBy', 'email displayName');
  if (!media) {
    return null;
  }

  const response = toMediaResponse(media);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const populated = media.uploadedBy as any;
  if (populated && populated.email) {
    response.uploadedBy = {
      id: populated._id?.toString() || media.uploadedBy.toString(),
      email: populated.email,
      displayName: populated.displayName,
    };
  }

  return response;
}

/**
 * List media with pagination and filters
 */
export async function listMedia(query: MediaListQueryParams): Promise<MediaPaginatedResponse> {
  const {
    page,
    limit,
    search,
    mediaType,
    folderId,
    uploadedBy,
    includeDeleted,
    sortBy,
    sortOrder,
  } = query;
  const skip = (page - 1) * limit;

  // Build filter
  const filter: Record<string, unknown> = {};

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  if (mediaType) {
    filter.mediaType = mediaType;
  }

  if (folderId === null) {
    filter.folderId = { $exists: false };
  } else if (folderId) {
    filter.folderId = new mongoose.Types.ObjectId(folderId);
  }

  if (uploadedBy) {
    filter.uploadedBy = new mongoose.Types.ObjectId(uploadedBy);
  }

  if (search) {
    filter.$text = { $search: search };
  }

  // Execute queries
  const [media, total] = await Promise.all([
    Media.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'email displayName')
      .lean(),
    Media.countDocuments(filter),
  ]);

  return {
    data: media.map((m) => {
      const response = toMediaResponse(m as unknown as IMedia);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const populated = m.uploadedBy as any;
      if (populated && populated.email) {
        response.uploadedBy = {
          id: populated._id?.toString() || '',
          email: populated.email,
          displayName: populated.displayName,
        };
      }
      return response;
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update media metadata
 */
export async function updateMedia(
  id: string,
  input: UpdateMediaInput,
  userId: string
): Promise<MediaResponse> {
  const media = await Media.findById(id);
  if (!media) {
    throw new MediaError('Media not found', 'NOT_FOUND', 404);
  }

  // Update fields
  if (input.alt !== undefined) media.alt = input.alt;
  if (input.caption !== undefined) media.caption = input.caption;
  if (input.title !== undefined) media.title = input.title;
  if (input.description !== undefined) media.description = input.description;
  if (input.folderId !== undefined) {
    media.folderId = input.folderId ? new mongoose.Types.ObjectId(input.folderId) : undefined;
  }

  await media.save();

  logger.info(`Media updated: ${id}`);

  return toMediaResponse(media);
}

/**
 * Soft delete media
 */
export async function deleteMedia(id: string): Promise<void> {
  const media = await Media.findById(id);
  if (!media) {
    throw new MediaError('Media not found', 'NOT_FOUND', 404);
  }

  media.isDeleted = true;
  media.deletedAt = new Date();
  await media.save();

  logger.info(`Media soft-deleted: ${id}`);
}

/**
 * Restore soft-deleted media
 */
export async function restoreMedia(id: string): Promise<MediaResponse> {
  const media = await Media.findById(id);
  if (!media) {
    throw new MediaError('Media not found', 'NOT_FOUND', 404);
  }

  media.isDeleted = false;
  media.deletedAt = undefined;
  await media.save();

  logger.info(`Media restored: ${id}`);

  return toMediaResponse(media);
}

/**
 * Permanently delete media and files
 */
export async function permanentlyDeleteMedia(id: string): Promise<void> {
  const media = await Media.findById(id);
  if (!media) {
    throw new MediaError('Media not found', 'NOT_FOUND', 404);
  }

  const storage = getStorageProvider();

  // Collect all file paths
  const paths = [media.path];
  if (media.variants) {
    paths.push(...media.variants.map((v: IMediaVariant) => v.path));
  }

  // Delete files
  await storage.deleteMany(paths);

  // Delete record
  await Media.findByIdAndDelete(id);

  logger.info(`Media permanently deleted: ${id}`);
}

/**
 * Bulk operations on media
 */
export async function bulkMediaOperation(operation: BulkMediaOperation): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const id of operation.ids) {
    try {
      switch (operation.action) {
        case 'delete':
          await deleteMedia(id);
          break;
        case 'restore':
          await restoreMedia(id);
          break;
        case 'move':
          if (operation.folderId !== undefined) {
            await updateMedia(id, { folderId: operation.folderId || null }, '');
          }
          break;
      }
      success++;
    } catch (error) {
      failed++;
      logger.warn(`Bulk operation failed for media ${id}: ${error}`);
    }
  }

  return { success, failed };
}

// ==================== FOLDER OPERATIONS ====================

/**
 * Create folder slug
 */
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

/**
 * Get folder path
 */
async function getFolderPath(parentId?: string | null): Promise<string> {
  if (!parentId) {
    return '/';
  }

  const parent = await MediaFolder.findById(parentId);
  if (!parent) {
    throw new MediaError('Parent folder not found', 'PARENT_NOT_FOUND', 404);
  }

  return parent.path;
}

/**
 * Create media folder
 */
export async function createMediaFolder(
  input: CreateMediaFolderInput,
  userId: string
): Promise<IMediaFolder> {
  const slug = createSlug(input.name);
  const parentPath = await getFolderPath(input.parentId);
  const path = parentPath === '/' ? `/${slug}` : `${parentPath}/${slug}`;

  // Check for duplicate
  const existing = await MediaFolder.findOne({
    parentId: input.parentId ? new mongoose.Types.ObjectId(input.parentId) : null,
    slug,
    isDeleted: false,
  });

  if (existing) {
    throw new MediaError('Folder with this name already exists', 'DUPLICATE_FOLDER', 409);
  }

  const folder = new MediaFolder({
    name: input.name,
    slug,
    path,
    parentId: input.parentId ? new mongoose.Types.ObjectId(input.parentId) : undefined,
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  await folder.save();

  logger.info(`Media folder created: ${folder._id} (${input.name})`);

  return folder;
}

/**
 * List media folders
 */
export async function listMediaFolders(parentId?: string | null): Promise<IMediaFolder[]> {
  const filter: Record<string, unknown> = { isDeleted: false };

  if (parentId === null || parentId === undefined) {
    filter.parentId = { $exists: false };
  } else {
    filter.parentId = new mongoose.Types.ObjectId(parentId);
  }

  return MediaFolder.find(filter).sort({ name: 1 });
}

/**
 * Update media folder
 */
export async function updateMediaFolder(
  id: string,
  input: UpdateMediaFolderInput
): Promise<IMediaFolder> {
  const folder = await MediaFolder.findById(id);
  if (!folder) {
    throw new MediaError('Folder not found', 'NOT_FOUND', 404);
  }

  if (input.name !== undefined) {
    folder.name = input.name;
    folder.slug = createSlug(input.name);
    // Update path
    const parentPath = await getFolderPath(folder.parentId?.toString());
    folder.path = parentPath === '/' ? `/${folder.slug}` : `${parentPath}/${folder.slug}`;
  }

  if (input.parentId !== undefined) {
    // Prevent moving folder into itself or descendants
    if (input.parentId === id) {
      throw new MediaError('Cannot move folder into itself', 'INVALID_PARENT', 400);
    }
    folder.parentId = input.parentId ? new mongoose.Types.ObjectId(input.parentId) : undefined;
    const parentPath = await getFolderPath(input.parentId);
    folder.path = parentPath === '/' ? `/${folder.slug}` : `${parentPath}/${folder.slug}`;
  }

  await folder.save();

  logger.info(`Media folder updated: ${id}`);

  return folder;
}

/**
 * Delete media folder
 */
export async function deleteMediaFolder(id: string): Promise<void> {
  const folder = await MediaFolder.findById(id);
  if (!folder) {
    throw new MediaError('Folder not found', 'NOT_FOUND', 404);
  }

  // Check for contents
  const mediaCount = await Media.countDocuments({ folderId: new mongoose.Types.ObjectId(id), isDeleted: false });
  const subfolderCount = await MediaFolder.countDocuments({ parentId: new mongoose.Types.ObjectId(id), isDeleted: false });

  if (mediaCount > 0 || subfolderCount > 0) {
    throw new MediaError('Folder is not empty', 'FOLDER_NOT_EMPTY', 400);
  }

  folder.isDeleted = true;
  await folder.save();

  logger.info(`Media folder deleted: ${id}`);
}
