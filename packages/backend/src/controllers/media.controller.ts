import type { Response, NextFunction, RequestHandler, Request } from 'express';
import type { FileFilterCallback } from 'multer';
import type { AuthRequest } from '../middleware/auth.js';
import {
  uploadMedia,
  getMediaById,
  listMedia,
  updateMedia,
  deleteMedia,
  restoreMedia,
  permanentlyDeleteMedia,
  bulkMediaOperation,
  createMediaFolder,
  listMediaFolders,
  updateMediaFolder,
  deleteMediaFolder,
  MediaError,
} from '../services/media.service.js';
import {
  mediaListQuerySchema,
  mediaIdParamSchema,
  updateMediaSchema,
  bulkMediaOperationSchema,
  createMediaFolderSchema,
  updateMediaFolderSchema,
  MediaListQueryParams,
  BulkMediaOperation,
  CreateMediaFolderInput,
} from '../schemas/media.schema.js';
import { ALL_ALLOWED_MIME_TYPES } from '../storage/storage.interface.js';

// Dynamic import for multer (CommonJS module)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let multerInstance: any = null;

async function getMulter() {
  if (!multerInstance) {
    const multerModule = await import('multer');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const multer = (multerModule as any).default || multerModule;
    const storage = multer.memoryStorage();
    multerInstance = multer({
      storage,
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max
        files: 10,
      },
      fileFilter: (
        _req: Express.Request,
        file: Express.Multer.File,
        cb: FileFilterCallback
      ) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (ALL_ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
          cb(null, true);
        } else {
          cb(new Error(`File type '${file.mimetype}' is not allowed`));
        }
      },
    });
  }
  return multerInstance;
}

// Export multer middleware as async functions
export const uploadSingle: RequestHandler = async (req, res, next) => {
  const multer = await getMulter();
  multer.single('file')(req, res, next);
};

export const uploadMultiple: RequestHandler = async (req, res, next) => {
  const multer = await getMulter();
  multer.array('files', 10)(req, res, next);
};

/**
 * Handle multer errors
 */
export function handleMulterError(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Check for multer-specific errors by error name/code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const multerError = err as any;
  if (multerError.name === 'MulterError' || multerError.code) {
    switch (multerError.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds maximum allowed size',
          },
        });
        return;
      case 'LIMIT_FILE_COUNT':
        res.status(400).json({
          success: false,
          error: {
            code: 'TOO_MANY_FILES',
            message: 'Too many files uploaded',
          },
        });
        return;
      case 'LIMIT_UNEXPECTED_FILE':
        res.status(400).json({
          success: false,
          error: {
            code: 'UNEXPECTED_FILE',
            message: 'Unexpected file field',
          },
        });
        return;
      default:
        if (multerError.code) {
          res.status(400).json({
            success: false,
            error: {
              code: 'UPLOAD_ERROR',
              message: err.message,
            },
          });
          return;
        }
    }
  }

  if (err.message.includes('not allowed')) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: err.message,
      },
    });
    return;
  }

  next(err);
}

/**
 * Upload single file
 */
export async function uploadSingleFile(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'No file uploaded' },
      });
      return;
    }

    const folderId = req.body.folderId || undefined;

    const result = await uploadMedia(
      file.buffer,
      file.originalname,
      file.mimetype,
      userId,
      folderId
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_FILES', message: 'No files uploaded' },
      });
      return;
    }

    const folderId = req.body.folderId || undefined;
    const uploaded: unknown[] = [];
    const failed: Array<{ filename: string; error: string }> = [];

    for (const file of files) {
      try {
        const result = await uploadMedia(
          file.buffer,
          file.originalname,
          file.mimetype,
          userId,
          folderId
        );
        uploaded.push(result);
      } catch (error) {
        failed.push({
          filename: file.originalname,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    res.status(201).json({
      success: true,
      data: { uploaded, failed: failed.length > 0 ? failed : undefined },
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * Get media by ID
 */
export async function getMediaByIdController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = mediaIdParamSchema.parse(req.params);
    const result = await getMediaById(id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * List media with filters
 */
export async function listMediaController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const params = mediaListQuerySchema.parse(req.query) as MediaListQueryParams;
    const result = await listMedia(params);

    res.json(result);
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * Update media metadata
 */
export async function updateMediaController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const { id } = mediaIdParamSchema.parse(req.params);
    const input = updateMediaSchema.parse(req.body);
    const result = await updateMedia(id, input, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * Delete media (soft delete)
 */
export async function deleteMediaController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = mediaIdParamSchema.parse(req.params);
    await deleteMedia(id);

    res.json({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * Restore deleted media
 */
export async function restoreMediaController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = mediaIdParamSchema.parse(req.params);
    const result = await restoreMedia(id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * Permanently delete media
 */
export async function permanentlyDeleteMediaController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = mediaIdParamSchema.parse(req.params);
    await permanentlyDeleteMedia(id);

    res.json({
      success: true,
      message: 'Media permanently deleted',
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * Bulk media operations
 */
export async function bulkMediaOperationController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const input = bulkMediaOperationSchema.parse(req.body) as BulkMediaOperation;
    const result = await bulkMediaOperation(input);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * Create media folder
 */
export async function createMediaFolderController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const input = createMediaFolderSchema.parse(req.body) as CreateMediaFolderInput;
    const result = await createMediaFolder(input, userId);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * List media folders
 */
export async function listMediaFoldersController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const parentId = req.query.parentId === 'null' ? null : (req.query.parentId as string | undefined);
    const result = await listMediaFolders(parentId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * Update media folder
 */
export async function updateMediaFolderController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = mediaIdParamSchema.parse(req.params);
    const input = updateMediaFolderSchema.parse(req.body);
    const result = await updateMediaFolder(id, input);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}

/**
 * Delete media folder
 */
export async function deleteMediaFolderController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = mediaIdParamSchema.parse(req.params);
    await deleteMediaFolder(id);

    res.json({
      success: true,
      message: 'Folder deleted successfully',
    });
  } catch (error) {
    if (error instanceof MediaError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}
