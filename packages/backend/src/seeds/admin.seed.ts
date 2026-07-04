import * as bcrypt from 'bcryptjs';
import { ROLES } from '@content-sphere-hub/shared';
import { User } from '../models/user.model.js';
import { Role } from '../models/role.model.js';
import { config } from '../config/env.js';
import logger from '../config/logger.js';

/**
 * Default admin configuration
 */
interface AdminConfig {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

function getAdminConfig(): AdminConfig {
  return {
    email: process.env.ADMIN_EMAIL || 'admin@content-sphere-hub.local',
    password: process.env.ADMIN_PASSWORD || 'Admin123!@#',
    firstName: process.env.ADMIN_FIRST_NAME || 'Super',
    lastName: process.env.ADMIN_LAST_NAME || 'Admin',
  };
}

/**
 * Seed default admin user
 */
export async function seedAdmin(): Promise<void> {
  logger.info('Seeding default admin user...');

  const adminConfig = getAdminConfig();

  // Check if admin already exists
  const existingAdmin = await User.findOne({ email: adminConfig.email });
  if (existingAdmin) {
    logger.info(`Admin user already exists: ${adminConfig.email}`);
    return;
  }

  // Get super admin role
  const superAdminRole = await Role.findOne({ slug: ROLES.SUPER_ADMIN });
  if (!superAdminRole) {
    throw new Error('Super Admin role not found. Please run role seeder first.');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(adminConfig.password, config.security.bcryptRounds);

  // Create admin user
  const admin = await User.create({
    email: adminConfig.email,
    passwordHash,
    firstName: adminConfig.firstName,
    lastName: adminConfig.lastName,
    displayName: `${adminConfig.firstName} ${adminConfig.lastName}`,
    roleId: superAdminRole._id,
    status: 'active',
    emailVerified: true,
    emailVerifiedAt: new Date(),
  });

  logger.info(`Created admin user: ${admin.email}`);

  // Log credentials in development only
  if (config.isDev) {
    logger.warn('='.repeat(50));
    logger.warn('DEFAULT ADMIN CREDENTIALS (CHANGE IN PRODUCTION!)');
    logger.warn(`Email: ${adminConfig.email}`);
    logger.warn(`Password: ${adminConfig.password}`);
    logger.warn('='.repeat(50));
  }
}

export default seedAdmin;
