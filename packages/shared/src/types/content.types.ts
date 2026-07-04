import type { BaseEntity } from './user.types.js';
import type { ContentStatus, ContentVisibility, ContentType } from '../constants/index.js';

/**
 * TipTap JSON content structure
 * This is a simplified version - the full type comes from @tiptap/core
 */
export interface JSONContent {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  text?: string;
}

/**
 * Content workflow state
 */
export interface ContentWorkflow {
  currentStage: string;
  assignedToId?: string;
  dueDate?: Date;
  reviewerIds: string[];
  approvedById?: string;
  approvedAt?: Date;
  comments: Array<{
    userId: string;
    text: string;
    createdAt: Date;
  }>;
}

/**
 * Content scheduling
 */
export interface ContentScheduling {
  publishAt?: Date;
  expireAt?: Date;
}

/**
 * Content SEO settings
 */
export interface ContentSeo {
  title?: string;
  description?: string;
  keywords: string[];
  canonical?: string;
  noIndex: boolean;
  noFollow: boolean;
  ogImage?: string;
  structuredData?: Record<string, unknown>;
}

/**
 * Content settings
 */
export interface ContentSettings {
  allowComments: boolean;
  showAuthor: boolean;
  showDate: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  customFields: Record<string, unknown>;
}

/**
 * Content statistics
 */
export interface ContentStats {
  views: number;
  uniqueViews: number;
  shares: number;
  comments: number;
  readTime: number;
  wordCount: number;
}

/**
 * Content lock (for concurrent editing prevention)
 */
export interface ContentLock {
  userId: string;
  lockedAt: Date;
  expiresAt: Date;
}

/**
 * Content series
 */
export interface ContentSeries {
  name: string;
  order: number;
}

/**
 * Content model interface
 */
export interface IContent extends BaseEntity {
  title: string;
  slug: string;
  excerpt?: string;

  // Editor content
  bodyJson: JSONContent;
  bodyHtml: string;
  bodyText: string;
  bodyMarkdown?: string;

  contentType: ContentType | string;
  status: ContentStatus;
  visibility: ContentVisibility;
  passwordHash?: string;

  // Relationships
  authorId: string;
  contributorIds: string[];
  categoryIds: string[];
  tagIds: string[];
  featuredImageId?: string;

  // Nested objects
  workflow: ContentWorkflow;
  scheduling: ContentScheduling;
  seo: ContentSeo;
  settings: ContentSettings;
  stats: ContentStats;

  // Optional
  relatedContentIds: string[];
  series?: ContentSeries;
  lock?: ContentLock;

  version: number;
  publishedAt?: Date;
  deletedAt?: Date;
}

/**
 * Content list item (for listing pages)
 */
export interface ContentListItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentType: string;
  status: ContentStatus;
  authorId: string;
  featuredImageId?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    views: number;
    comments: number;
  };
}

/**
 * Content create input
 */
export interface CreateContentInput {
  title: string;
  slug?: string;
  excerpt?: string;
  bodyJson: JSONContent;
  contentType: ContentType | string;
  status?: ContentStatus;
  visibility?: ContentVisibility;
  categoryIds?: string[];
  tagIds?: string[];
  featuredImageId?: string;
  seo?: Partial<ContentSeo>;
  settings?: Partial<ContentSettings>;
  scheduling?: Partial<ContentScheduling>;
}

/**
 * Content update input
 */
export interface UpdateContentInput extends Partial<CreateContentInput> {
  _id: string;
}
