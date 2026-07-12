import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { readAdminConfig, writeAdminConfig } from './db';

// Session duration: 2 hours
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

// Secret key for HMAC signing (should be set via env var, fallback to a local static secret for dev)
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'draven_fallback_secret_key_2026_!';

interface SessionPayload {
  username: string;
  expiresAt: number;
}

/**
 * Hash a password using Node's native scrypt key derivation.
 */
export function hashPassword(password: string, salt: string): string {
  // scrypt key length 64 bytes, return as hex string
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

/**
 * Generate a cryptographically secure random salt.
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate a cryptographically secure random session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Initialize a default admin account if it does not already exist.
 * Outputs the generated credentials to the workspace root for the user.
 */
export function initializeAdminIfMissing(): { username: string; password?: string } {
  const existing = readAdminConfig();
  if (existing) {
    return { username: existing.username };
  }

  // Generate secure random password
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(crypto.randomInt(chars.length));
  }

  const salt = generateSalt();
  const hash = hashPassword(password, salt);

  writeAdminConfig({
    username: 'admin',
    passwordHash: hash,
    salt: salt,
  });

  // Save plaintext credentials to a temporary file in the workspace root for the user
  const credentialsPath = path.join(process.cwd(), 'admin-credentials.txt');
  const content = `======================================================
DRAVEN STOREFRONT ADMIN PANEL CREDENTIALS
======================================================
Username: admin
Password: ${password}
Created At: ${new Date().toLocaleString()}

IMPORTANT SECURITY ADVICE:
1. Use these credentials to log in at http://localhost:3000/admin.
2. For absolute security, please delete this credentials file
   after recording the details or changing the password.
======================================================
`;
  try {
    fs.writeFileSync(credentialsPath, content, 'utf-8');
    console.log('Generated admin credentials saved to:', credentialsPath);
  } catch (error) {
    console.error('Failed to write credentials file:', error);
  }

  return { username: 'admin', password };
}

/**
 * Verify a login attempt.
 */
export function verifyAdminLogin(password: string): boolean {
  // Ensure admin config is initialized
  initializeAdminIfMissing();

  const config = readAdminConfig();
  if (!config) return false;

  const hash = hashPassword(password, config.salt);
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(config.passwordHash, 'hex')
  );
}

/**
 * Create a new admin session.
 * Generates a signed, stateless JWT-like token.
 */
export function createSession(username: string): string {
  const payload: SessionPayload = {
    username,
    expiresAt: Date.now() + SESSION_DURATION_MS
  };
  
  const serialized = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  // Sign the serialized payload using HMAC-SHA256
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(serialized)
    .digest('base64url');
    
  return `${serialized}.${signature}`;
}

/**
 * Check if a session token is active and valid.
 * Verifies the cryptographic signature and checks expiration.
 */
export function validateSession(token: string | null | undefined): boolean {
  if (!token) return false;
  
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  
  const [serialized, signature] = parts;
  
  // Re-generate signature to verify integrity
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(serialized)
    .digest('base64url');
    
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  
  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }
  
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return false; // Signature mismatch (tampered!)
  }
  
  try {
    const payload = JSON.parse(Buffer.from(serialized, 'base64url').toString('utf8')) as SessionPayload;
    
    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return false; // Expired
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Destroy a session.
 * In a stateless cookie model, the cookie is deleted on the client side.
 */
export function destroySession(token: string | null | undefined): void {
  // No-op on the server since tokens are stateless.
}
