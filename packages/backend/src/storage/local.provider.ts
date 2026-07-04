import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp');
import {
  StorageProvider,
  StorageFile,
  UploadOptions,
  ImageVariant,
  ProcessedImage,
} from './storage.interface.js';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';

/**
 * Local filesystem storage provider
 * Stores files in a configured directory and serves them via Express static
 */
export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local';
  private readonly baseDir: string;
  private readonly baseUrl: string;

  constructor() {
    // Default to ./uploads in project root, can be overridden via config
    this.baseDir = config.upload.localPath || path.join(process.cwd(), 'uploads');
    this.baseUrl = '/uploads';
  }

  /**
   * Ensure directory exists
   */
  private async ensureDir(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory already exists, ignore
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Generate unique filename
   */
  private generateFilename(originalName: string, unique: boolean = true): string {
    const ext = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    if (unique) {
      const uuid = randomUUID().split('-')[0]; // Short UUID
      return `${baseName}-${uuid}${ext}`;
    }
    return `${baseName}${ext}`;
  }

  /**
   * Get full file path
   */
  private getFilePath(directory: string, filename: string): string {
    return path.join(this.baseDir, directory, filename);
  }

  /**
   * Upload a file to local storage
   */
  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<StorageFile> {
    const directory = options.directory || 'files';
    const filename = options.filename
      ? `${options.filename}${path.extname(originalName)}`
      : this.generateFilename(originalName, options.unique !== false);

    const filePath = this.getFilePath(directory, filename);
    const relativePath = path.join(directory, filename).replace(/\\/g, '/');

    // Ensure directory exists
    await this.ensureDir(path.dirname(filePath));

    // Write file
    await fs.writeFile(filePath, buffer);

    logger.debug(`Uploaded file: ${relativePath}`);

    return {
      originalName,
      filename,
      mimeType,
      size: buffer.length,
      path: relativePath,
      url: this.getUrl(relativePath),
    };
  }

  /**
   * Upload and process an image with variants
   */
  async uploadImage(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    variants: ImageVariant[],
    options: UploadOptions = {}
  ): Promise<ProcessedImage> {
    const directory = options.directory || 'images';
    const baseFilename = options.filename
      ? options.filename
      : this.generateFilename(originalName, options.unique !== false).replace(/\.[^.]+$/, '');

    // Ensure directory exists
    await this.ensureDir(path.join(this.baseDir, directory));

    // Get original image metadata
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Determine original format extension
    const ext = path.extname(originalName).toLowerCase();
    const originalFilename = `${baseFilename}${ext}`;
    const originalPath = path.join(directory, originalFilename).replace(/\\/g, '/');

    // Save original (optimized)
    let processedBuffer: Buffer;
    if (mimeType === 'image/svg+xml') {
      // Don't process SVGs
      processedBuffer = buffer;
    } else {
      // Optimize original
      processedBuffer = await sharp(buffer)
        .rotate() // Auto-rotate based on EXIF
        .toBuffer();
    }

    await fs.writeFile(this.getFilePath(directory, originalFilename), processedBuffer);

    // Generate variants
    const processedVariants: ProcessedImage['variants'] = {};

    for (const variant of variants) {
      // Skip variant generation for SVGs
      if (mimeType === 'image/svg+xml') {
        continue;
      }

      // Skip if original is smaller than variant
      if (originalWidth <= variant.width && (!variant.height || originalHeight <= variant.height)) {
        continue;
      }

      const variantExt = variant.format ? `.${variant.format}` : ext;
      const variantFilename = `${baseFilename}-${variant.name}${variantExt}`;
      const variantPath = path.join(directory, variantFilename).replace(/\\/g, '/');

      try {
        let sharpInstance = sharp(buffer)
          .rotate() // Auto-rotate based on EXIF
          .resize(variant.width, variant.height, {
            fit: variant.height ? 'cover' : 'inside',
            withoutEnlargement: true,
          });

        // Set output format
        switch (variant.format) {
          case 'webp':
            sharpInstance = sharpInstance.webp({ quality: variant.quality || 85 });
            break;
          case 'avif':
            sharpInstance = sharpInstance.avif({ quality: variant.quality || 80 });
            break;
          case 'png':
            sharpInstance = sharpInstance.png({ quality: variant.quality || 90 });
            break;
          case 'jpeg':
          default:
            sharpInstance = sharpInstance.jpeg({ quality: variant.quality || 85 });
        }

        const variantBuffer = await sharpInstance.toBuffer();
        const variantMetadata = await sharp(variantBuffer).metadata();

        await fs.writeFile(this.getFilePath(directory, variantFilename), variantBuffer);

        processedVariants[variant.name] = {
          originalName: variantFilename,
          filename: variantFilename,
          mimeType: `image/${variant.format || 'jpeg'}`,
          size: variantBuffer.length,
          path: variantPath,
          url: this.getUrl(variantPath),
          width: variantMetadata.width || variant.width,
          height: variantMetadata.height || 0,
        };

        logger.debug(`Generated variant: ${variant.name} (${variantMetadata.width}x${variantMetadata.height})`);
      } catch (error) {
        logger.warn(`Failed to generate variant ${variant.name}: ${error}`);
      }
    }

    logger.debug(`Uploaded image: ${originalPath} with ${Object.keys(processedVariants).length} variants`);

    return {
      originalName,
      filename: originalFilename,
      mimeType,
      size: processedBuffer.length,
      path: originalPath,
      url: this.getUrl(originalPath),
      width: originalWidth,
      height: originalHeight,
      variants: Object.keys(processedVariants).length > 0 ? processedVariants : undefined,
    };
  }

  /**
   * Delete a file from storage
   */
  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      await fs.unlink(fullPath);
      logger.debug(`Deleted file: ${filePath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, consider it deleted
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMany(paths: string[]): Promise<void> {
    await Promise.all(paths.map(p => this.delete(p)));
  }

  /**
   * Check if a file exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.baseDir, filePath));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file info
   */
  async getInfo(filePath: string): Promise<StorageFile | null> {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      const stats = await fs.stat(fullPath);
      const filename = path.basename(filePath);
      
      // Determine MIME type from extension
      const ext = path.extname(filename).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.avif': 'image/avif',
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
      };

      return {
        originalName: filename,
        filename,
        mimeType: mimeMap[ext] || 'application/octet-stream',
        size: stats.size,
        path: filePath,
        url: this.getUrl(filePath),
      };
    } catch {
      return null;
    }
  }

  /**
   * Get public URL for a file
   */
  getUrl(filePath: string): string {
    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');
    return `${this.baseUrl}/${normalizedPath}`;
  }

  /**
   * Get the base directory
   */
  getBaseDir(): string {
    return this.baseDir;
  }
}

// Singleton instance
let storageProvider: StorageProvider | null = null;

/**
 * Get the storage provider instance
 */
export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    // For now, always use local storage
    // In the future, this can be switched based on config
    storageProvider = new LocalStorageProvider();
  }
  return storageProvider;
}

/**
 * Set a custom storage provider (for testing or alternative backends)
 */
export function setStorageProvider(provider: StorageProvider): void {
  storageProvider = provider;
}
