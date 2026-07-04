import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  updateCategory,
  deleteCategory,
  checkSlugAvailability,
  reorderCategories,
  getCategoryPath,
  CategoryError,
} from '../services/category.service.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categoryListQuerySchema,
} from '../schemas/taxonomy.schema.js';

/**
 * Create category
 */
export async function createCategoryController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const input = createCategorySchema.parse(req.body);
    const result = await createCategory(input);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof CategoryError) {
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
 * Get category by ID
 */
export async function getCategoryByIdController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const result = await getCategoryById(id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof CategoryError) {
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
 * Get category by slug
 */
export async function getCategoryBySlugController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const slug = req.params.slug;
    const result = await getCategoryBySlug(slug);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof CategoryError) {
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
 * List categories
 */
export async function listCategoriesController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const query = categoryListQuerySchema.parse(req.query);
    const result = await listCategories(query);

    res.json(result);
  } catch (error) {
    if (error instanceof CategoryError) {
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
 * Update category
 */
export async function updateCategoryController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const input = updateCategorySchema.parse(req.body);
    const result = await updateCategory(id, input);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof CategoryError) {
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
 * Delete category
 */
export async function deleteCategoryController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    await deleteCategory(id);

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    if (error instanceof CategoryError) {
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
export async function checkCategorySlugController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const slug = req.params.slug;
    const excludeId = req.query.excludeId as string | undefined;
    const result = await checkSlugAvailability(slug, excludeId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof CategoryError) {
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
 * Reorder categories
 */
export async function reorderCategoriesController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { orders } = req.body as { orders: Array<{ id: string; sortOrder: number }> };
    await reorderCategories(orders);

    res.json({
      success: true,
      message: 'Categories reordered successfully',
    });
  } catch (error) {
    if (error instanceof CategoryError) {
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
 * Get category path (breadcrumb)
 */
export async function getCategoryPathController(
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const result = await getCategoryPath(id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof CategoryError) {
      res.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }
    throw error;
  }
}
