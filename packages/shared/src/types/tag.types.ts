import type { BaseEntity } from './user.types.js';

/**
 * Tag model interface
 */
export interface ITag extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  contentCount: number;
}

/**
 * Tag create input
 */
export interface CreateTagInput {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}

/**
 * Tag update input
 */
export interface UpdateTagInput extends Partial<CreateTagInput> {
  _id: string;
}
