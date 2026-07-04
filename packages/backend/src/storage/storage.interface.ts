/**
 * Storage Provider Interface
 * Abstraction for file storage backends (local, S3, Cloudinary, etc.)
 */

export interface StorageFile {
  /** Original filename */
  originalName: string;
  /** Generated unique filename */
  filename: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Storage path/key */
  path: string;
  /** Public URL to access the file */
  url: string;
}

export interface UploadOptions {
  /** Target directory/prefix */
  directory?: string;
  /** Custom filename (without extension) */
  filename?: string;
  /** Whether to generate unique filename */
  unique?: boolean;
  /** Metadata to store with file */
  metadata?: Record<string, string>;
}

export interface ImageVariant {
  /** Variant name (e.g., 'thumbnail', 'small', 'medium', 'large') */
  name: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels (optional, maintains aspect ratio if omitted) */
  height?: number;
  /** Image quality (1-100) */
  quality?: number;
  /** Output format */
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
}

export interface ProcessedImage extends StorageFile {
  /** Image width */
  width: number;
  /** Image height */
  height: number;
  /** Generated variants */
  variants?: Record<string, StorageFile & { width: number; height: number }>;
}

export interface StorageProvider {
  /** Provider name */
  readonly name: string;

  /**
   * Upload a file to storage
   * @param buffer File buffer
   * @param originalName Original filename
   * @param mimeType MIME type
   * @param options Upload options
   * @returns Stored file info
   */
  upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<StorageFile>;

  /**
   * Upload and process an image with variants
   * @param buffer Image buffer
   * @param originalName Original filename
   * @param mimeType MIME type
   * @param variants Variant configurations
   * @param options Upload options
   * @returns Processed image with variants
   */
  uploadImage(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    variants: ImageVariant[],
    options?: UploadOptions
  ): Promise<ProcessedImage>;

  /**
   * Delete a file from storage
   * @param path File path/key
   */
  delete(path: string): Promise<void>;

  /**
   * Delete multiple files
   * @param paths Array of file paths/keys
   */
  deleteMany(paths: string[]): Promise<void>;

  /**
   * Check if a file exists
   * @param path File path/key
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get file info
   * @param path File path/key
   */
  getInfo(path: string): Promise<StorageFile | null>;

  /**
   * Get public URL for a file
   * @param path File path/key
   */
  getUrl(path: string): string;
}

/**
 * Default image variants for media library
 */
export const DEFAULT_IMAGE_VARIANTS: ImageVariant[] = [
  { name: 'thumbnail', width: 150, height: 150, quality: 80, format: 'webp' },
  { name: 'small', width: 320, quality: 85, format: 'webp' },
  { name: 'medium', width: 640, quality: 85, format: 'webp' },
  { name: 'large', width: 1280, quality: 90, format: 'webp' },
];

/**
 * Allowed MIME types for uploads
 */
export const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/avif',
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  videos: [
    'video/mp4',
    'video/webm',
    'video/ogg',
  ],
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
  ],
} as const;

export const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_MIME_TYPES.images,
  ...ALLOWED_MIME_TYPES.documents,
  ...ALLOWED_MIME_TYPES.videos,
  ...ALLOWED_MIME_TYPES.audio,
];

/**
 * File size limits in bytes
 */
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  document: 25 * 1024 * 1024, // 25MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 50 * 1024 * 1024, // 50MB
  default: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Get file size limit based on MIME type
 */
export function getFileSizeLimit(mimeType: string): number {
  if (ALLOWED_MIME_TYPES.images.includes(mimeType as typeof ALLOWED_MIME_TYPES.images[number])) {
    return FILE_SIZE_LIMITS.image;
  }
  if (ALLOWED_MIME_TYPES.documents.includes(mimeType as typeof ALLOWED_MIME_TYPES.documents[number])) {
    return FILE_SIZE_LIMITS.document;
  }
  if (ALLOWED_MIME_TYPES.videos.includes(mimeType as typeof ALLOWED_MIME_TYPES.videos[number])) {
    return FILE_SIZE_LIMITS.video;
  }
  if (ALLOWED_MIME_TYPES.audio.includes(mimeType as typeof ALLOWED_MIME_TYPES.audio[number])) {
    return FILE_SIZE_LIMITS.audio;
  }
  return FILE_SIZE_LIMITS.default;
}

/**
 * Check if MIME type is an image
 */
export function isImageMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.images.includes(mimeType as typeof ALLOWED_MIME_TYPES.images[number]);
}

/**
 * Get media type from MIME type
 */
export function getMediaType(mimeType: string): 'image' | 'document' | 'video' | 'audio' | 'other' {
  if (ALLOWED_MIME_TYPES.images.includes(mimeType as typeof ALLOWED_MIME_TYPES.images[number])) {
    return 'image';
  }
  if (ALLOWED_MIME_TYPES.documents.includes(mimeType as typeof ALLOWED_MIME_TYPES.documents[number])) {
    return 'document';
  }
  if (ALLOWED_MIME_TYPES.videos.includes(mimeType as typeof ALLOWED_MIME_TYPES.videos[number])) {
    return 'video';
  }
  if (ALLOWED_MIME_TYPES.audio.includes(mimeType as typeof ALLOWED_MIME_TYPES.audio[number])) {
    return 'audio';
  }
  return 'other';
}
