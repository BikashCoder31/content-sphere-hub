import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../ui';

/**
 * Layout for authentication pages (login, register, etc.)
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* Header */}
      <header className="border-b border-secondary-200 bg-white dark:border-secondary-700 dark:bg-secondary-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" showText />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-secondary-200 bg-white py-4 dark:border-secondary-700 dark:bg-secondary-800">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-secondary-500 dark:text-secondary-400 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} Content Sphere Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
