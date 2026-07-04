import { baseApi } from './baseApi';

/**
 * Media variant type
 */
export interface MediaVariant {
  name: string;
  path: string;
  url: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

/**
 * Media item response
 */
export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  mediaType: 'image' | 'document' | 'video' | 'audio' | 'other';
  width?: number;
  height?: number;
  variants?: MediaVariant[];
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
  folderId?: string;
  uploadedBy: {
    id: string;
    email: string;
    displayName?: string;
  };
  usageCount: number;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Media folder type
 */
export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  path: string;
  parentId?: string;
}

/**
 * Media list query params
 */
export interface MediaListParams {
  page?: number;
  limit?: number;
  search?: string;
  mediaType?: 'image' | 'document' | 'video' | 'audio' | 'other';
  folderId?: string | null;
  uploadedBy?: string;
  includeDeleted?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'filename' | 'size';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Media list response
 */
export interface MediaListResponse {
  success: boolean;
  data: MediaItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Media upload response
 */
export interface MediaUploadResponse {
  success: boolean;
  data: MediaItem;
}

/**
 * Bulk upload response
 */
export interface BulkUploadResponse {
  success: boolean;
  data: {
    uploaded: MediaItem[];
    failed?: Array<{ filename: string; error: string }>;
  };
}

/**
 * Update media input
 */
export interface UpdateMediaInput {
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
  folderId?: string | null;
}

/**
 * Bulk operation input
 */
export interface BulkMediaOperationInput {
  ids: string[];
  action: 'delete' | 'restore' | 'move';
  folderId?: string;
}

/**
 * Create folder input
 */
export interface CreateFolderInput {
  name: string;
  parentId?: string | null;
}

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // List media with filters
    listMedia: builder.query<MediaListResponse, MediaListParams>({
      query: (params) => ({
        url: '/media',
        params: {
          ...params,
          folderId: params.folderId === null ? 'null' : params.folderId,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Media' as const, id })),
              { type: 'Media', id: 'LIST' },
            ]
          : [{ type: 'Media', id: 'LIST' }],
    }),

    // Get single media
    getMedia: builder.query<{ success: boolean; data: MediaItem }, string>({
      query: (id) => `/media/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Media', id }],
    }),

    // Upload single file
    uploadMedia: builder.mutation<MediaUploadResponse, { file: File; folderId?: string }>({
      query: ({ file, folderId }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) {
          formData.append('folderId', folderId);
        }
        return {
          url: '/media/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [{ type: 'Media', id: 'LIST' }],
    }),

    // Upload multiple files
    uploadMultipleMedia: builder.mutation<BulkUploadResponse, { files: File[]; folderId?: string }>({
      query: ({ files, folderId }) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });
        if (folderId) {
          formData.append('folderId', folderId);
        }
        return {
          url: '/media/upload/batch',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [{ type: 'Media', id: 'LIST' }],
    }),

    // Update media metadata
    updateMedia: builder.mutation<{ success: boolean; data: MediaItem }, { id: string; input: UpdateMediaInput }>({
      query: ({ id, input }) => ({
        url: `/media/${id}`,
        method: 'PATCH',
        body: input,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Media', id },
        { type: 'Media', id: 'LIST' },
      ],
    }),

    // Delete media (soft delete)
    deleteMedia: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/media/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Media', id },
        { type: 'Media', id: 'LIST' },
      ],
    }),

    // Restore deleted media
    restoreMedia: builder.mutation<{ success: boolean; data: MediaItem }, string>({
      query: (id) => ({
        url: `/media/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Media', id },
        { type: 'Media', id: 'LIST' },
      ],
    }),

    // Permanently delete media
    permanentlyDeleteMedia: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/media/${id}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Media', id },
        { type: 'Media', id: 'LIST' },
      ],
    }),

    // Bulk operations
    bulkMediaOperation: builder.mutation<{ success: boolean; data: { success: number; failed: number } }, BulkMediaOperationInput>({
      query: (input) => ({
        url: '/media/bulk',
        method: 'POST',
        body: input,
      }),
      invalidatesTags: [{ type: 'Media', id: 'LIST' }],
    }),

    // List folders
    listMediaFolders: builder.query<{ success: boolean; data: MediaFolder[] }, string | null | undefined>({
      query: (parentId) => ({
        url: '/media/folders',
        params: parentId !== undefined ? { parentId: parentId === null ? 'null' : parentId } : {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'MediaFolder' as const, id })),
              { type: 'MediaFolder', id: 'LIST' },
            ]
          : [{ type: 'MediaFolder', id: 'LIST' }],
    }),

    // Create folder
    createMediaFolder: builder.mutation<{ success: boolean; data: MediaFolder }, CreateFolderInput>({
      query: (input) => ({
        url: '/media/folders',
        method: 'POST',
        body: input,
      }),
      invalidatesTags: [{ type: 'MediaFolder', id: 'LIST' }],
    }),

    // Update folder
    updateMediaFolder: builder.mutation<{ success: boolean; data: MediaFolder }, { id: string; name?: string; parentId?: string | null }>({
      query: ({ id, ...input }) => ({
        url: `/media/folders/${id}`,
        method: 'PATCH',
        body: input,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'MediaFolder', id },
        { type: 'MediaFolder', id: 'LIST' },
      ],
    }),

    // Delete folder
    deleteMediaFolder: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/media/folders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'MediaFolder', id },
        { type: 'MediaFolder', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListMediaQuery,
  useGetMediaQuery,
  useUploadMediaMutation,
  useUploadMultipleMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
  useRestoreMediaMutation,
  usePermanentlyDeleteMediaMutation,
  useBulkMediaOperationMutation,
  useListMediaFoldersQuery,
  useCreateMediaFolderMutation,
  useUpdateMediaFolderMutation,
  useDeleteMediaFolderMutation,
} = mediaApi;
