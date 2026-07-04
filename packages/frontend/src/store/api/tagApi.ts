import { baseApi } from './baseApi';

/**
 * Tag response type
 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  isActive: boolean;
  contentCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create tag input
 */
export interface CreateTagInput {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

/**
 * Update tag input
 */
export type UpdateTagInput = Partial<CreateTagInput>;

/**
 * Tag list query params
 */
export interface TagListParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'contentCount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Tag list response
 */
export interface TagListResponse {
  success: boolean;
  data: Tag[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const tagApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // List tags
    listTags: builder.query<TagListResponse, TagListParams | void>({
      query: (params) => ({
        url: '/tags',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Tags' as const, id })),
              { type: 'Tags' as const, id: 'LIST' },
            ]
          : [{ type: 'Tags' as const, id: 'LIST' }],
    }),

    // Get popular tags
    getPopularTags: builder.query<{ success: boolean; data: Tag[] }, number | void>({
      query: (limit) => ({
        url: '/tags/popular',
        params: limit ? { limit } : {},
      }),
      providesTags: [{ type: 'Tags' as const, id: 'POPULAR' }],
    }),

    // Get tag by ID
    getTagById: builder.query<{ success: boolean; data: Tag }, string>({
      query: (id) => `/tags/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tags' as const, id }],
    }),

    // Get tag by slug
    getTagBySlug: builder.query<{ success: boolean; data: Tag }, string>({
      query: (slug) => `/tags/by-slug/${slug}`,
      providesTags: (result) =>
        result ? [{ type: 'Tags' as const, id: result.data.id }] : [],
    }),

    // Check slug availability
    checkTagSlug: builder.query<
      { success: boolean; data: { available: boolean; suggestion?: string } },
      { slug: string; excludeId?: string }
    >({
      query: ({ slug, excludeId }) => ({
        url: `/tags/check-slug/${slug}`,
        params: excludeId ? { excludeId } : {},
      }),
    }),

    // Create tag
    createTag: builder.mutation<{ success: boolean; data: Tag }, CreateTagInput>({
      query: (body) => ({
        url: '/tags',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Tags' as const, id: 'LIST' },
        { type: 'Tags' as const, id: 'POPULAR' },
      ],
    }),

    // Update tag
    updateTag: builder.mutation<
      { success: boolean; data: Tag },
      { id: string; data: UpdateTagInput }
    >({
      query: ({ id, data }) => ({
        url: `/tags/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Tags' as const, id },
        { type: 'Tags' as const, id: 'LIST' },
        { type: 'Tags' as const, id: 'POPULAR' },
      ],
    }),

    // Delete tag
    deleteTag: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/tags/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Tags' as const, id: 'LIST' },
        { type: 'Tags' as const, id: 'POPULAR' },
      ],
    }),

    // Find or create tags from names
    findOrCreateTags: builder.mutation<{ success: boolean; data: Tag[] }, string[]>({
      query: (names) => ({
        url: '/tags/find-or-create',
        method: 'POST',
        body: { names },
      }),
      invalidatesTags: [
        { type: 'Tags' as const, id: 'LIST' },
        { type: 'Tags' as const, id: 'POPULAR' },
      ],
    }),

    // Bulk tag operations
    bulkTagOperation: builder.mutation<
      { success: boolean; data: { success: number; failed: number } },
      { action: 'delete' | 'activate' | 'deactivate' | 'merge'; ids: string[]; targetId?: string }
    >({
      query: (body) => ({
        url: '/tags/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Tags' as const, id: 'LIST' },
        { type: 'Tags' as const, id: 'POPULAR' },
      ],
    }),
  }),
});

export const {
  useListTagsQuery,
  useGetPopularTagsQuery,
  useGetTagByIdQuery,
  useGetTagBySlugQuery,
  useLazyCheckTagSlugQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useFindOrCreateTagsMutation,
  useBulkTagOperationMutation,
} = tagApi;
