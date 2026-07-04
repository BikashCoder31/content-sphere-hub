import { baseApi } from './baseApi';
import type { ContentStatus, ContentVisibility, ContentType } from '@content-sphere-hub/shared';

/**
 * Content response types
 */
export interface ContentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
}

export interface ContentSeo {
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

export interface Content {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: object;
  contentHtml?: string;
  contentType: ContentType;
  status: ContentStatus;
  visibility: ContentVisibility;
  author: ContentAuthor;
  category?: string;
  tags?: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  seo: ContentSeo;
  publishedAt?: string;
  scheduledAt?: string;
  readingTime?: number;
  wordCount?: number;
  viewCount: number;
  isFeatured: boolean;
  allowComments: boolean;
  sortOrder: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentType: ContentType;
  status: ContentStatus;
  visibility: ContentVisibility;
  author: ContentAuthor;
  featuredImage?: string;
  publishedAt?: string;
  viewCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentListResponse {
  success: boolean;
  data: ContentListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContentResponse {
  success: boolean;
  data: Content;
}

export interface SlugCheckResponse {
  success: boolean;
  data: {
    available: boolean;
    suggestion?: string;
  };
}

export interface BulkOperationResponse {
  success: boolean;
  data: {
    success: number;
    failed: number;
    errors: string[];
  };
}

/**
 * Content query params
 */
export interface ContentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  contentType?: ContentType;
  visibility?: ContentVisibility;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  isFeatured?: boolean;
  includeTrash?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Content create/update inputs
 */
export interface CreateContentInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: object;
  contentType?: ContentType;
  status?: ContentStatus;
  visibility?: ContentVisibility;
  categoryIds?: string[];
  tagIds?: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  seo?: Partial<ContentSeo>;
  isFeatured?: boolean;
  allowComments?: boolean;
  sortOrder?: number;
  parentId?: string;
  scheduledAt?: string;
}

export interface UpdateContentInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: object;
  contentType?: ContentType;
  status?: ContentStatus;
  visibility?: ContentVisibility;
  categoryIds?: string[];
  tagIds?: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  seo?: Partial<ContentSeo>;
  isFeatured?: boolean;
  allowComments?: boolean;
  sortOrder?: number;
  parentId?: string;
  scheduledAt?: string;
}

export interface UpdateContentStatusInput {
  status: ContentStatus;
}

export interface BulkContentInput {
  ids: string[];
  action: 'trash' | 'restore' | 'delete' | 'publish' | 'unpublish';
}

/**
 * Content API endpoints
 */
export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get content list
    getContents: builder.query<ContentListResponse, ContentListParams>({
      query: (params) => ({
        url: '/content',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Content' as const, id })),
              { type: 'Content', id: 'LIST' },
            ]
          : [{ type: 'Content', id: 'LIST' }],
    }),

    // Get my contents
    getMyContents: builder.query<ContentListResponse, ContentListParams>({
      query: (params) => ({
        url: '/content/my',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Content' as const, id })),
              { type: 'Content', id: 'MY_LIST' },
            ]
          : [{ type: 'Content', id: 'MY_LIST' }],
    }),

    // Get content by ID
    getContentById: builder.query<ContentResponse, string>({
      query: (id) => `/content/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    // Get content by slug
    getContentBySlug: builder.query<ContentResponse, string>({
      query: (slug) => `/content/slug/${slug}`,
      providesTags: (result) => (result ? [{ type: 'Content', id: result.data.id }] : []),
    }),

    // Check slug availability
    checkSlug: builder.query<SlugCheckResponse, { slug: string; excludeId?: string }>({
      query: ({ slug, excludeId }) => ({
        url: '/content/check-slug',
        params: { slug, excludeId },
      }),
    }),

    // Create content
    createContent: builder.mutation<ContentResponse, CreateContentInput>({
      query: (body) => ({
        url: '/content',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Content', id: 'LIST' }, { type: 'Content', id: 'MY_LIST' }],
    }),

    // Update content
    updateContent: builder.mutation<ContentResponse, { id: string; data: UpdateContentInput }>({
      query: ({ id, data }) => ({
        url: `/content/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Content', id },
        { type: 'Content', id: 'LIST' },
        { type: 'Content', id: 'MY_LIST' },
      ],
    }),

    // Update content status
    updateContentStatus: builder.mutation<ContentResponse, { id: string; data: UpdateContentStatusInput }>({
      query: ({ id, data }) => ({
        url: `/content/${id}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Content', id },
        { type: 'Content', id: 'LIST' },
        { type: 'Content', id: 'MY_LIST' },
      ],
    }),

    // Trash content (soft delete)
    trashContent: builder.mutation<ContentResponse, string>({
      query: (id) => ({
        url: `/content/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Content', id },
        { type: 'Content', id: 'LIST' },
        { type: 'Content', id: 'MY_LIST' },
      ],
    }),

    // Restore content from trash
    restoreContent: builder.mutation<ContentResponse, string>({
      query: (id) => ({
        url: `/content/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Content', id },
        { type: 'Content', id: 'LIST' },
        { type: 'Content', id: 'MY_LIST' },
      ],
    }),

    // Permanently delete content
    deleteContent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/content/${id}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Content', id },
        { type: 'Content', id: 'LIST' },
        { type: 'Content', id: 'MY_LIST' },
      ],
    }),

    // Bulk operations
    bulkContentOperation: builder.mutation<BulkOperationResponse, BulkContentInput>({
      query: (body) => ({
        url: '/content/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Content', id: 'LIST' }, { type: 'Content', id: 'MY_LIST' }],
    }),
  }),
});

export const {
  useGetContentsQuery,
  useGetMyContentsQuery,
  useGetContentByIdQuery,
  useGetContentBySlugQuery,
  useLazyCheckSlugQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useUpdateContentStatusMutation,
  useTrashContentMutation,
  useRestoreContentMutation,
  useDeleteContentMutation,
  useBulkContentOperationMutation,
} = contentApi;
