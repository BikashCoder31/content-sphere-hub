import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError, ErrorCodes } from '../utils/response.js';

/**
 * Validation target - where to look for data to validate
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Format Zod errors into a readable structure
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}

/**
 * Middleware factory to validate request data against a Zod schema
 *
 * @example
 * // Validate request body
 * router.post('/users', validate(createUserSchema), createUser);
 *
 * // Validate query params
 * router.get('/users', validate(listQuerySchema, 'query'), listUsers);
 *
 * // Validate route params
 * router.get('/users/:id', validate(idParamSchema, 'params'), getUser);
 */
export function validate<T>(schema: ZodSchema<T>, target: ValidationTarget = 'body') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[target];
      const validated = await schema.parseAsync(data);

      // Replace the request data with validated/transformed data
      req[target] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(
          res,
          ErrorCodes.VALIDATION_ERROR,
          'Validation failed',
          400,
          formatZodErrors(error)
        );
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate multiple targets at once
 *
 * @example
 * router.put('/users/:id',
 *   validateMultiple({
 *     params: idParamSchema,
 *     body: updateUserSchema
 *   }),
 *   updateUser
 * );
 */
export function validateMultiple(schemas: Partial<Record<ValidationTarget, ZodSchema>>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: Record<string, Record<string, string[]>> = {};

    for (const [target, schema] of Object.entries(schemas) as [ValidationTarget, ZodSchema][]) {
      try {
        const data = req[target];
        const validated = await schema.parseAsync(data);
        req[target] = validated;
      } catch (error) {
        if (error instanceof ZodError) {
          errors[target] = formatZodErrors(error);
        } else {
          next(error);
          return;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      sendError(res, ErrorCodes.VALIDATION_ERROR, 'Validation failed', 400, errors);
      return;
    }

    next();
  };
}

/**
 * Type helper to extract the validated type from a schema
 */
export type ValidatedRequest<TBody = unknown, TQuery = unknown, TParams = unknown> = Request<
  TParams,
  unknown,
  TBody,
  TQuery
>;
