import mongoose from 'mongoose';
import { Category, ICategory } from '../models/category.model.js';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryListQuery,
} from '../schemas/taxonomy.schema.js';

/**
 * Custom error for category operations
 */
export class CategoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'CategoryError';
  }
}

/**
 * Category response type
 */
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  featuredImage?: string;
  sortOrder: number;
  isActive: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  contentCount: number;
  children?: CategoryResponse[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Category list response type
 */
export interface CategoryListResponse {
  success: boolean;
  data: CategoryResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Convert category document to response
 */
function toCategoryResponse(cat: ICategory, children?: CategoryResponse[]): CategoryResponse {
  return {
    id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    parentId: cat.parentId?.toString(),
    featuredImage: cat.featuredImage || undefined,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
    seo: cat.seo,
    contentCount: cat.contentCount,
    children,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  };
}

/**
 * Generate slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Create a new category
 */
export async function createCategory(input: CreateCategoryInput): Promise<CategoryResponse> {
  // Generate slug if not provided
  const slug = input.slug || generateSlug(input.name);

  // Check for duplicate slug
  const existing = await Category.findOne({ slug });
  if (existing) {
    throw new CategoryError('A category with this slug already exists', 'DUPLICATE_SLUG', 409);
  }

  // Validate parent exists
  if (input.parentId) {
    const parent = await Category.findById(input.parentId);
    if (!parent) {
      throw new CategoryError('Parent category not found', 'PARENT_NOT_FOUND', 404);
    }
  }

  const category = await Category.create({
    ...input,
    slug,
    parentId: input.parentId ? new mongoose.Types.ObjectId(input.parentId) : null,
  });

  return toCategoryResponse(category);
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<CategoryResponse> {
  const category = await Category.findById(id);
  if (!category) {
    throw new CategoryError('Category not found', 'NOT_FOUND', 404);
  }
  return toCategoryResponse(category);
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryResponse> {
  const category = await Category.findOne({ slug });
  if (!category) {
    throw new CategoryError('Category not found', 'NOT_FOUND', 404);
  }
  return toCategoryResponse(category);
}

/**
 * List categories with filters
 */
export async function listCategories(query: CategoryListQuery): Promise<CategoryListResponse> {
  const { search, parentId, isActive, tree, page, limit, sortBy, sortOrder } = query;

  // If tree view requested, return hierarchical structure
  if (tree) {
    const categories = await Category.getTree();
    const buildResponse = (cats: (ICategory & { children?: ICategory[] })[]): CategoryResponse[] => {
      return cats.map((cat) => toCategoryResponse(cat, cat.children ? buildResponse(cat.children) : undefined));
    };
    return {
      success: true,
      data: buildResponse(categories as (ICategory & { children?: ICategory[] })[]),
      pagination: {
        page: 1,
        limit: categories.length,
        total: categories.length,
        totalPages: 1,
      },
    };
  }

  // Build filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (parentId !== undefined) {
    filter.parentId = parentId ? new mongoose.Types.ObjectId(parentId) : null;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  // Count total
  const total = await Category.countDocuments(filter);

  // Build sort
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Fetch with pagination
  const categories = await Category.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    success: true,
    data: categories.map((cat) => toCategoryResponse(cat)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update category
 */
export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<CategoryResponse> {
  const category = await Category.findById(id);
  if (!category) {
    throw new CategoryError('Category not found', 'NOT_FOUND', 404);
  }

  // Check slug uniqueness if changed
  if (input.slug && input.slug !== category.slug) {
    const existing = await Category.findOne({ slug: input.slug, _id: { $ne: id } });
    if (existing) {
      throw new CategoryError('A category with this slug already exists', 'DUPLICATE_SLUG', 409);
    }
  }

  // Validate parent
  if (input.parentId !== undefined) {
    if (input.parentId === id) {
      throw new CategoryError('Category cannot be its own parent', 'INVALID_PARENT', 400);
    }
    if (input.parentId) {
      const parent = await Category.findById(input.parentId);
      if (!parent) {
        throw new CategoryError('Parent category not found', 'PARENT_NOT_FOUND', 404);
      }
      // Check for circular reference
      let currentParentId: string | undefined = parent.parentId?.toString();
      while (currentParentId) {
        if (currentParentId === id) {
          throw new CategoryError('Circular parent reference detected', 'CIRCULAR_REFERENCE', 400);
        }
        const parentCat = await Category.findById(currentParentId);
        if (!parentCat) break;
        currentParentId = parentCat.parentId?.toString();
      }
    }
  }

  // Update fields
  Object.assign(category, {
    ...input,
    parentId: input.parentId !== undefined
      ? (input.parentId ? new mongoose.Types.ObjectId(input.parentId) : null)
      : category.parentId,
  });

  await category.save();
  return toCategoryResponse(category);
}

/**
 * Delete category
 */
export async function deleteCategory(id: string): Promise<void> {
  const category = await Category.findById(id);
  if (!category) {
    throw new CategoryError('Category not found', 'NOT_FOUND', 404);
  }

  // Check if has children
  const childCount = await Category.countDocuments({ parentId: category._id });
  if (childCount > 0) {
    throw new CategoryError(
      'Cannot delete category with children. Move or delete children first.',
      'HAS_CHILDREN',
      400
    );
  }

  // Check if has content
  if (category.contentCount > 0) {
    throw new CategoryError(
      `Cannot delete category with ${category.contentCount} content items. Reassign content first.`,
      'HAS_CONTENT',
      400
    );
  }

  await category.deleteOne();
}

/**
 * Check if slug is available
 */
export async function checkSlugAvailability(
  slug: string,
  excludeId?: string
): Promise<{ available: boolean; suggestion?: string }> {
  const filter: { slug: string; _id?: { $ne: mongoose.Types.ObjectId } } = { slug };
  if (excludeId) {
    filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }

  const existing = await Category.findOne(filter);
  if (!existing) {
    return { available: true };
  }

  // Generate suggestion
  let counter = 1;
  let suggestion = `${slug}-${counter}`;
  while (await Category.findOne({ slug: suggestion })) {
    counter++;
    suggestion = `${slug}-${counter}`;
  }

  return { available: false, suggestion };
}

/**
 * Reorder categories
 */
export async function reorderCategories(
  orders: Array<{ id: string; sortOrder: number }>
): Promise<void> {
  const bulkOps = orders.map(({ id, sortOrder }) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id) },
      update: { $set: { sortOrder } },
    },
  }));

  await Category.bulkWrite(bulkOps);
}

/**
 * Get category path (breadcrumb)
 */
export async function getCategoryPath(id: string): Promise<CategoryResponse[]> {
  const pathResult: CategoryResponse[] = [];
  let currentId: string | null = id;

  while (currentId) {
    const cat: ICategory | null = await Category.findById(currentId);
    if (!cat) break;
    pathResult.unshift(toCategoryResponse(cat));
    currentId = cat.parentId?.toString() || null;
  }

  return pathResult;
}
