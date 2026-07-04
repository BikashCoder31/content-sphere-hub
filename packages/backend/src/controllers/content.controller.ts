import type { Request, Response, NextFunction } from 'express';
import {
  getContents,
  getContentById,
  getContentBySlug,
  createContent,
  updateContent,
  updateContentStatus,
  trashContent,
  restoreContent,
  deleteContent,
  bulkContentOperation,
  checkSlugAvailability,
  incrementViewCount,
  ContentError,
  ContentAccessContext,
} from '../services/content.service.js';
import {
  createContentSchema,
  updateContentSchema,
  contentListQuerySchema,
  contentIdParamSchema,
  updateContentStatusSchema,
  bulkContentOperationSchema,
  checkSlugSchema,
} from '../schemas/content.schema.js';
import { sendSuccess, sendCreated, sendNoContent, sendError, ErrorCodes } from '../utils/response.js';
import type { AuthRequest } from '../middleware/auth.js';

/**
 * Build access context from request
 */
function buildContext(req: AuthRequest): ContentAccessContext {
  return {
    userId: req.user?.id,
    userRoleSlug: req.user?.role?.slug,
    userPermissions: req.user?.role?.permissions || [],
  };
}

/**
 * @desc    Get all contents with pagination and filtering
 * @route   GET /api/v1/content
 * @access  Public (filtered by visibility) / Private (full access for admins)
 */
export async function getContentsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = contentListQuerySchema.parse(req.query);
    const context = buildContext(req as AuthRequest);
    const result = await getContents(query, context);
    sendSuccess(res, result.data, 200, {
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get content by ID
 * @route   GET /api/v1/content/:id
 * @access  Public (if published) / Private (for draft/private)
 */
export async function getContentByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = contentIdParamSchema.parse(req.params);
    const context = buildContext(req as AuthRequest);
    const content = await getContentById(id, context);
    sendSuccess(res, content);
  } catch (error) {
    if (error instanceof ContentError) {
      if (error.code === 'CONTENT_NOT_FOUND') {
        sendError(res, ErrorCodes.NOT_FOUND, error.message, 404);
        return;
      }
      if (error.code === 'ACCESS_DENIED') {
        sendError(res, ErrorCodes.FORBIDDEN, error.message, 403);
        return;
      }
    }
    next(error);
  }
}

/**
 * @desc    Get content by slug
 * @route   GET /api/v1/content/slug/:slug
 * @access  Public (if published) / Private (for draft/private)
 */
export async function getContentBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;
    if (!slug) {
      sendError(res, ErrorCodes.VALIDATION_ERROR, 'Slug is required', 400);
      return;
    }
    const context = buildContext(req as AuthRequest);
    const content = await getContentBySlug(slug, context);

    // Increment view count for public views
    if (content.status === 'published' && content.visibility === 'public') {
      await incrementViewCount(content.id);
    }

    sendSuccess(res, content);
  } catch (error) {
    if (error instanceof ContentError) {
      if (error.code === 'CONTENT_NOT_FOUND') {
        sendError(res, ErrorCodes.NOT_FOUND, error.message, 404);
        return;
      }
      if (error.code === 'ACCESS_DENIED') {
        sendError(res, ErrorCodes.FORBIDDEN, error.message, 403);
        return;
      }
    }
    next(error);
  }
}

/**
 * @desc    Create new content
 * @route   POST /api/v1/content
 * @access  Private (content:create permission)
 */
export async function createContentHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = createContentSchema.parse(req.body);
    const authorId = req.user!.id;
    const content = await createContent(input, authorId);
    sendCreated(res, content);
  } catch (error) {
    if (error instanceof ContentError) {
      if (error.code === 'INVALID_SLUG') {
        sendError(res, ErrorCodes.VALIDATION_ERROR, error.message, 400);
        return;
      }
      if (error.code === 'SLUG_EXISTS') {
        sendError(res, ErrorCodes.ALREADY_EXISTS, error.message, 409);
        return;
      }
    }
    next(error);
  }
}

/**
 * @desc    Update content
 * @route   PATCH /api/v1/content/:id
 * @access  Private (owner or content:update permission)
 */
