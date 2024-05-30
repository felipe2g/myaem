import { createHash } from 'crypto';

/**
 * Hashes a password with SHA1.
 * @param password The password to hash.
 * @returns The hashed password.
 * @deprecated SHA1 is insecure, use bcrypt instead.
 * @see hashPassword
 */
export function hashPasswordSHA1(password: string) {
	return createHash('sha1').update(password).digest('hex');
}
