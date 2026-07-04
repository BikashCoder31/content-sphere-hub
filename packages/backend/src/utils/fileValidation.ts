// Using dynamic import for ESM module
async function getFileType(buffer: Buffer): Promise<{ mime: string; ext: string } | undefined> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
  const fileTypeModule = require('file-type') as any;
  // Handle both ESM and CJS exports
  const fileTypeFromBuffer = fileTypeModule.fileTypeFromBuffer || fileTypeModule.default?.fileTypeFromBuffer;
  if (!fileTypeFromBuffer) {
    // Fall back to dynamic import for ESM
    const esmModule = await import('file-type' as string);
    return (esmModule as { fileTypeFromBuffer: (b: Buffer) => Promise<{ mime: string; ext: string } | undefined> }).fileTypeFromBuffer(buffer);
  }
  return fileTypeFromBuffer(buffer);
}

import {
  ALL_ALLOWED_MIME_TYPES,
  ALLOWED_MIME_TYPES,
  getFileSizeLimit,
  getMediaType,
} from '../storage/storage.interface.js';

/**
 * File validation error
 */
export class FileValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'FileValidationError';
  }
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  detectedMimeType?: string;
  declaredMimeType: string;
  mediaType: 'image' | 'document' | 'video' | 'audio' | 'other';
  error?: string;
  errorCode?: string;
}

/**
 * Validate file MIME type against declared type
 * Uses magic byte detection to prevent disguised files
 */
export async function validateFileMimeType(
  buffer: Buffer,
  declaredMimeType: string
): Promise<ValidationResult> {
  const mediaType = getMediaType(declaredMimeType);

  // Check if declared MIME type is allowed
  if (!ALL_ALLOWED_MIME_TYPES.includes(declaredMimeType as any)) {
    return {
      valid: false,
      declaredMimeType,
      mediaType,
      error: `File type '${declaredMimeType}' is not allowed`,
      errorCode: 'INVALID_MIME_TYPE',
    };
  }

  // Detect actual MIME type from file content (magic bytes)
  const detected = await getFileType(buffer);

  // Special case: text files and some documents don't have magic bytes
  const noMagicByteTypes = [
    'text/plain',
    'text/csv',
    'image/svg+xml',
  ];

  if (!detected) {
    // No magic bytes detected
    if (noMagicByteTypes.includes(declaredMimeType)) {
      // These types legitimately have no magic bytes
      return {
        valid: true,
        declaredMimeType,
        mediaType,
      };
    }

    // For other types, this might be suspicious
    // Check if it looks like text (for SVG, CSV, etc.)
    const isText = buffer.slice(0, 1000).every(byte => 
      byte === 0x09 || byte === 0x0A || byte === 0x0D || (byte >= 0x20 && byte <= 0x7E)
    );

    if (isText && declaredMimeType === 'image/svg+xml') {
      // Check for SVG content
      const content = buffer.toString('utf-8', 0, 1000).toLowerCase();
      if (content.includes('<svg') || content.includes('<?xml')) {
        return {
          valid: true,
          declaredMimeType,
          mediaType,
        };
      }
    }

    return {
      valid: false,
      declaredMimeType,
      mediaType,
      error: 'Could not detect file type. File may be corrupt or empty.',
      errorCode: 'UNDETECTABLE_TYPE',
    };
  }

  // Validate detected MIME type matches declared type (or is compatible)
  const mimeCompatibility: Record<string, string[]> = {
    'image/jpeg': ['image/jpeg'],
    'image/png': ['image/png'],
    'image/gif': ['image/gif'],
    'image/webp': ['image/webp'],
    'image/avif': ['image/avif'],
    'video/mp4': ['video/mp4'],
    'video/webm': ['video/webm'],
    'video/ogg': ['video/ogg'],
    'audio/mpeg': ['audio/mpeg'],
    'audio/wav': ['audio/wav', 'audio/x-wav'],
    'audio/ogg': ['audio/ogg'],
    'audio/webm': ['audio/webm'],
    'application/pdf': ['application/pdf'],
    'application/msword': ['application/msword'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip', // DOCX is a ZIP file
    ],
    'application/vnd.ms-excel': ['application/vnd.ms-excel'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip', // XLSX is a ZIP file
    ],
  };

  const compatibleTypes = mimeCompatibility[declaredMimeType] || [declaredMimeType];

  if (!compatibleTypes.includes(detected.mime)) {
    return {
      valid: false,
      detectedMimeType: detected.mime,
      declaredMimeType,
      mediaType,
      error: `File content doesn't match declared type. Expected '${declaredMimeType}', detected '${detected.mime}'`,
      errorCode: 'MIME_MISMATCH',
    };
  }

  // Check if detected type is in allowed list
  if (!ALL_ALLOWED_MIME_TYPES.includes(detected.mime as any)) {
    return {
      valid: false,
      detectedMimeType: detected.mime,
      declaredMimeType,
      mediaType,
      error: `Detected file type '${detected.mime}' is not allowed`,
      errorCode: 'INVALID_DETECTED_TYPE',
    };
  }

  return {
    valid: true,
    detectedMimeType: detected.mime,
    declaredMimeType,
    mediaType,
  };
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  mimeType: string
): { valid: boolean; maxSize: number; error?: string } {
  const maxSize = getFileSizeLimit(mimeType);

  if (size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const actualSizeMB = (size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      maxSize,
      error: `File size (${actualSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  return { valid: true, maxSize };
}

/**
 * Full file validation
 */
export async function validateFile(
  buffer: Buffer,
  originalName: string,
  declaredMimeType: string
): Promise<{
  valid: boolean;
  mediaType: 'image' | 'document' | 'video' | 'audio' | 'other';
  detectedMimeType?: string;
  errors: string[];
}> {
  const errors: string[] = [];

  // Validate MIME type
  const mimeResult = await validateFileMimeType(buffer, declaredMimeType);
  if (!mimeResult.valid && mimeResult.error) {
    errors.push(mimeResult.error);
  }

  // Validate file size
  const sizeResult = validateFileSize(buffer.length, declaredMimeType);
  if (!sizeResult.valid && sizeResult.error) {
    errors.push(sizeResult.error);
  }

  // Check filename for suspicious patterns
  const suspiciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.sh$/i,
    /\.ps1$/i,
    /\.php/i,
    /\.jsp$/i,
    /\.asp/i,
    /\.\./,
    /<script/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(originalName)) {
      errors.push('Filename contains suspicious patterns');
      break;
    }
  }

  return {
    valid: errors.length === 0,
    mediaType: mimeResult.mediaType,
    detectedMimeType: mimeResult.detectedMimeType,
    errors,
  };
}

/**
 * Get allowed extensions for a media type
 */
export function getAllowedExtensions(mediaType: 'image' | 'document' | 'video' | 'audio'): string[] {
  const extensionMap: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/svg+xml': ['.svg'],
    'image/avif': ['.avif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
    'video/ogg': ['.ogv'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'audio/ogg': ['.ogg'],
    'audio/webm': ['.weba'],
  };

  const mimeTypes = ALLOWED_MIME_TYPES[mediaType === 'document' ? 'documents' : `${mediaType}s` as keyof typeof ALLOWED_MIME_TYPES] || [];
  const extensions: string[] = [];

  for (const mime of mimeTypes) {
    const exts = extensionMap[mime];
    if (exts) {
      extensions.push(...exts);
    }
  }

  return Array.from(new Set(extensions));
}
