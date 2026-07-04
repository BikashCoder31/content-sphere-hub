import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

// Handle both ESM and CJS imports
const jwtSign = (jwt as unknown as { default?: typeof jwt }).default?.sign ?? jwt.sign;
const jwtVerify = (jwt as unknown as { default?: typeof jwt }).default?.verify ?? jwt.verify;
const jwtDecode = (jwt as unknown as { default?: typeof jwt }).default?.decode ?? jwt.decode;

/**
 * Access token payload
 */
export interface AccessTokenPayload {
  userId: string;
  email: string;
  roleId: string;
  type: 'access';
}

/**
 * Refresh token payload
 */
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  type: 'refresh';
}

/**
 * Token pair returned after login/refresh
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

/**
 * Generate a random token ID for refresh tokens
 */
export function generateTokenId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a refresh token for storage
 */
export async function hashRefreshToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

/**
 * Compare a refresh token with its hash
 */
export async function compareRefreshToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

/**
 * Generate an access token
 */
export function generateAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  const tokenPayload: AccessTokenPayload = {
    ...payload,
    type: 'access',
  };

  const options: jwt.SignOptions = {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  };

  return jwtSign(tokenPayload, config.jwt.accessSecret, options);
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(userId: string, tokenId: string): string {
  const payload: RefreshTokenPayload = {
    userId,
    tokenId,
    type: 'refresh',
  };

  const options: jwt.SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  };

  return jwtSign(payload, config.jwt.refreshSecret, options);
}

/**
 * Generate a token pair (access + refresh)
 */
export async function generateTokenPair(
  userId: string,
  email: string,
  roleId: string
): Promise<{ tokens: TokenPair; refreshTokenHash: string }> {
  const tokenId = generateTokenId();

  const accessToken = generateAccessToken({ userId, email, roleId });
  const refreshToken = generateRefreshToken(userId, tokenId);
  const refreshTokenHash = await hashRefreshToken(refreshToken);

  // Calculate expiry dates
  const accessTokenExpiresAt = new Date(Date.now() + parseExpiry(config.jwt.accessExpiresIn));
  const refreshTokenExpiresAt = new Date(Date.now() + parseExpiry(config.jwt.refreshExpiresIn));

  return {
    tokens: {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    },
    refreshTokenHash,
  };
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwtVerify(token, config.jwt.accessSecret, {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  }) as jwt.JwtPayload & AccessTokenPayload;

  if (payload.type !== 'access') {
    throw new Error('Invalid token type');
  }

  return payload;
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwtVerify(token, config.jwt.refreshSecret, {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  }) as jwt.JwtPayload & RefreshTokenPayload;

  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  return payload;
}

/**
 * Decode a token without verification (for debugging)
 */
export function decodeToken(token: string): jwt.JwtPayload | null {
  return jwtDecode(token) as jwt.JwtPayload | null;
}

/**
 * Parse expiry string to milliseconds
 */
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiry format: ${expiry}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid expiry unit: ${unit}`);
  }
}
