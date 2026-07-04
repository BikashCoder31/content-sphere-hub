import { forwardRef, SVGAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends SVGAttributes<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    };

    return (
      <Loader2
        ref={ref}
        className={cn(
          'animate-spin text-primary-600 dark:text-primary-400',
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * Full-page loading spinner
 */
export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 dark:bg-secondary-900">
      <div className="text-center">
        <Spinner size="xl" className="mx-auto mb-4" />
        {message && <p className="text-secondary-600 dark:text-secondary-400">{message}</p>}
      </div>
    </div>
  );
}

export { Spinner };
