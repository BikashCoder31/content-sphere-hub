// Re-export types
export * from './types/index.js';

// Re-export schemas with renamed types to avoid conflicts
export {
  // Auth schemas
  emailSchema,
  passwordSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verify2faSchema,
} from './schemas/auth.schema.js';

export type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  Verify2faInput,
} from './schemas/auth.schema.js';

export {
  // Content schemas
  slugSchema,
  jsonContentSchema,
  contentSeoSchema,
  contentSettingsSchema,
  contentSchedulingSchema,
  createContentSchema,
  updateContentSchema,
  contentListQuerySchema,
} from './schemas/content.schema.js';

export type {
  CreateContentInput as CreateContentSchemaInput,
  UpdateContentInput as UpdateContentSchemaInput,
  ContentListQuery,
} from './schemas/content.schema.js';

export {
  // Media schemas
  mediaUploadSchema,
  updateMediaSchema,
  mediaListQuerySchema,
  validateFileCategory,
  getMaxFileSizeForMime,
} from './schemas/media.schema.js';

export type {
  MediaUploadInput,
  UpdateMediaInput as UpdateMediaSchemaInput,
  MediaListQuery,
} from './schemas/media.schema.js';

export {
  // User schemas
  userPreferencesSchema,
  updateProfileSchema,
  createUserSchema,
  updateUserSchema,
  userListQuerySchema,
} from './schemas/user.schema.js';

export type {
  UpdateProfileInput,
  CreateUserInput,
  UpdateUserInput,
  UserListQuery,
} from './schemas/user.schema.js';

export {
  // Taxonomy schemas
  categorySeoSchema,
  createCategorySchema,
  updateCategorySchema,
  categoryListQuerySchema,
  createTagSchema,
  updateTagSchema,
  tagListQuerySchema,
} from './schemas/taxonomy.schema.js';

export type {
  CreateCategoryInput as CreateCategorySchemaInput,
  UpdateCategoryInput as UpdateCategorySchemaInput,
  CategoryListQuery,
  CreateTagInput as CreateTagSchemaInput,
  UpdateTagInput as UpdateTagSchemaInput,
  TagListQuery,
} from './schemas/taxonomy.schema.js';

export {
  // Common schemas
  paginationSchema,
  sortSchema,
  idParamSchema,
  searchQuerySchema,
  bulkIdsSchema,
  dateRangeSchema,
} from './schemas/common.schema.js';

export type {
  PaginationInput,
  SortInput,
  IdParam,
  SearchQuery,
  BulkIdsInput,
  DateRangeInput,
} from './schemas/common.schema.js';

// Re-export constants
export * from './constants/index.js';
