import mongoose, { Schema, Document, Model } from 'mongoose';
import type { ContentStatus, ContentVisibility, ContentType } from '@content-sphere-hub/shared';

/**
 * SEO metadata interface
 */
export interface ISeoMeta {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

/**
 * Content document interface
 */
export interface IContent extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt?: string;
  content: object; // TipTap JSONContent
  contentHtml?: string; // Rendered HTML for faster serving
  contentType: ContentType;
  status: ContentStatus;
  visibility: ContentVisibility;
  authorId: mongoose.Types.ObjectId;
  categoryIds: mongoose.Types.ObjectId[];
  tagIds: mongoose.Types.ObjectId[];
  featuredImage?: string;
  featuredImageAlt?: string;
  seo: ISeoMeta;
  publishedAt?: Date;
  scheduledAt?: Date;
  readingTime?: number; // in minutes
  wordCount?: number;
  viewCount: number;
  isFeatured: boolean;
  allowComments: boolean;
  sortOrder: number;
  parentId?: mongoose.Types.ObjectId;
  templateId?: string;
  customFields?: Map<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  publish(): Promise<void>;
  unpublish(): Promise<void>;
  calculateReadingTime(): number;
}

/**
 * Content model static methods
 */
interface IContentModel extends Model<IContent> {
  findBySlug(slug: string): Promise<IContent | null>;
  findPublished(options?: { limit?: number; skip?: number }): Promise<IContent[]>;
}

const seoMetaSchema = new Schema<ISeoMeta>(
  {
    metaTitle: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 160 },
    metaKeywords: { type: [String], default: [] },
    ogImage: { type: String },
    ogTitle: { type: String, maxlength: 70 },
    ogDescription: { type: String, maxlength: 200 },
    canonicalUrl: { type: String },
    noIndex: { type: Boolean, default: false },
    noFollow: { type: Boolean, default: false },
  },
  { _id: false }
);

const contentSchema = new Schema<IContent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: Schema.Types.Mixed,
      required: [true, 'Content is required'],
      default: { type: 'doc', content: [] },
    },
    contentHtml: {
      type: String,
      default: '',
    },
    contentType: {
      type: String,
      enum: ['article', 'page', 'news', 'blog', 'tutorial', 'documentation'],
      default: 'article',
    },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'scheduled', 'published', 'archived'],
      default: 'draft',
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'password_protected', 'members_only'],
      default: 'public',
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    categoryIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Category',
      default: [],
    },
    tagIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Tag',
      default: [],
    },
    featuredImage: {
      type: String,
      default: null,
    },
    featuredImageAlt: {
      type: String,
      maxlength: 200,
    },
    seo: {
      type: seoMetaSchema,
      default: () => ({}),
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    readingTime: {
      type: Number,
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Content',
      default: null,
    },
    templateId: {
      type: String,
      default: null,
    },
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
contentSchema.index({ slug: 1 }, { unique: true });
contentSchema.index({ status: 1, publishedAt: -1 });
contentSchema.index({ authorId: 1, createdAt: -1 });
contentSchema.index({ categoryIds: 1 });
contentSchema.index({ tagIds: 1 });
contentSchema.index({ contentType: 1, status: 1 });
contentSchema.index({ isFeatured: 1, publishedAt: -1 });
contentSchema.index({ title: 'text', excerpt: 'text', contentHtml: 'text' });

// Virtual: author (for population)
contentSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

// Virtual: categories (for population)
contentSchema.virtual('categories', {
  ref: 'Category',
  localField: 'categoryIds',
  foreignField: '_id',
});

// Virtual: tags (for population)
contentSchema.virtual('tags', {
  ref: 'Tag',
  localField: 'tagIds',
  foreignField: '_id',
});

// Static: findBySlug
contentSchema.statics.findBySlug = function (slug: string): Promise<IContent | null> {
  return this.findOne({ slug });
};

// Static: findPublished
contentSchema.statics.findPublished = function (
  options: { limit?: number; skip?: number } = {}
): Promise<IContent[]> {
  const { limit = 10, skip = 0 } = options;
  return this.find({ status: 'published', visibility: 'public' })
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Method: publish
contentSchema.methods.publish = async function (): Promise<void> {
  this.status = 'published';
  this.publishedAt = new Date();
  await this.save();
};

// Method: unpublish
contentSchema.methods.unpublish = async function (): Promise<void> {
  this.status = 'draft';
  await this.save();
};

// Method: calculateReadingTime
contentSchema.methods.calculateReadingTime = function (): number {
  const WORDS_PER_MINUTE = 200;
  return Math.ceil((this.wordCount || 0) / WORDS_PER_MINUTE);
};

// Pre-save: generate slug if not provided
contentSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

export const Content = mongoose.model<IContent, IContentModel>('Content', contentSchema);
export default Content;
