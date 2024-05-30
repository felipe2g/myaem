import { compareSync } from 'bcrypt';
import { hashPasswordSHA1 } from './hashPasswordSHA1';

/**
 * Compares a password with a hash.
 * @param password The password to compare.
 * @param hash The hash to compare.
 * @returns Whether the password matches the hash.
 */
export function comparePassword(password: string, hash: string) {
	if (
		(process.env.DEPRECATED_USE_SHA1_PASSWORDS === 'true' ||
    process.env.ALLOW_LEGACY_SHA1_PASSWORDS === 'true') &&
		hash === hashPasswordSHA1(password)
	) {
		return true;
	}
	return compareSync(password, hash);
}
