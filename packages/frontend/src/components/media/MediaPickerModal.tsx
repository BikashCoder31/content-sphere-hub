import { useState, useCallback } from 'react';
import { X, Search, Upload, Image, Loader2 } from 'lucide-react';
import { useListMediaQuery, type MediaItem } from '@/store/api/mediaApi';
import { MediaGrid } from './MediaGrid';
import { MediaUploader } from './MediaUploader';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  selectionMode?: 'single' | 'multiple';
  mediaType?: 'image' | 'document' | 'video' | 'audio' | 'other';
  title?: string;
}

type Tab = 'library' | 'upload';

/**
 * Media picker modal for selecting media from library or uploading new
 */
export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectionMode = 'single',
  mediaType,
  title = 'Select Media',
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('library');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useListMediaQuery(
    {
      page,
      limit: 24,
      search: search || undefined,
      mediaType,
    },
    { skip: !isOpen }
  );

  const handleSelect = useCallback(
    (id: string, multi?: boolean) => {
      if (selectionMode === 'single') {
        setSelectedIds([id]);
      } else {
        if (multi) {
          setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          );
        } else {
          setSelectedIds((prev) =>
            prev.includes(id) && prev.length === 1 ? [] : [id]
          );
        }
      }
    },
    [selectionMode]
  );

  const handleDoubleClick = useCallback(
    (item: MediaItem) => {
      if (selectionMode === 'single') {
        onSelect(item);
        onClose();
      }
    },
    [selectionMode, onSelect, onClose]
  );

  const handleConfirm = useCallback(() => {
    if (selectedIds.length === 0) return;

    const selectedItems = data?.data.filter((item) =>
      selectedIds.includes(item.id)
    );

    if (selectedItems) {
      if (selectionMode === 'single') {
        onSelect(selectedItems[0]);
      } else {
        onSelect(selectedItems);
      }
    }
    onClose();
  }, [selectedIds, data, selectionMode, onSelect, onClose]);

  const handleUploadComplete = useCallback(() => {
    refetch();
    setActiveTab('library');
  }, [refetch]);

  const handleClose = useCallback(() => {
    setSelectedIds([]);
    setSearch('');
    setPage(1);
    setActiveTab('library');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="absolute inset-4 md:inset-8 lg:inset-16 bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            type="button"
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'library'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('library')}
          >
            <Image className="w-4 h-4" />
            Media Library
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload className="w-4 h-4" />
            Upload New
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'library' ? (
            <>
              {/* Search bar */}
              <div className="p-4 border-b">
                <div className="relative">
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
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  </div>
                ) : (
                  <MediaGrid
                    items={data?.data || []}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onDoubleClick={handleDoubleClick}
                    selectionMode={selectionMode}
                  />
                )}
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t">
                  <button
                    type="button"
                    disabled={page === 1 || isFetching}
                    className="px-3 py-1 text-sm rounded border disabled:opacity-50"
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
                    className="px-3 py-1 text-sm rounded border disabled:opacity-50"
                    onClick={() =>
                      setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <MediaUploader onUploadComplete={handleUploadComplete} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <span className="text-sm text-gray-600">
            {selectedIds.length > 0
              ? `${selectedIds.length} item${selectedIds.length !== 1 ? 's' : ''} selected`
              : 'No items selected'}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirm}
            >
              {selectionMode === 'single' ? 'Select' : `Select ${selectedIds.length}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaPickerModal;