export async function updateContentHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = contentIdParamSchema.parse(req.params);
    const input = updateContentSchema.parse(req.body);
    const context = buildContext(req);
    const content = await updateContent(id, input, context);
    sendSuccess(res, content);
  } catch (error) {
    if (error instanceof ContentError) {
      if (error.code === 'CONTENT_NOT_FOUND') {
        sendError(res, ErrorCodes.NOT_FOUND, error.message, 404);
        return;
      }
      if (error.code === 'PERMISSION_DENIED') {
        sendError(res, ErrorCodes.FORBIDDEN, error.message, 403);
        return;
      }
      if (error.code === 'INVALID_SLUG' || error.code === 'SLUG_EXISTS') {
        sendError(res, ErrorCodes.VALIDATION_ERROR, error.message, 400);
        return;
      }
    }
    next(error);
  }
}

/**
 * @desc    Update content status
 * @route   PATCH /api/v1/content/:id/status
 * @access  Private (owner or content:update permission)
 */
export async function updateContentStatusHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = contentIdParamSchema.parse(req.params);
    const input = updateContentStatusSchema.parse(req.body);
    const context = buildContext(req);
    const content = await updateContentStatus(id, input, context);
    sendSuccess(res, content);
  } catch (error) {
    if (error instanceof ContentError) {
      if (error.code === 'CONTENT_NOT_FOUND') {
        sendError(res, ErrorCodes.NOT_FOUND, error.message, 404);
        return;
      }
      if (error.code === 'PERMISSION_DENIED') {
        sendError(res, ErrorCodes.FORBIDDEN, error.message, 403);
        return;
      }
    }
    next(error);
  }
}

/**
 * @desc    Move content to trash
 * @route   DELETE /api/v1/content/:id
 * @access  Private (owner or content:delete permission)
 */
export async function trashContentHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = contentIdParamSchema.parse(req.params);
    const context = buildContext(req);
    const content = await trashContent(id, context);
    sendSuccess(res, content);
  } catch (error) {
    if (error instanceof ContentError) {
      if (error.code === 'CONTENT_NOT_FOUND') {
        sendError(res, ErrorCodes.NOT_FOUND, error.message, 404);
        return;
      }
      if (error.code === 'PERMISSION_DENIED') {
        sendError(res, ErrorCodes.FORBIDDEN, error.message, 403);
        return;
      }
    }
    next(error);
  }
}

/**
 * @desc    Restore content from trash
 * @route   POST /api/v1/content/:id/restore
 * @access  Private (owner or content:delete permission)
 */
export async function restoreContentHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = contentIdParamSchema.parse(req.params);
    const context = buildContext(req);
    const content = await restoreContent(id, context);
    sendSuccess(res, content);
  } catch (error) {
    if (error instanceof ContentError) {
      if (error.code === 'CONTENT_NOT_FOUND') {
        sendError(res, ErrorCodes.NOT_FOUND, error.message, 404);
        return;
      }
      if (error.code === 'NOT_IN_TRASH') {
        sendError(res, ErrorCodes.VALIDATION_ERROR, error.message, 400);
        return;
      }
      if (error.code === 'PERMISSION_DENIED') {
        sendError(res, ErrorCodes.FORBIDDEN, error.message, 403);
        return;
      }
    }
    next(error);
  }
}

/**
 * @desc    Permanently delete content
 * @route   DELETE /api/v1/content/:id/permanent
 * @access  Private (admin only)
 */
export async function deleteContentHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = contentIdParamSchema.parse(req.params);
    const context = buildContext(req);
    await deleteContent(id, context);
    sendNoContent(res);
  } catch (error) {
    if (error instanceof ContentError) {
      if (error.code === 'CONTENT_NOT_FOUND') {
        sendError(res, ErrorCodes.NOT_FOUND, error.message, 404);
        return;
      }
      if (error.code === 'PERMISSION_DENIED') {
        sendError(res, ErrorCodes.FORBIDDEN, error.message, 403);
        return;
      }
    }
    next(error);
  }
}

/**
 * @desc    Bulk content operations
 * @route   POST /api/v1/content/bulk
 * @access  Private (content permissions)
 */
export async function bulkContentOperationHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = bulkContentOperationSchema.parse(req.body);
    const context = buildContext(req);
    const result = await bulkContentOperation(input, context);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Check slug availability
 * @route   GET /api/v1/content/check-slug
 * @access  Private (authenticated)
 */
export async function checkSlugHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug, excludeId } = checkSlugSchema.parse(req.query);
    const result = await checkSlugAvailability(slug, excludeId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get user's own content
 * @route   GET /api/v1/content/my
 * @access  Private (authenticated)
 */
export async function getMyContentsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = contentListQuerySchema.parse({
      ...req.query,
      authorId: req.user!.id,
    });
    const context = buildContext(req);
    const result = await getContents(query, context);
    sendSuccess(res, result.data, 200, {
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages,
    });
  } catch (error) {
    next(error);
  }
}
