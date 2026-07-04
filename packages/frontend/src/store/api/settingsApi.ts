import { baseApi } from './baseApi';

/**
 * Settings categories
 */
export type SettingsCategory =
  | 'general'
  | 'seo'
  | 'content'
  | 'media'
  | 'security'
  | 'email'
  | 'appearance';

/**
 * Setting response type
 */
export interface Setting {
  key: string;
  value: unknown;
  category: SettingsCategory;
  label: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  isPublic: boolean;
  updatedAt: string;
}

/**
 * Update setting input
 */
export interface UpdateSettingInput {
  value: unknown;
}

/**
 * Update multiple settings input
 */
export interface UpdateSettingsInput {
  settings: { key: string; value: unknown }[];
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all settings
    getAllSettings: builder.query<Setting[], void>({
      query: () => '/settings',
      transformResponse: (response: { success: boolean; data: Setting[] }) => response.data,
      providesTags: ['Settings'],
    }),

    // Get settings grouped by category
    getSettingsGrouped: builder.query<Record<SettingsCategory, Setting[]>, void>({
      query: () => '/settings/grouped',
      transformResponse: (response: {
        success: boolean;
        data: Record<SettingsCategory, Setting[]>;
      }) => response.data,
      providesTags: ['Settings'],
    }),

    // Get settings by category
    getSettingsByCategory: builder.query<Setting[], SettingsCategory>({
      query: (category) => `/settings/category/${category}`,
      transformResponse: (response: { success: boolean; data: Setting[] }) => response.data,
      providesTags: (_result, _error, category) => [{ type: 'Settings', id: category }],
    }),

    // Get a single setting
    getSettingByKey: builder.query<Setting, string>({
      query: (key) => `/settings/${key}`,
      transformResponse: (response: { success: boolean; data: Setting }) => response.data,
      providesTags: (_result, _error, key) => [{ type: 'Settings', id: key }],
    }),

    // Get public settings
    getPublicSettings: builder.query<Record<string, unknown>, void>({
      query: () => '/settings/public',
      transformResponse: (response: { success: boolean; data: Record<string, unknown> }) =>
        response.data,
      providesTags: [{ type: 'Settings', id: 'PUBLIC' }],
    }),

    // Update a single setting
    updateSetting: builder.mutation<Setting, { key: string; value: unknown }>({
      query: ({ key, value }) => ({
        url: `/settings/${key}`,
        method: 'PATCH',
        body: { value },
      }),
      transformResponse: (response: { success: boolean; data: Setting }) => response.data,
      invalidatesTags: (_result, _error, { key }) => [
        'Settings',
        { type: 'Settings', id: key },
        { type: 'Settings', id: 'PUBLIC' },
      ],
    }),

    // Update multiple settings
    updateSettings: builder.mutation<Setting[], UpdateSettingsInput>({
      query: (body) => ({
        url: '/settings',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: { success: boolean; data: Setting[] }) => response.data,
      invalidatesTags: ['Settings'],
    }),

    // Seed default settings
    seedSettings: builder.mutation<{ seeded: number }, void>({
      query: () => ({
        url: '/settings/seed',
        method: 'POST',
      }),
      transformResponse: (response: { success: boolean; data: { seeded: number } }) =>
        response.data,
      invalidatesTags: ['Settings'],
    }),

    // Reset a setting to default
    resetSetting: builder.mutation<Setting, string>({
      query: (key) => ({
        url: `/settings/${key}/reset`,
        method: 'POST',
      }),
      transformResponse: (response: { success: boolean; data: Setting }) => response.data,
      invalidatesTags: (_result, _error, key) => [
        'Settings',
        { type: 'Settings', id: key },
        { type: 'Settings', id: 'PUBLIC' },
      ],
    }),
  }),
});

export const {
  useGetAllSettingsQuery,
  useGetSettingsGroupedQuery,
  useGetSettingsByCategoryQuery,
  useGetSettingByKeyQuery,
  useGetPublicSettingsQuery,
  useUpdateSettingMutation,
  useUpdateSettingsMutation,
  useSeedSettingsMutation,
  useResetSettingMutation,
} = settingsApi;
