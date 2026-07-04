import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Tag document interface
 */
export interface ITag extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  contentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tag model static methods
 */
interface ITagModel extends Model<ITag> {
  findBySlug(slug: string): Promise<ITag | null>;
  findActive(): Promise<ITag[]>;
  findOrCreate(name: string): Promise<ITag>;
}

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      maxlength: [50, 'Tag name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    description: {
      type: String,
      maxlength: [255, 'Description cannot exceed 255 characters'],
    },
    color: {
      type: String,
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'],
      default: '#6B7280', // Gray
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    contentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
tagSchema.index({ slug: 1 }, { unique: true });
tagSchema.index({ isActive: 1, name: 1 });
tagSchema.index({ contentCount: -1 });
tagSchema.index({ name: 'text', description: 'text' });

// Static: findBySlug
tagSchema.statics.findBySlug = function (slug: string): Promise<ITag | null> {
  return this.findOne({ slug });
};

// Static: findActive
tagSchema.statics.findActive = function (): Promise<ITag[]> {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static: findOrCreate
tagSchema.statics.findOrCreate = async function (name: string): Promise<ITag> {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let tag = await this.findOne({ slug });
  if (!tag) {
    tag = await this.create({ name, slug });
  }
  return tag;
};

// Pre-save: generate slug if not provided
tagSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

export const Tag = mongoose.model<ITag, ITagModel>('Tag', tagSchema);
export default Tag;
