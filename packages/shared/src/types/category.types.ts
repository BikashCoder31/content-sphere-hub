import type { BaseEntity } from './user.types.js';

/**
 * Category model interface
 */
export interface ICategory extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  imageId?: string;
  order: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  contentCount: number;
}

/**
 * Category with children for tree view
 */
export interface CategoryTree extends ICategory {
  children: CategoryTree[];
}

/**
 * Category create input
 */
export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  imageId?: string;
  order?: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

/**
 * Category update input
 */
export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  _id: string;
}
