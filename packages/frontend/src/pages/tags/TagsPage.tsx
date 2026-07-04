import { useState, useCallback, FormEvent } from 'react';
import {
  useListTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useBulkTagOperationMutation,
  Tag,
  CreateTagInput,
  TagListParams,
} from '@/store/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import {
  Plus,
  Pencil,
  Trash2,
  Tag as TagIcon,
  Search,
  X,
  Save,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Tag form data
 */
interface TagFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  isActive: boolean;
}

const initialFormData: TagFormData = {
  name: '',
  slug: '',
  description: '',
  color: '#3B82F6',
  isActive: true,
};

const colorPresets = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#78716C', '#000000',
];

/**
 * Tags management page
 */
export function TagsPage() {
  // State
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagFormData>(initialFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<Tag | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Query params
  const queryParams: TagListParams = {
    search: search || undefined,
    limit: 100,
  };

  // Queries and mutations
  const { data, isLoading, refetch } = useListTagsQuery(queryParams);
  const [createTag, { isLoading: isCreating }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();
  const [bulkOperation, { isLoading: isBulkOperating }] = useBulkTagOperationMutation();

  const tags = data?.data || [];

  // Toggle selection
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Select all
  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === tags.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tags.map((t) => t.id)));
    }
  }, [tags, selectedIds.size]);

  // Open create form
  const handleCreate = useCallback(() => {
    setEditingTag(null);
    setFormData(initialFormData);
    setIsFormOpen(true);
    setError(null);
  }, []);

  // Open edit form
  const handleEdit = useCallback((tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color,
      isActive: tag.isActive,
    });
    setIsFormOpen(true);
    setError(null);
  }, []);

  // Close form
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTag(null);
    setFormData(initialFormData);
    setError(null);
  }, []);

  // Submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingTag) {
        await updateTag({
          id: editingTag.id,
          data: {
            name: formData.name,
            slug: formData.slug || undefined,
            description: formData.description || undefined,
            color: formData.color,
            isActive: formData.isActive,
          },
        }).unwrap();
      } else {
        const createData: CreateTagInput = {
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description || undefined,
          color: formData.color,
          isActive: formData.isActive,
        };
        await createTag(createData).unwrap();
      }
      handleCloseForm();
      refetch();
    } catch (err) {
      setError(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ||
          'Failed to save tag'
      );
    }
  };

  // Delete tag
  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteTag(deleteConfirm.id).unwrap();
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      setError(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ||
          'Failed to delete tag'
      );
      setDeleteConfirm(null);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      await bulkOperation({
        action: 'delete',
        ids: Array.from(selectedIds),
      }).unwrap();
      setSelectedIds(new Set());
      refetch();
    } catch (err) {
      setError(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ||
          'Failed to delete tags'
      );
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tags</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Label and organize your content with tags
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-sm underline">
            Dismiss
          </button>
        </Alert>
      )}

      {/* Search and bulk actions */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedIds.size} selected</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isBulkOperating}
            >
              {isBulkOperating && <Spinner size="sm" className="mr-2" />}
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Tag list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tags ({tags.length})</CardTitle>
            {tags.length > 0 && (
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={handleSelectAll}
              >
                {selectedIds.size === tags.length ? 'Deselect all' : 'Select all'}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TagIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{search ? 'No tags found' : 'No tags yet'}</p>
              <p className="text-sm mt-1">
                {search ? 'Try a different search term' : 'Create your first tag to get started'}
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 group',
                    selectedIds.has(tag.id) && 'bg-blue-50 dark:bg-blue-900/20 border-blue-300',
                    !tag.isActive && 'opacity-50'
                  )}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center',
                      selectedIds.has(tag.id)
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                    onClick={() => handleToggleSelect(tag.id)}
                  >
                    {selectedIds.has(tag.id) && <Check className="h-3 w-3" />}
                  </button>

                  {/* Color */}
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />

                  {/* Name and slug */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{tag.name}</div>
                    <div className="text-xs text-gray-500 truncate">/{tag.slug}</div>
                  </div>

                  {/* Content count */}
                  <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                    {tag.contentCount} items
                  </span>

                  {/* Status */}
                  {!tag.isActive && (
                    <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                      Inactive
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      onClick={() => handleEdit(tag)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      onClick={() => setDeleteConfirm(tag)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseForm} />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingTag ? 'Edit Tag' : 'Create Tag'}
              </h2>
              <button
                type="button"
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                onClick={handleCloseForm}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: prev.slug || generateSlug(name),
                    }));
                  }}
                  placeholder="Tag name"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        'w-7 h-7 rounded-full border-2',
                        formData.color === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-sm text-gray-500">Custom:</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-24 h-8 text-xs"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Spinner size="sm" className="mr-2" />}
                  <Save className="h-4 w-4 mr-2" />
                  {editingTag ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Tag</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete "{deleteConfirm.name}"?
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting && <Spinner size="sm" className="mr-2" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TagsPage;
