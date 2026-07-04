import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGetMyContentsQuery, useTrashContentMutation, useRestoreContentMutation } from '@/store/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  RotateCcw,
  Eye,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { ContentStatus, ContentType } from '@content-sphere-hub/shared';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  pending_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  archived: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  trash: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  published: 'Published',
  scheduled: 'Scheduled',
  archived: 'Archived',
  trash: 'Trash',
};

const CONTENT_TYPE_ICONS: Record<string, string> = {
  article: '📄',
  page: '📃',
  post: '📝',
  news: '📰',
  tutorial: '📚',
  review: '⭐',
  guide: '📖',
};

export function ContentListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Get query params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = (searchParams.get('status') as ContentStatus) || undefined;
  const contentType = (searchParams.get('contentType') as ContentType) || undefined;
  const search = searchParams.get('search') || undefined;
  const includeTrash = searchParams.get('includeTrash') === 'true';

  // Fetch content
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useGetMyContentsQuery({
    page,
    limit: 10,
    status,
    contentType,
    search,
    includeTrash,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  // Mutations
  const [trashContent, { isLoading: isTrashLoading }] = useTrashContentMutation();
  const [restoreContent, { isLoading: isRestoreLoading }] = useRestoreContentMutation();

  const contents = response?.data || [];
  const pagination = response?.meta;

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) {
      newParams.set('search', searchInput);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  // Handle trash
  const handleTrash = async (id: string) => {
    if (window.confirm('Are you sure you want to move this content to trash?')) {
      try {
        await trashContent(id).unwrap();
      } catch (err) {
        console.error('Failed to trash content:', err);
      }
    }
  };

  // Handle restore
  const handleRestore = async (id: string) => {
    try {
      await restoreContent(id).unwrap();
    } catch (err) {
      console.error('Failed to restore content:', err);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Content</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your articles, pages, and posts</p>
        </div>
        <Link to="/dashboard/content/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Content
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="Search content..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-gray-100 dark:bg-gray-700')}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content Type
                </label>
                <select
                  value={contentType || ''}
                  onChange={(e) => handleFilterChange('contentType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                >
                  <option value="">All Types</option>
                  <option value="article">Article</option>
                  <option value="page">Page</option>
                  <option value="post">Post</option>
                  <option value="news">News</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={includeTrash}
                    onChange={(e) => handleFilterChange('includeTrash', e.target.checked ? 'true' : '')}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  Include Trash
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {pagination ? `${pagination.total} items` : 'Loading...'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : isError ? (
            <Alert variant="error">
              {(error as { data?: { error?: { message?: string } } })?.data?.error?.message ||
                'Failed to load content'}
            </Alert>
          ) : contents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No content yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by creating your first piece of content.
              </p>
              <Link to="/dashboard/content/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Content
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Views
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contents.map((content) => (
                    <tr
                      key={content.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {content.featuredImage ? (
                            <img
                              src={content.featuredImage}
                              alt=""
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                              {CONTENT_TYPE_ICONS[content.contentType] || '📄'}
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/dashboard/content/${content.id}/edit`}
                              className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {content.title}
                            </Link>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{content.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {content.contentType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                            STATUS_COLORS[content.status] || STATUS_COLORS.draft
                          )}
                        >
                          {STATUS_LABELS[content.status] || content.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(content.publishedAt || content.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {content.viewCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {content.status === 'published' && (
                            <Link
                              to={`/content/${content.slug}`}
                              target="_blank"
                              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          {content.status !== 'trash' ? (
                            <>
                              <Link
                                to={`/dashboard/content/${content.id}/edit`}
                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleTrash(content.id)}
                                disabled={isTrashLoading}
                                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                title="Move to Trash"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRestore(content.id)}
                              disabled={isRestoreLoading}
                              className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                              title="Restore"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ContentListPage;
