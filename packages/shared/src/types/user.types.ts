import type { Theme } from '../constants/index.js';

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User preferences
 */
export interface UserPreferences {
  language: string;
  timezone: string;
  theme: Theme;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

/**
 * Two-factor authentication settings
 */
export interface TwoFactorSettings {
  enabled: boolean;
  secret?: string;
  backupCodesHash?: string[];
}

/**
 * Social login provider data
 */
export interface SocialLogin {
  id: string;
  email?: string;
  username?: string;
}

/**
 * User social logins
 */
export interface SocialLogins {
  google?: SocialLogin;
  github?: SocialLogin;
  facebook?: SocialLogin;
}

/**
 * User session
 */
export interface UserSession {
  sessionId: string;
  refreshTokenHash: string;
  device: string;
  ip: string;
  userAgent: string;
  lastActive: Date;
  expiresAt: Date;
  revokedAt?: Date;
}

/**
 * Login history entry
 */
export interface LoginHistoryEntry {
  ip: string;
  device: string;
  userAgent: string;
  location?: string;
  timestamp: Date;
  success: boolean;
  failureReason?: string;
}

/**
 * User model interface
 */
export interface IUser extends BaseEntity {
  email: string;
  passwordHash: string;
  name: string;
  avatar?: string;
  bio?: string;

  roleId: string;
  permissionOverrides: string[];

  preferences: UserPreferences;
  twoFactor: TwoFactorSettings;
  socialLogins: SocialLogins;
  sessions: UserSession[];
  loginHistory: LoginHistoryEntry[];

  isActive: boolean;
  isVerified: boolean;
  verificationTokenHash?: string;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  lockedUntil?: Date;
  failedLoginAttempts: number;
}

/**
 * Safe user data (without sensitive fields)
 */
export interface SafeUser {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  roleId: string;
  preferences: UserPreferences;
  twoFactor: { enabled: boolean };
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User for JWT payload
 */
export interface JwtUser {
  _id: string;
  email: string;
  roleId: string;
  permissions: string[];
}
