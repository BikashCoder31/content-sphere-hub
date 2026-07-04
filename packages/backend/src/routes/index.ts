import { Router, IRouter } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { userRouter } from './user.routes.js';
import { roleRouter } from './role.routes.js';
import contentRouter from './content.routes.js';
import mediaRouter from './media.routes.js';
import categoryRouter from './category.routes.js';
import tagRouter from './tag.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { settingsRouter } from './settings.routes.js';

/**
 * API v1 router - aggregates all v1 routes
 */
export const apiV1Router: IRouter = Router();

// Health check (also available at /api/v1/health)
apiV1Router.use('/health', healthRouter);

// Authentication
apiV1Router.use('/auth', authRouter);

// Profile and Users (Sprint 5)
apiV1Router.use('/users', userRouter);
apiV1Router.use('/', userRouter); // Profile routes at /api/v1/profile

// Roles (Sprint 5)
apiV1Router.use('/roles', roleRouter);

// Content routes (Sprint 7)
apiV1Router.use('/content', contentRouter);

// Media routes (Sprint 9)
apiV1Router.use('/media', mediaRouter);

// Categories routes (Sprint 10)
apiV1Router.use('/categories', categoryRouter);

// Tags routes (Sprint 10)
apiV1Router.use('/tags', tagRouter);

// Dashboard routes (Sprint 11)
apiV1Router.use('/dashboard', dashboardRouter);

// Settings routes (Sprint 11)
apiV1Router.use('/settings', settingsRouter);

export default apiV1Router;
