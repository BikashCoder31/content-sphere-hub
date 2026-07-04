import { useState, useMemo } from 'react';
import { useGetCategoryTreeQuery, Category } from '@/store/api';
import { Button } from '@/components/ui/Button';
import { Loader2, ChevronDown, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySelectProps {
  value?: string | null;
  onChange: (categoryId: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Flatten category tree with indentation level
 */
function flattenCategories(
  categories: Category[],
  level = 0
): Array<Category & { level: number }> {
  return categories.reduce<Array<Category & { level: number }>>((acc, cat) => {
    acc.push({ ...cat, level });
    if (cat.children && cat.children.length > 0) {
      acc.push(...flattenCategories(cat.children, level + 1));
    }
    return acc;
  }, []);
}

/**
 * Category select component with hierarchical display
 */
export function CategorySelect({
  value,
  onChange,
  placeholder = 'Select category...',
  disabled = false,
  className,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useGetCategoryTreeQuery();

  // Flatten tree for display
  const flatCategories = useMemo(() => {
    if (!data?.data) return [];
    return flattenCategories(data.data);
  }, [data]);

  // Find selected category
  const selectedCategory = flatCategories.find((c) => c.id === value);

  const handleSelect = (categoryId: string | null) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between text-left font-normal"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </span>
        ) : selectedCategory ? (
          <span className="flex items-center gap-2 truncate">
            <Folder className="h-4 w-4 text-amber-500" />
            {selectedCategory.name}
          </span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown className={cn('ml-2 h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Clear option */}
            <button
              type="button"
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between',
                !value && 'bg-gray-50 dark:bg-gray-700'
              )}
              onClick={() => handleSelect(null)}
            >
              <span className="text-gray-500">No category</span>
              {!value && <span className="text-blue-500">✓</span>}
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Categories */}
            {flatCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={cn(
                  'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between',
                  value === category.id && 'bg-blue-50 dark:bg-blue-900/20'
                )}
                style={{ paddingLeft: `${category.level * 16 + 12}px` }}
                onClick={() => handleSelect(category.id)}
              >
                <span className="flex items-center gap-2 truncate">
                  <Folder className="h-4 w-4 text-amber-500" />
                  {category.name}
                  {!category.isActive && (
                    <span className="text-xs text-gray-400">(inactive)</span>
                  )}
                </span>
                {value === category.id && <span className="text-blue-500">✓</span>}
              </button>
            ))}

            {flatCategories.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No categories available</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CategorySelect;
