import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { AuthLayout, DashboardLayout } from './components/layouts';
import { ProtectedRoute, GuestRoute } from './components/auth';
import { PageErrorBoundary, LoadingOverlay, ToastProvider } from './components/ui';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardHomePage = lazy(() => import('./pages/dashboard/DashboardHomePage'));
const ContentListPage = lazy(() => import('./pages/content/ContentListPage'));
const ContentEditPage = lazy(() => import('./pages/content/ContentEditPage'));
const MediaLibraryPage = lazy(() => import('./pages/media/MediaLibraryPage'));
const CategoriesPage = lazy(() => import('./pages/categories/CategoriesPage'));
const TagsPage = lazy(() => import('./pages/tags/TagsPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

/**
 * Placeholder page for unimplemented features
 */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">{title}</h1>
      <p className="mt-2 text-secondary-600 dark:text-secondary-400">
        This feature will be implemented in a future sprint.
      </p>
    </div>
  );
}

/**
 * 404 Not Found page
 */
function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-secondary-50 dark:bg-secondary-900">
      <h1 className="text-6xl font-bold text-secondary-300 dark:text-secondary-600 mb-4">404</h1>
      <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-8">Page not found</p>
      <a href="/" className="btn-primary">
        Go Home
      </a>
    </div>
  );
}

/**
 * 500 Server Error page
 */
function ServerErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-secondary-50 dark:bg-secondary-900">
      <h1 className="text-6xl font-bold text-red-300 dark:text-red-600 mb-4">500</h1>
      <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-8">
        Something went wrong on our end
      </p>
      <div className="flex gap-4">
        <button onClick={() => window.location.reload()} className="btn-primary">
          Try Again
        </button>
        <a href="/" className="btn-outline">
          Go Home
        </a>
      </div>
    </div>
  );
}

function App() {
  // Initialize theme on app load
  useTheme();

  return (
    <PageErrorBoundary>
      <ToastProvider>
        <Suspense fallback={<LoadingOverlay message="Loading page..." />}>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth routes (guest only) */}
            <Route
              element={
                <GuestRoute>
                  <AuthLayout />
                </GuestRoute>
              }
            >
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHomePage />} />
              <Route path="content" element={<ContentListPage />} />
              <Route path="content/new" element={<ContentEditPage />} />
              <Route path="content/:id/edit" element={<ContentEditPage />} />
              <Route path="media" element={<MediaLibraryPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="users" element={<PlaceholderPage title="User Management" />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Error pages */}
            <Route path="/500" element={<ServerErrorPage />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </PageErrorBoundary>
  );
}

export default App;
