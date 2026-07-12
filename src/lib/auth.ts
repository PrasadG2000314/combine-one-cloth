import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { readAdminConfig, writeAdminConfig } from './db';

// Session duration: 2 hours
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

interface SessionData {
  username: string;
  expiresAt: number;
}

const SESSIONS_FILE = path.join(process.cwd(), 'src', 'data', 'sessions_db.json');

function readSessions(): Record<string, SessionData> {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      return {};
    }
    const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(data) || {};
  } catch (error) {
    return {};
  }
}

function writeSessions(data: Record<string, SessionData>): void {
  try {
    const dir = path.dirname(SESSIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write sessions file:', error);
  }
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
 */
export function createSession(username: string): string {
  const token = generateSessionToken();
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const sessions = readSessions();
  sessions[token] = { username, expiresAt };
  writeSessions(sessions);
  return token;
}

/**
 * Check if a session token is active and valid.
 */
export function validateSession(token: string | null | undefined): boolean {
  if (!token) return false;

  const sessions = readSessions();
  const session = sessions[token];
  if (!session) return false;

  // Check expiration
  if (Date.now() > session.expiresAt) {
    delete sessions[token];
    writeSessions(sessions);
    return false;
  }

  // Extend session duration on activity (sliding expiration)
  session.expiresAt = Date.now() + SESSION_DURATION_MS;
  sessions[token] = session;
  writeSessions(sessions);
  return true;
}

/**
 * Destroy a session.
 */
export function destroySession(token: string | null | undefined): void {
  if (token) {
    const sessions = readSessions();
    if (sessions[token]) {
      delete sessions[token];
      writeSessions(sessions);
    }
  }
}
