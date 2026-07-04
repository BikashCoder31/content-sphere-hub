import type { BaseEntity } from './user.types.js';
import type { MediaProvider } from '../constants/index.js';

/**
 * Image dimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Focal point for responsive cropping
 */
export interface FocalPoint {
  x: number;
  y: number;
}

/**
 * Generated thumbnails
 */
export interface Thumbnails {
  small: string;
  medium: string;
  large: string;
}

/**
 * Media model interface
 */
export interface IMedia extends BaseEntity {
  provider: MediaProvider;
  key: string;
  url: string;
  publicId?: string;
  bucket?: string;

  originalName: string;
  filename: string;
  mimeType: string;
  detectedMimeType: string;
  extension: string;
  size: number;

  checksum?: string;

  dimensions?: ImageDimensions;
  focalPoint?: FocalPoint;
  thumbnails?: Thumbnails;

  altText?: string;
  caption?: string;
  tags: string[];
  folderId?: string;

  uploadedById: string;
  usedInContentIds: string[];
}

/**
 * Media list item
 */
export interface MediaListItem {
  _id: string;
  url: string;
  thumbnails?: Thumbnails;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  dimensions?: ImageDimensions;
  altText?: string;
  createdAt: Date;
}

/**
 * Media upload response
 */
export interface MediaUploadResponse {
  _id: string;
  url: string;
  thumbnails?: Thumbnails;
  filename: string;
  mimeType: string;
  size: number;
}

/**
 * Media update input
 */
export interface UpdateMediaInput {
  altText?: string;
  caption?: string;
  tags?: string[];
  focalPoint?: FocalPoint;
}
