import { useState } from 'react';
import {
  Image,
  FileText,
  Video,
  Music,
  File,
  Check,
  MoreVertical,
  Download,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import type { MediaItem } from '@/store/api/mediaApi';

interface MediaGridProps {
  items: MediaItem[];
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onDoubleClick?: (item: MediaItem) => void;
  onEdit?: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
  selectionMode?: 'single' | 'multiple';
}

/**
 * Get icon for media type
 */
function getMediaIcon(mediaType: MediaItem['mediaType']) {
  switch (mediaType) {
    case 'image':
      return Image;
    case 'document':
      return FileText;
    case 'video':
      return Video;
    case 'audio':
      return Music;
    default:
      return File;
  }
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Media grid item component
 */
function MediaGridItem({
  item,
  isSelected,
  onSelect,
  onDoubleClick,
  onEdit,
  onDelete,
  selectionMode,
}: {
  item: MediaItem;
  isSelected: boolean;
  onSelect: (id: string, multi?: boolean) => void;
  onDoubleClick?: (item: MediaItem) => void;
  onEdit?: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
  selectionMode?: 'single' | 'multiple';
}) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = getMediaIcon(item.mediaType);

  // Get thumbnail URL (smallest variant for images)
  const thumbnailUrl =
    item.mediaType === 'image'
      ? item.variants?.find((v) => v.name === 'thumbnail')?.url ||
        item.variants?.find((v) => v.name === 'small')?.url ||
        item.url
      : null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(item.id, e.ctrlKey || e.metaKey || selectionMode === 'multiple');
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onDoubleClick?.(item);
  };

  return (
    <div
      className={`group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Thumbnail / Preview */}
      <div className="aspect-square relative bg-gray-100 flex items-center justify-center">
        {item.mediaType === 'image' && thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={item.alt || item.originalName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Icon className="w-12 h-12 text-gray-400" />
        )}

        {/* Selection checkbox */}
        {selectionMode === 'multiple' && (
          <div
            className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-indigo-500 border-indigo-500'
                : 'bg-white/80 border-gray-300 group-hover:border-gray-400'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        )}

        {/* Menu button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1 bg-white/90 rounded shadow-sm hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 bg-white rounded-md shadow-lg border py-1 min-w-[140px]">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
                <a
                  href={item.url}
                  download={item.originalName}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                {onEdit && (
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit(item);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(item);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Selected indicator overlay */}
        {isSelected && selectionMode !== 'multiple' && (
          <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-sm font-medium text-gray-900 truncate" title={item.originalName}>
          {item.originalName}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatFileSize(item.size)}
          {item.width && item.height && ` • ${item.width}×${item.height}`}
        </p>
      </div>
    </div>
  );
}

/**
 * Media grid component
 */
export function MediaGrid({
  items,
  selectedIds,
  onSelect,
  onDoubleClick,
  onEdit,
  onDelete,
  selectionMode = 'single',
}: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Image className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No media files</p>
        <p className="text-sm mt-1">Upload files to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <MediaGridItem
          key={item.id}
          item={item}
          isSelected={selectedIds.includes(item.id)}
          onSelect={onSelect}
          onDoubleClick={onDoubleClick}
          onEdit={onEdit}
          onDelete={onDelete}
          selectionMode={selectionMode}
        />
      ))}
    </div>
  );
}

export default MediaGrid;
