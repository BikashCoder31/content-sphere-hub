import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { tokenStorage } from '@/lib/tokenStorage';

/**
 * User object stored in auth state
 */
export interface AuthUser {
  _id: string;
  id?: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  roleId: string;
  role?: string;
  permissions?: string[];
  emailVerified?: boolean;
  createdAt?: string;
}

/**
 * Auth slice state
 */
export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

// Initialize from stored tokens
const storedAccessToken = tokenStorage.getAccessToken();
const storedRefreshToken = tokenStorage.getRefreshToken();

const initialState: AuthState = {
  user: null,
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
  isAuthenticated: false,
  isLoading: !!storedAccessToken, // Loading if we have a token to verify
  isInitialized: !storedAccessToken, // Already initialized if no token
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set user credentials after successful login or token refresh
     */
    setCredentials: (
      state,
      action: PayloadAction<{
        user?: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      if (user) {
        state.user = user;
      }
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isInitialized = true;
    },

    /**
     * Set user data (from /auth/me endpoint)
     */
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isInitialized = true;
    },

    /**
     * Clear auth state on logout
     */
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isInitialized = true;
    },

    /**
     * Set loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /**
     * Mark auth as initialized (after checking stored token)
     */
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
      if (!state.accessToken) {
        state.isLoading = false;
      }
    },
  },
});

export const { setCredentials, setUser, logout, setLoading, setInitialized } = authSlice.actions;
export default authSlice.reducer;
