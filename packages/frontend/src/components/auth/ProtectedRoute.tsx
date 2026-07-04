import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { setUser, setInitialized, logout } from '@/store/slices/authSlice';
import { useLazyGetMeQuery } from '@/store/api/authApi';
import { tokenStorage } from '@/lib/tokenStorage';
import { LoadingScreen } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

/**
 * Wraps routes that require authentication
 * Handles initial auth check and redirects unauthenticated users
 */
export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, isInitialized, user, accessToken } = useAppSelector(
    (state) => state.auth
  );
  const [getMe, { isLoading: isMeLoading }] = useLazyGetMeQuery();

  useEffect(() => {
    // If we have a token but haven't verified the user yet
    if (accessToken && !isAuthenticated && !isInitialized) {
      getMe()
        .unwrap()
        .then((response) => {
          if (response.success && response.data) {
            dispatch(
              setUser({
                ...response.data.user,
                permissions: response.data.permissions,
              })
            );
          } else {
            // Token is invalid
            dispatch(logout());
            tokenStorage.clearTokens();
          }
        })
        .catch(() => {
          dispatch(logout());
          tokenStorage.clearTokens();
        });
    } else if (!accessToken && !isInitialized) {
      dispatch(setInitialized(true));
    }
  }, [accessToken, isAuthenticated, isInitialized, dispatch, getMe]);

  // Show loading while checking auth
  if (isLoading || isMeLoading || (!isInitialized && accessToken)) {
    return <LoadingScreen message="Verifying authentication..." />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permission if required
  if (requiredPermission && user?.permissions) {
    const hasPermission =
      user.permissions.includes(requiredPermission) ||
      user.permissions.includes(`${requiredPermission.split(':')[0]}:manage`);

    if (!hasPermission) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">
              Access Denied
            </h1>
            <p className="mt-2 text-secondary-600 dark:text-secondary-400">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps routes that should only be accessible to unauthenticated users
 * Redirects authenticated users to dashboard
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isInitialized, accessToken } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [getMe, { isLoading }] = useLazyGetMeQuery();

  useEffect(() => {
    // Verify token on mount if we have one
    if (accessToken && !isInitialized) {
      getMe()
        .unwrap()
        .then((response) => {
          if (response.success && response.data) {
            dispatch(
              setUser({
                ...response.data.user,
                permissions: response.data.permissions,
              })
            );
          } else {
            dispatch(logout());
            tokenStorage.clearTokens();
          }
        })
        .catch(() => {
          dispatch(logout());
          tokenStorage.clearTokens();
        });
    } else if (!accessToken && !isInitialized) {
      dispatch(setInitialized(true));
    }
  }, [accessToken, isInitialized, dispatch, getMe]);

  if (isLoading || (!isInitialized && accessToken)) {
    return <LoadingScreen message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
