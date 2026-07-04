import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Image variant subdocument
 */
export interface IMediaVariant {
  name: string;
  path: string;
  url: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

/**
 * Media document interface
 */
export interface IMedia extends Document {
  _id: Types.ObjectId;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  mediaType: 'image' | 'document' | 'video' | 'audio' | 'other';
  width?: number;
  height?: number;
  variants?: IMediaVariant[];
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
  folderId?: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  usageCount: number;
  metadata?: Record<string, unknown>;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Media variant schema
 */
const mediaVariantSchema = new Schema<IMediaVariant>(
  {
    name: { type: String, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Media schema
 */
const mediaSchema = new Schema<IMedia>(
  {
    filename: {
      type: String,
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      index: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['image', 'document', 'video', 'audio', 'other'],
      required: true,
      index: true,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    variants: [mediaVariantSchema],
    alt: {
      type: String,
      maxlength: 200,
    },
    caption: {
      type: String,
      maxlength: 500,
    },
    title: {
      type: String,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'MediaFolder',
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
mediaSchema.index({ mediaType: 1, createdAt: -1 });
mediaSchema.index({ uploadedBy: 1, createdAt: -1 });
mediaSchema.index({ isDeleted: 1, createdAt: -1 });
mediaSchema.index({ originalName: 'text', title: 'text', alt: 'text', caption: 'text' });

// Virtual for full URL (can be overridden for CDN)
mediaSchema.virtual('fullUrl').get(function (this: IMedia) {
  return this.url;
});

// Method to get variant by name
mediaSchema.methods.getVariant = function (name: string): IMediaVariant | undefined {
  return this.variants?.find((v: IMediaVariant) => v.name === name);
};

// Method to get best variant for size
mediaSchema.methods.getBestVariant = function (maxWidth: number): IMediaVariant | IMedia {
  if (!this.variants || this.variants.length === 0) {
    return this as IMedia;
  }

  // Sort variants by width descending
  const sorted = [...this.variants].sort((a, b) => b.width - a.width);

  // Find largest variant that fits
  for (const variant of sorted) {
    if (variant.width <= maxWidth) {
      return variant;
    }
  }

  // Return smallest variant if all are too large
  return sorted[sorted.length - 1];
};

// Pre-save hook to set deletedAt
mediaSchema.pre('save', function (next) {
  if (this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  next();
});

export const Media = mongoose.model<IMedia>('Media', mediaSchema);

/**
 * Media folder document interface
 */
export interface IMediaFolder extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  parentId?: Types.ObjectId;
  path: string;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Media folder schema
 */
const mediaFolderSchema = new Schema<IMediaFolder>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'MediaFolder',
      index: true,
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique folder names within parent
mediaFolderSchema.index({ parentId: 1, slug: 1 }, { unique: true });

export const MediaFolder = mongoose.model<IMediaFolder>('MediaFolder', mediaFolderSchema);
