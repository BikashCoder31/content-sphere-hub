import { baseApi } from './baseApi';

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
export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  resource: string;
  resourceId?: string;
  resourceTitle?: string;
  createdAt: string;
}

/**
 * Recent content item
 */
export interface RecentContentItem {
  _id: string;
  title: string;
  slug: string;
  status: string;
  contentType: string;
  updatedAt: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

/**
 * Content by status
 */
export interface ContentByStatus {
  status: string;
  count: number;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get dashboard statistics
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      transformResponse: (response: { success: boolean; data: DashboardStats }) => response.data,
      providesTags: ['Dashboard'],
    }),

    // Get content trend
    getContentTrend: builder.query<TrendDataPoint[], { days?: number }>({
      query: ({ days = 30 } = {}) => `/dashboard/trend?days=${days}`,
      transformResponse: (response: { success: boolean; data: TrendDataPoint[] }) => response.data,
      providesTags: ['Dashboard'],
    }),

    // Get recent activity
    getRecentActivity: builder.query<ActivityItem[], { limit?: number }>({
      query: ({ limit = 20 } = {}) => `/dashboard/activity?limit=${limit}`,
      transformResponse: (response: { success: boolean; data: ActivityItem[] }) => response.data,
      providesTags: ['Dashboard'],
    }),

    // Get recent content
    getRecentContent: builder.query<RecentContentItem[], { limit?: number }>({
      query: ({ limit = 5 } = {}) => `/dashboard/recent-content?limit=${limit}`,
      transformResponse: (response: { success: boolean; data: RecentContentItem[] }) =>
        response.data,
      providesTags: ['Dashboard', 'Content'],
    }),

    // Get top content
    getTopContent: builder.query<RecentContentItem[], { limit?: number }>({
      query: ({ limit = 5 } = {}) => `/dashboard/top-content?limit=${limit}`,
      transformResponse: (response: { success: boolean; data: RecentContentItem[] }) =>
        response.data,
      providesTags: ['Dashboard', 'Content'],
    }),

    // Get content by status (for charts)
    getContentByStatus: builder.query<ContentByStatus[], void>({
      query: () => '/dashboard/content-by-status',
      transformResponse: (response: { success: boolean; data: ContentByStatus[] }) => response.data,
      providesTags: ['Dashboard', 'Content'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetContentTrendQuery,
  useGetRecentActivityQuery,
  useGetRecentContentQuery,
  useGetTopContentQuery,
  useGetContentByStatusQuery,
} = dashboardApi;
