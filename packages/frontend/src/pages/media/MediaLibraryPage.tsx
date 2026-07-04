import { useState, useCallback } from 'react';
import {
  Upload,
  Search,
  Filter,
  Trash2,
  Grid,
  List,
  RefreshCw,
  Image,
  FileText,
  Video,
  Music,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import {
  useListMediaQuery,
  useDeleteMediaMutation,
  useBulkMediaOperationMutation,
  type MediaItem,
  type MediaListParams,
} from '@/store/api/mediaApi';
import { MediaGrid, MediaUploader } from '@/components/media';

type ViewMode = 'grid' | 'list';
type MediaTypeFilter = 'all' | 'image' | 'document' | 'video' | 'audio';

/**
 * Media Library Page
 */
export function MediaLibraryPage() {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showUploader, setShowUploader] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filter state
  const [search, setSearch] = useState('');
  const [mediaType, setMediaType] = useState<MediaTypeFilter>('all');
  const [page, setPage] = useState(1);
  const [sortBy] = useState<'createdAt' | 'filename' | 'size'>('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  // Build query params
  const queryParams: MediaListParams = {
    page,
    limit: 24,
    search: search || undefined,
    mediaType: mediaType === 'all' ? undefined : mediaType,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isFetching, refetch } = useListMediaQuery(queryParams);
  const [deleteMedia] = useDeleteMediaMutation();
  const [bulkOperation] = useBulkMediaOperationMutation();

  // Selection handlers
  const handleSelect = useCallback((id: string, multi?: boolean) => {
    if (multi) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setSelectedIds((prev) =>
        prev.includes(id) && prev.length === 1 ? [] : [id]
      );
    }
  }, []);

  const handleSelectAll = useCallback(() => {
    if (data?.data) {
      const allIds = data.data.map((item) => item.id);
      const allSelected = allIds.every((id) => selectedIds.includes(id));
      setSelectedIds(allSelected ? [] : allIds);
    }
  }, [data, selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Action handlers
  const handleDelete = useCallback(
    async (item: MediaItem) => {
      if (window.confirm(`Delete "${item.originalName}"? This can be undone.`)) {
        try {
          await deleteMedia(item.id).unwrap();
        } catch (error) {
          console.error('Failed to delete:', error);
        }
      }
    },
    [deleteMedia]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    
    if (window.confirm(`Delete ${selectedIds.length} item(s)? This can be undone.`)) {
      try {
        await bulkOperation({ ids: selectedIds, action: 'delete' }).unwrap();
        setSelectedIds([]);
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  }, [selectedIds, bulkOperation]);

  const handleUploadComplete = useCallback(() => {
    refetch();
    setShowUploader(false);
  }, [refetch]);

  // Edit handler (placeholder for detail modal)
  const handleEdit = useCallback((item: MediaItem) => {
    console.log('Edit media:', item.id);
    // TODO: Open edit modal
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your images, documents, and other media files
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={() => setShowUploader(!showUploader)}
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
        </div>

        {/* Uploader panel */}
        {showUploader && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <MediaUploader onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Type filter */}
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 text-gray-400" />
              {mediaType === 'all' ? 'All Types' : mediaType}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {/* Type dropdown would go here */}
          </div>

          {/* Type filter buttons */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <button
              type="button"
              className={`p-2 rounded ${mediaType === 'all' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => { setMediaType('all'); setPage(1); }}
              title="All"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={`p-2 rounded ${mediaType === 'image' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => { setMediaType('image'); setPage(1); }}
              title="Images"
            >
              <Image className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={`p-2 rounded ${mediaType === 'document' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => { setMediaType('document'); setPage(1); }}
              title="Documents"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={`p-2 rounded ${mediaType === 'video' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => { setMediaType('video'); setPage(1); }}
              title="Videos"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={`p-2 rounded ${mediaType === 'audio' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => { setMediaType('audio'); setPage(1); }}
              title="Audio"
            >
              <Music className="w-4 h-4" />
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <button
              type="button"
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh */}
          <button
            type="button"
            className="p-2 border rounded-lg hover:bg-gray-50"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
            <span className="text-sm text-indigo-700 font-medium">
              {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-800"
              onClick={handleSelectAll}
            >
              {data?.data?.every((item) => selectedIds.includes(item.id))
                ? 'Deselect all'
                : 'Select all'}
            </button>
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-800"
              onClick={clearSelection}
            >
              Clear selection
            </button>
            <div className="flex-1" />
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 rounded"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : viewMode === 'grid' ? (
          <MediaGrid
            items={data?.data || []}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectionMode="multiple"
          />
        ) : (
          <MediaListView
            items={data?.data || []}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex-shrink-0 border-t bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {(page - 1) * data.pagination.limit + 1} to{' '}
              {Math.min(page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} items
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1 || isFetching}
                className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={page === data.pagination.totalPages || isFetching}
                className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * List view component
 */
function MediaListView({
  items,
  selectedIds,
  onSelect,
  onEdit,
  onDelete,
}: {
  items: MediaItem[];
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onEdit?: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Image className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No media files</p>
        <p className="text-sm mt-1">Upload files to get started</p>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getIcon = (mediaType: MediaItem['mediaType']) => {
    switch (mediaType) {
      case 'image': return Image;
      case 'document': return FileText;
      case 'video': return Video;
      case 'audio': return Music;
      default: return FileText;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="w-8 px-4 py-3">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={items.every((item) => selectedIds.includes(item.id))}
                onChange={() => {
                  items.forEach((item) => onSelect(item.id, true));
                }}
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              File
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Size
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Uploaded
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => {
            const Icon = getIcon(item.mediaType);
            const isSelected = selectedIds.includes(item.id);

            return (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-indigo-50' : ''}`}
                onClick={(e) => onSelect(item.id, e.ctrlKey || e.metaKey)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={isSelected}
                    onChange={() => onSelect(item.id, true)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.mediaType === 'image' ? (
                      <img
                        src={item.variants?.[0]?.url || item.url}
                        alt={item.alt || item.originalName}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {item.originalName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-500 capitalize">{item.mediaType}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-500">{formatFileSize(item.size)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-500">{formatDate(item.createdAt)}</span>
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={() => onEdit(item)}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="p-1 text-red-400 hover:text-red-600"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MediaLibraryPage;
