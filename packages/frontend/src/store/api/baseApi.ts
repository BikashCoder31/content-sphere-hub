import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { tokenStorage } from '@/lib/tokenStorage';
import { logout, setCredentials } from '../slices/authSlice';
import type { AuthTokens } from '@content-sphere-hub/shared';

const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

const baseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Base query with automatic token refresh on 401 errors
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshToken = tokenStorage.getRefreshToken();

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data as { success: boolean; data: { tokens: AuthTokens } };
        if (data.success && data.data.tokens) {
          // Store the new tokens
          api.dispatch(
            setCredentials({
              accessToken: data.data.tokens.accessToken,
              refreshToken: data.data.tokens.refreshToken,
            })
          );
          tokenStorage.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);

          // Retry the original request
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
          tokenStorage.clearTokens();
        }
      } else {
        api.dispatch(logout());
        tokenStorage.clearTokens();
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

/**
 * Base API instance with tag types for cache invalidation
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Users', 'Roles', 'Content', 'Media', 'MediaFolder', 'Categories', 'Tags', 'Profile', 'Dashboard', 'Settings'],
  endpoints: () => ({}),
});
