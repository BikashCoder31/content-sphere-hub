import { useState, useCallback, FormEvent } from 'react';
import {
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
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
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  X,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Category form data
 */
interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  isActive: boolean;
}

const initialFormData: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  parentId: null,
  isActive: true,
};

/**
 * Category tree item component
 */
function CategoryTreeItem({
  category,
  level,
  expandedIds,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
}: {
  category: Category;
  level: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (parentId: string) => void;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group',
          !category.isActive && 'opacity-50'
        )}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {/* Expand toggle */}
        <button
          type="button"
          className={cn(
            'p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded',
            !hasChildren && 'invisible'
          )}
          onClick={() => onToggle(category.id)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Icon */}
        {isExpanded && hasChildren ? (
          <FolderOpen className="h-5 w-5 text-amber-500" />
        ) : (
          <Folder className="h-5 w-5 text-amber-500" />
        )}

        {/* Name */}
        <span className="flex-1 truncate font-medium">{category.name}</span>

        {/* Content count */}
        <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
          {category.contentCount} items
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            onClick={() => onAddChild(category.id)}
            title="Add subcategory"
          >
            <Plus className="h-4 w-4 text-green-600" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            onClick={() => onEdit(category)}
            title="Edit"
          >
            <Pencil className="h-4 w-4 text-blue-600" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            onClick={() => onDelete(category)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Flatten categories for parent select
 */
function flattenForSelect(
  categories: Category[],
  excludeId?: string,
  level = 0
): Array<{ id: string; name: string; level: number }> {
  return categories.reduce<Array<{ id: string; name: string; level: number }>>(
    (acc, cat) => {
      if (cat.id !== excludeId) {
        acc.push({ id: cat.id, name: cat.name, level });
        if (cat.children && cat.children.length > 0) {
          acc.push(...flattenForSelect(cat.children, excludeId, level + 1));
        }
      }
      return acc;
    },
    []
  );
}

/**
 * Categories management page
 */
export function CategoriesPage() {
  // State
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Queries and mutations
  const { data, isLoading, refetch } = useGetCategoryTreeQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const categories = data?.data || [];
  const flatCategories = flattenForSelect(categories, editingCategory?.id);

  // Toggle expand
  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Open create form
  const handleCreate = useCallback((parentId?: string) => {
    setEditingCategory(null);
    setFormData({
      ...initialFormData,
      parentId: parentId || null,
    });
    setIsFormOpen(true);
    setError(null);
  }, []);

  // Open edit form
  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId || null,
      isActive: category.isActive,
    });
    setIsFormOpen(true);
    setError(null);
  }, []);

  // Close form
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData(initialFormData);
    setError(null);
  }, []);

  // Submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingCategory) {
        const updateData: UpdateCategoryInput = {
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description || undefined,
          parentId: formData.parentId || undefined,
          isActive: formData.isActive,
        };
        await updateCategory({ id: editingCategory.id, data: updateData }).unwrap();
      } else {
        const createData: CreateCategoryInput = {
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description || undefined,
          parentId: formData.parentId || undefined,
          isActive: formData.isActive,
        };
        await createCategory(createData).unwrap();
      }
      handleCloseForm();
      refetch();
    } catch (err) {
      setError(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ||
          'Failed to save category'
      );
    }
  };

  // Delete category
  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteCategory(deleteConfirm.id).unwrap();
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      setError(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ||
          'Failed to delete category'
      );
      setDeleteConfirm(null);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organize your content with hierarchical categories
          </p>
        </div>
        <Button onClick={() => handleCreate()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
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

      {/* Category tree */}
      <Card>
        <CardHeader>
          <CardTitle>Category Tree</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No categories yet</p>
              <p className="text-sm mt-1">Create your first category to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {categories.map((category) => (
                <CategoryTreeItem
                  key={category.id}
                  category={category}
                  level={0}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={setDeleteConfirm}
                  onAddChild={handleCreate}
                />
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
                {editingCategory ? 'Edit Category' : 'Create Category'}
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
                  placeholder="Category name"
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
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm"
                />
              </div>

              {/* Parent */}
              <div>
                <label className="block text-sm font-medium mb-1">Parent Category</label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, parentId: e.target.value || null }))}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm"
                >
                  <option value="">None (top-level)</option>
                  {flatCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {'—'.repeat(cat.level)} {cat.name}
                    </option>
                  ))}
                </select>
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
                  {editingCategory ? 'Update' : 'Create'}
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
            <h2 className="text-lg font-semibold mb-2">Delete Category</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete "{deleteConfirm.name}"? This will also delete all
              subcategories.
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

export default CategoriesPage;
