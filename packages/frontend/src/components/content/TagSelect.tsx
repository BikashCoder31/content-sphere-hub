import { useState, useMemo, useCallback, KeyboardEvent } from 'react';
import { useListTagsQuery, useFindOrCreateTagsMutation, Tag } from '@/store/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, ChevronDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagSelectProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowCreate?: boolean;
}

/**
 * Multi-select tag component with create capability
 */
export function TagSelect({
  value = [],
  onChange,
  placeholder = 'Select tags...',
  disabled = false,
  className,
  allowCreate = true,
}: TagSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const { data, isLoading } = useListTagsQuery({ limit: 100 });
  const [findOrCreateTags, { isLoading: isCreating }] = useFindOrCreateTagsMutation();

  const tags = data?.data || [];

  // Get selected tags
  const selectedTags = useMemo(() => {
    return value.map((id) => tags.find((t) => t.id === id)).filter(Boolean) as Tag[];
  }, [value, tags]);

  // Filter available tags based on search
  const filteredTags = useMemo(() => {
    if (!inputValue.trim()) return tags;
    const normalizedInput = inputValue.trim().toLowerCase();
    return tags.filter((t) => t.name.toLowerCase().includes(normalizedInput));
  }, [tags, inputValue]);

  // Check if input matches existing tag
  const inputMatchesTag = useMemo(() => {
    if (!inputValue.trim()) return null;
    const normalizedInput = inputValue.trim().toLowerCase();
    return tags.find((t) => t.name.toLowerCase() === normalizedInput);
  }, [inputValue, tags]);

  // Toggle tag selection
  const handleSelect = useCallback(
    (tagId: string) => {
      if (value.includes(tagId)) {
        onChange(value.filter((id) => id !== tagId));
      } else {
        onChange([...value, tagId]);
      }
    },
    [value, onChange]
  );

  // Remove tag
  const handleRemove = useCallback(
    (tagId: string) => {
      onChange(value.filter((id) => id !== tagId));
    },
    [value, onChange]
  );

  // Create new tag
  const handleCreate = useCallback(async () => {
    if (!inputValue.trim() || inputMatchesTag) return;

    try {
      const result = await findOrCreateTags([inputValue.trim()]).unwrap();
      if (result.data && result.data.length > 0) {
        const newTag = result.data[0];
        onChange([...value, newTag.id]);
        setInputValue('');
      }
    } catch {
      // Error handled by RTK Query
    }
  }, [inputValue, inputMatchesTag, findOrCreateTags, value, onChange]);

  // Handle keyboard
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim() && !inputMatchesTag && allowCreate) {
        e.preventDefault();
        handleCreate();
      }
    },
    [inputValue, inputMatchesTag, allowCreate, handleCreate]
  );

  return (
    <div className={cn('space-y-2', className)}>
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border"
              style={{ borderColor: tag.color, backgroundColor: `${tag.color}20` }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
              <button
                type="button"
                className="ml-1 rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => handleRemove(tag.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag picker */}
      <div className="relative">
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
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {/* Search input */}
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <Input
                  type="text"
                  placeholder="Search or create tags..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-8"
                />
              </div>

              {/* Tag list */}
              <div className="max-h-48 overflow-auto p-1">
                {/* Create option */}
                {inputValue.trim() && !inputMatchesTag && allowCreate && (
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={handleCreate}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Create "{inputValue.trim()}"
                  </button>
                )}

                {/* Available tags */}
                {filteredTags.map((tag) => {
                  const isSelected = value.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded',
                        isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                      onClick={() => handleSelect(tag.id)}
                    >
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="truncate">{tag.name}</span>
                      {!tag.isActive && (
                        <span className="text-xs text-gray-400">(inactive)</span>
                      )}
                      {isSelected && <span className="ml-auto text-blue-500">✓</span>}
                    </button>
                  );
                })}

                {filteredTags.length === 0 && !inputValue.trim() && (
                  <div className="px-3 py-2 text-sm text-gray-500">No tags available</div>
                )}

                {filteredTags.length === 0 && inputValue.trim() && inputMatchesTag && (
                  <div className="px-3 py-2 text-sm text-gray-500">No more tags found</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TagSelect;
