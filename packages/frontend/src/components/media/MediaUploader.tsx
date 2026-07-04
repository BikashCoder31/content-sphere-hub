import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useUploadMultipleMediaMutation } from '@/store/api/mediaApi';

interface MediaUploaderProps {
  folderId?: string;
  onUploadComplete?: () => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
}

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
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
 * Media uploader with drag and drop
 */
export function MediaUploader({
  folderId,
  onUploadComplete,
  maxFiles = 10,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    'application/pdf': ['.pdf'],
    'video/*': ['.mp4', '.webm'],
    'audio/*': ['.mp3', '.wav', '.ogg'],
  },
}: MediaUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploadMedia, { isLoading }] = useUploadMultipleMediaMutation();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: 'pending',
      }));
      setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
    },
    [maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
    disabled: isLoading,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    // Mark all as uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'pending' ? { ...f, status: 'uploading' } : f
      )
    );

    try {
      const result = await uploadMedia({
        files: pendingFiles.map((f) => f.file),
        folderId,
      }).unwrap();

      // Update file statuses
      setFiles((prev) =>
        prev.map((f) => {
          if (f.status !== 'uploading') return f;

          // Check if this file was successful
          const uploaded = result.data.uploaded.find(
            (u) => u.originalName === f.file.name
          );
          if (uploaded) {
            return { ...f, status: 'success' };
          }

          // Check if this file failed
          const failed = result.data.failed?.find(
            (fail) => fail.filename === f.file.name
          );
          if (failed) {
            return { ...f, status: 'error', error: failed.error };
          }

          return { ...f, status: 'success' };
        })
      );

      onUploadComplete?.();
    } catch (error) {
      // Mark all uploading as error
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading'
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        )
      );
    }
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? isDragReject
              ? 'border-red-400 bg-red-50'
              : 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`w-10 h-10 mx-auto mb-4 ${
            isDragActive
              ? isDragReject
                ? 'text-red-400'
                : 'text-indigo-400'
              : 'text-gray-400'
          }`}
        />
        {isDragActive ? (
          isDragReject ? (
            <p className="text-red-600">Some files are not allowed</p>
          ) : (
            <p className="text-indigo-600">Drop files here...</p>
          )
        ) : (
          <>
            <p className="text-gray-600 font-medium">
              Drag & drop files here, or click to select
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Images, PDFs, videos, and audio files up to 100MB
            </p>
          </>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
              {successCount > 0 && (
                <span className="text-green-600 ml-2">
                  ({successCount} uploaded)
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600 ml-2">({errorCount} failed)</span>
              )}
            </span>
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={clearAll}
            >
              Clear all
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className={`flex items-center gap-3 p-2 rounded border ${
                  uploadFile.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : uploadFile.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                  )}
                  {uploadFile.status === 'success' && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  {uploadFile.status === 'pending' && (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadFile.file.size)}
                    {uploadFile.error && (
                      <span className="text-red-500 ml-2">{uploadFile.error}</span>
                    )}
                  </p>
                </div>

                {/* Remove button */}
                {uploadFile.status === 'pending' && (
                  <button
                    type="button"
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                    onClick={() => removeFile(uploadFile.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      {pendingCount > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUpload}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default MediaUploader;
