import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import {
  createTag,
  getTagById,
  getTagBySlug,
  listTags,
  updateTag,
  deleteTag,
  bulkTagOperation,
  checkTagSlugAvailability,
  findOrCreateTags,
  getPopularTags,
  TagError,
} from '../services/tag.service.js';
import {
  createTagSchema,
  updateTagSchema,
  tagIdParamSchema,
  tagListQuerySchema,
  bulkTagOperationSchema,
} from '../schemas/taxonomy.schema.js';

/**
 * Create tag
 */
export async function createTagController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const input = createTagSchema.parse(req.body);
    const result = await createTag(input);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof TagError) {
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
 * Get tag by ID
 */
export async function getTagByIdController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = tagIdParamSchema.parse(req.params);
    const result = await getTagById(id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof TagError) {
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
 * Get tag by slug
 */
export async function getTagBySlugController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const slug = req.params.slug;
    const result = await getTagBySlug(slug);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof TagError) {
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
 * List tags
 */
export async function listTagsController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const query = tagListQuerySchema.parse(req.query);
    const result = await listTags(query);

    res.json(result);
  } catch (error) {
    if (error instanceof TagError) {
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
 * Update tag
 */
export async function updateTagController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = tagIdParamSchema.parse(req.params);
    const input = updateTagSchema.parse(req.body);
    const result = await updateTag(id, input);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof TagError) {
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
 * Delete tag
 */
export async function deleteTagController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = tagIdParamSchema.parse(req.params);
    await deleteTag(id);

    res.json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    if (error instanceof TagError) {
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
 * Bulk tag operations
 */
export async function bulkTagOperationController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const operation = bulkTagOperationSchema.parse(req.body);
    const result = await bulkTagOperation(operation);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof TagError) {
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
 * Check slug availability
 */
export async function checkTagSlugController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const slug = req.params.slug;
    const excludeId = req.query.excludeId as string | undefined;
    const result = await checkTagSlugAvailability(slug, excludeId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof TagError) {
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
 * Find or create tags from names
 */
export async function findOrCreateTagsController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { names } = req.body as { names: string[] };
    const result = await findOrCreateTags(names);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof TagError) {
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
 * Get popular tags
 */
export async function getPopularTagsController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getPopularTags(limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof TagError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}
