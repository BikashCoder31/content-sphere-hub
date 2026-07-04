import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { config } from '../config/index.js';

export const healthRouter: Router = Router();

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected' | 'connecting';
    redis: 'connected' | 'disconnected' | 'unknown';
  };
}

/**
 * Basic health check
 */
healthRouter.get('/', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  const health: HealthStatus = {
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: config.apiVersion,
    uptime: process.uptime(),
    services: {
      database: dbStatus,
      redis: 'unknown', // Will be updated when Redis is connected
    },
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Liveness probe (is the server running?)
 */
healthRouter.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

/**
 * Readiness probe (can the server handle requests?)
 */
healthRouter.get('/ready', (_req: Request, res: Response) => {
  const dbReady = mongoose.connection.readyState === 1;

  if (dbReady) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready', reason: 'database not connected' });
  }
});

export default healthRouter;
