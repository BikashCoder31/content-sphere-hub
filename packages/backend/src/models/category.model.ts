import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Category document interface
 */
export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId;
  featuredImage?: string;
  sortOrder: number;
  isActive: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  contentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category model static methods
 */
interface ICategoryModel extends Model<ICategory> {
  findBySlug(slug: string): Promise<ICategory | null>;
  findActive(): Promise<ICategory[]>;
  getTree(): Promise<ICategory[]>;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
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
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    featuredImage: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seo: {
      metaTitle: { type: String, maxlength: 70 },
      metaDescription: { type: String, maxlength: 160 },
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
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parentId: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ name: 'text', description: 'text' });

// Virtual: parent (for population)
categorySchema.virtual('parent', {
  ref: 'Category',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true,
});

// Virtual: children (for population)
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
});

// Static: findBySlug
categorySchema.statics.findBySlug = function (slug: string): Promise<ICategory | null> {
  return this.findOne({ slug });
};

// Static: findActive
categorySchema.statics.findActive = function (): Promise<ICategory[]> {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

// Static: getTree (get all categories organized as tree)
categorySchema.statics.getTree = async function (): Promise<ICategory[]> {
  const categories = await this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();

  const map = new Map<string, ICategory & { children?: ICategory[] }>();
  const roots: (ICategory & { children?: ICategory[] })[] = [];

  // First pass: create map
  for (const cat of categories) {
    map.set(cat._id.toString(), { ...cat, children: [] });
  }

  // Second pass: build tree
  for (const cat of categories) {
    const node = map.get(cat._id.toString())!;
    if (cat.parentId) {
      const parent = map.get(cat.parentId.toString());
      if (parent) {
        parent.children!.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots as ICategory[];
};

// Pre-save: generate slug if not provided
categorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Prevent self-referencing parent
categorySchema.pre('save', function (next) {
  if (this.parentId && this.parentId.equals(this._id)) {
    next(new Error('Category cannot be its own parent'));
  } else {
    next();
  }
});

export const Category = mongoose.model<ICategory, ICategoryModel>('Category', categorySchema);
export default Category;
