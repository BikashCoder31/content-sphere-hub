import mongoose, { Document, Schema, Model, Types } from 'mongoose';

/**
 * Activity action types
 */
export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'publish'
  | 'unpublish'
  | 'login'
  | 'logout'
  | 'upload'
  | 'download'
  | 'view'
  | 'comment'
  | 'approve'
  | 'reject';

/**
 * Activity resource types
 */
export type ActivityResource =
  | 'content'
  | 'media'
  | 'category'
  | 'tag'
  | 'user'
  | 'role'
  | 'settings'
  | 'comment'
  | 'session';

/**
 * Activity log document interface
 */
export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  action: ActivityAction;
  resource: ActivityResource;
  resourceId?: Types.ObjectId;
  resourceTitle?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * Activity log model interface
 */
export interface IActivityLogModel extends Model<IActivityLog> {
  logActivity(data: {
    userId: Types.ObjectId | string;
    action: ActivityAction;
    resource: ActivityResource;
    resourceId?: Types.ObjectId | string;
    resourceTitle?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<IActivityLog>;
}

/**
 * Activity log schema
 */
const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'create',
        'update',
        'delete',
        'restore',
        'publish',
        'unpublish',
        'login',
        'logout',
        'upload',
        'download',
        'view',
        'comment',
        'approve',
        'reject',
      ],
      index: true,
    },
    resource: {
      type: String,
      required: true,
      enum: [
        'content',
        'media',
        'category',
        'tag',
        'user',
        'role',
        'settings',
        'comment',
        'session',
      ],
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    resourceTitle: {
      type: String,
      maxlength: 200,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      maxlength: 45, // IPv6 max length
    },
    userAgent: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for common queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

// TTL index - auto-delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

/**
 * Static method to log activity
 */
activityLogSchema.statics.logActivity = async function (data: {
  userId: Types.ObjectId | string;
  action: ActivityAction;
  resource: ActivityResource;
  resourceId?: Types.ObjectId | string;
  resourceTitle?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<IActivityLog> {
  return this.create({
    userId: new mongoose.Types.ObjectId(data.userId.toString()),
    action: data.action,
    resource: data.resource,
    resourceId: data.resourceId
      ? new mongoose.Types.ObjectId(data.resourceId.toString())
      : undefined,
    resourceTitle: data.resourceTitle,
    details: data.details,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  });
};

export const ActivityLog = mongoose.model<IActivityLog, IActivityLogModel>(
  'ActivityLog',
  activityLogSchema
);
