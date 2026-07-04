import { baseApi } from './baseApi';

/**
 * Category response type
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  featuredImage?: string;
  sortOrder: number;
  isActive: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  contentCount: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Create category input
 */
export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  featuredImage?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

/**
 * Update category input
 */
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

/**
 * Category list query params
 */
export interface CategoryListParams {
  search?: string;
  parentId?: string | null;
  isActive?: boolean;
  tree?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'sortOrder' | 'createdAt' | 'contentCount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Category list response
 */
export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Slug availability response
 */
export interface SlugAvailabilityResponse {
  success: boolean;
  data: {
    available: boolean;
    suggestion?: string;
  };
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // List categories
    listCategories: builder.query<CategoryListResponse, CategoryListParams | void>({
      query: (params) => ({
        url: '/categories',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Categories' as const, id })),
              { type: 'Categories' as const, id: 'LIST' },
            ]
          : [{ type: 'Categories' as const, id: 'LIST' }],
    }),

    // Get category tree
    getCategoryTree: builder.query<CategoryListResponse, void>({
      query: () => ({
        url: '/categories',
        params: { tree: true },
      }),
      providesTags: [{ type: 'Categories' as const, id: 'TREE' }],
    }),

    // Get category by ID
    getCategoryById: builder.query<{ success: boolean; data: Category }, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Categories' as const, id }],
    }),

    // Get category by slug
    getCategoryBySlug: builder.query<{ success: boolean; data: Category }, string>({
      query: (slug) => `/categories/by-slug/${slug}`,
      providesTags: (result) =>
        result ? [{ type: 'Categories' as const, id: result.data.id }] : [],
    }),

    // Get category path (breadcrumb)
    getCategoryPath: builder.query<{ success: boolean; data: Category[] }, string>({
      query: (id) => `/categories/${id}/path`,
    }),

    // Check slug availability
    checkCategorySlug: builder.query<
      SlugAvailabilityResponse,
      { slug: string; excludeId?: string }
    >({
      query: ({ slug, excludeId }) => ({
        url: `/categories/check-slug/${slug}`,
        params: excludeId ? { excludeId } : {},
      }),
    }),

    // Create category
    createCategory: builder.mutation<{ success: boolean; data: Category }, CreateCategoryInput>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Categories' as const, id: 'LIST' },
        { type: 'Categories' as const, id: 'TREE' },
      ],
    }),

    // Update category
    updateCategory: builder.mutation<
      { success: boolean; data: Category },
      { id: string; data: UpdateCategoryInput }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Categories' as const, id },
        { type: 'Categories' as const, id: 'LIST' },
        { type: 'Categories' as const, id: 'TREE' },
      ],
    }),

    // Delete category
    deleteCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Categories' as const, id: 'LIST' },
        { type: 'Categories' as const, id: 'TREE' },
      ],
    }),

    // Reorder categories
    reorderCategories: builder.mutation<
      { success: boolean; message: string },
      Array<{ id: string; sortOrder: number }>
    >({
      query: (orders) => ({
        url: '/categories/reorder',
        method: 'POST',
        body: { orders },
      }),
      invalidatesTags: [
        { type: 'Categories' as const, id: 'LIST' },
        { type: 'Categories' as const, id: 'TREE' },
      ],
    }),
  }),
});

export const {
  useListCategoriesQuery,
  useGetCategoryTreeQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useGetCategoryPathQuery,
  useLazyCheckCategorySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoriesMutation,
} = categoryApi;
