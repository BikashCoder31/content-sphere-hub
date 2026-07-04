import mongoose from 'mongoose';
import { Content } from '../models/content.model';
import { User } from '../models/user.model';
import { Media } from '../models/media.model';
import { Category } from '../models/category.model';
import { Tag } from '../models/tag.model';
import { ActivityLog } from '../models/activityLog.model';

/**
 * Dashboard statistics response
 */
export interface DashboardStats {
  content: {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
    byType: Record<string, number>;
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  media: {
    total: number;
    totalSize: number;
    byType: Record<string, number>;
  };
  taxonomy: {
    categories: number;
    tags: number;
  };
}

/**
 * Content trend data point
 */
export interface TrendDataPoint {
  date: string;
  count: number;
}

/**
 * Activity summary
 */
export interface ActivitySummary {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  resource: string;
  resourceId?: string;
  resourceTitle?: string;
  createdAt: Date;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    contentStats,
    contentByType,
    userStats,
    newUsersThisMonth,
    mediaStats,
    mediaByType,
    categoryCount,
    tagCount,
  ] = await Promise.all([
    // Content stats
    Content.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    // Content by type
    Content.aggregate([
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 },
        },
      },
    ]),
    // User stats
    User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
          },
        },
      },
    ]),
    // New users this month
    User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    }),
    // Media stats
    Media.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalSize: { $sum: '$size' },
        },
      },
    ]),
    // Media by type
    Media.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]),
    // Category count
    Category.countDocuments({ isDeleted: { $ne: true } }),
    // Tag count
    Tag.countDocuments({ isActive: true }),
  ]);

  // Process content stats
  const contentStatusMap: Record<string, number> = {};
  contentStats.forEach((s: { _id: string; count: number }) => {
    contentStatusMap[s._id] = s.count;
  });

  // Process content by type
  const contentTypeMap: Record<string, number> = {};
  contentByType.forEach((s: { _id: string; count: number }) => {
    contentTypeMap[s._id] = s.count;
  });

  // Process media by type
  const mediaTypeMap: Record<string, number> = {};
  mediaByType.forEach((s: { _id: string; count: number }) => {
    mediaTypeMap[s._id] = s.count;
  });

  const userStat = userStats[0] || { total: 0, active: 0 };
  const mediaStat = mediaStats[0] || { total: 0, totalSize: 0 };

  return {
    content: {
      total: Object.values(contentStatusMap).reduce((a, b) => a + b, 0),
      published: contentStatusMap['published'] || 0,
      draft: contentStatusMap['draft'] || 0,
      scheduled: contentStatusMap['scheduled'] || 0,
      byType: contentTypeMap,
    },
    users: {
      total: userStat.total,
      active: userStat.active,
      newThisMonth: newUsersThisMonth,
    },
    media: {
      total: mediaStat.total,
      totalSize: mediaStat.totalSize,
      byType: mediaTypeMap,
    },
    taxonomy: {
      categories: categoryCount,
      tags: tagCount,
    },
  };
}

/**
 * Get content creation trend for the last N days
 */
export async function getContentTrend(days: number = 30): Promise<TrendDataPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const trend = await Content.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Fill in missing dates with 0
  const result: TrendDataPoint[] = [];
  const trendMap = new Map(trend.map((t: { _id: string; count: number }) => [t._id, t.count]));

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: trendMap.get(dateStr) || 0,
    });
  }

  return result;
}

/**
 * Get recent activity
 */
export async function getRecentActivity(limit: number = 20): Promise<ActivitySummary[]> {
  const activities = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName avatar')
    .lean();

  return activities.map((a) => {
    const user = a.userId as unknown as { _id: mongoose.Types.ObjectId; firstName: string; lastName: string; avatar?: string } | null;
    return {
      id: a._id.toString(),
      userId: user?._id?.toString() || '',
      userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      userAvatar: user?.avatar,
      action: a.action,
      resource: a.resource,
      resourceId: a.resourceId?.toString(),
      resourceTitle: a.resourceTitle,
      createdAt: a.createdAt,
    };
  });
}

/**
 * Get recent content
 */
export async function getRecentContent(limit: number = 5) {
  return Content.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('authorId', 'firstName lastName avatar')
    .select('title slug status contentType updatedAt authorId')
    .lean();
}

/**
 * Get top performing content (by views - placeholder)
 */
export async function getTopContent(limit: number = 5) {
  // For now, just get most recent published content
  // In future, this would use analytics/view counts
  return Content.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('title slug contentType publishedAt')
    .lean();
}

/**
 * Get content stats by status for chart
 */
export async function getContentByStatus(): Promise<{ status: string; count: number }[]> {
  const stats = await Content.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  return stats.map((s: { _id: string; count: number }) => ({
    status: s._id,
    count: s.count,
  }));
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(
  userId: string,
  days: number = 30
): Promise<{ action: string; count: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const activities = await ActivityLog.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
      },
    },
  ]);

  return activities.map((a: { _id: string; count: number }) => ({
    action: a._id,
    count: a.count,
  }));
}
