import { baseApi } from './baseApi';
import type {
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  AuthTokens,
} from '@content-sphere-hub/shared';
import type { AuthUser } from '../slices/authSlice';

/**
 * Login request payload
 */
interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

/**
 * Update profile request payload
 */
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
}

/**
 * Change password request payload
 */
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Me response with user and permissions
 */
interface MeResponse {
  user: AuthUser;
  permissions: string[];
}

/**
 * Auth API endpoints
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Login with email and password
     */
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    /**
     * Register a new user
     */
    register: builder.mutation<ApiResponse<RegisterResponse>, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    /**
     * Logout (invalidate refresh token)
     */
    logout: builder.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    /**
     * Refresh access token
     */
    refreshToken: builder.mutation<ApiResponse<{ tokens: AuthTokens }>, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Get current user info
     */
    getMe: builder.query<ApiResponse<MeResponse>, void>({
      query: () => '/auth/me',
      providesTags: ['Profile'],
    }),

    /**
     * Change password
     */
    changePassword: builder.mutation<ApiResponse<{ message: string }>, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Update profile
     */
    updateProfile: builder.mutation<ApiResponse<AuthUser>, UpdateProfileRequest>({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useChangePasswordMutation,
  useUpdateProfileMutation,
} = authApi;
