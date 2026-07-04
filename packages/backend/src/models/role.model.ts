import mongoose, { Schema, Document, Model } from 'mongoose';
import type { Permission } from '@content-sphere-hub/shared';

/**
 * Role document interface
 */
export interface IRole extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role model static methods
 */
interface IRoleModel extends Model<IRole> {
  findBySlug(slug: string): Promise<IRole | null>;
  getDefaultRole(): Promise<IRole | null>;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      maxlength: [50, 'Role name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Role slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_-]+$/, 'Slug can only contain lowercase letters, numbers, hyphens, and underscores'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [255, 'Description cannot exceed 255 characters'],
    },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: function (perms: string[]) {
          // Allow '*' for super admin, resource:* wildcards, or permission patterns
          // Patterns: resource:action or resource:action:scope (e.g., content:update:own)
          return perms.every(
            (p) => p === '*' || /^[a-z]+:\*$/.test(p) || /^[a-z]+:[a-z]+(:[a-z]+)?$/.test(p)
          );
        },
        message: 'Invalid permission format',
      },
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roleSchema.index({ slug: 1 }, { unique: true });
roleSchema.index({ isDefault: 1 });

// Static methods
roleSchema.statics.findBySlug = function (slug: string): Promise<IRole | null> {
  return this.findOne({ slug });
};

roleSchema.statics.getDefaultRole = function (): Promise<IRole | null> {
  return this.findOne({ isDefault: true });
};

// Prevent deletion of system roles
roleSchema.pre('deleteOne', { document: true, query: false }, function (next) {
  if (this.isSystem) {
    next(new Error('Cannot delete system role'));
  } else {
    next();
  }
});

// Ensure only one default role
roleSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await Role.updateMany({ _id: { $ne: this._id }, isDefault: true }, { isDefault: false });
  }
  next();
});

export const Role = mongoose.model<IRole, IRoleModel>('Role', roleSchema);
