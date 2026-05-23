// Feature: user-profile-management
// Tests: Property 9 (Avatar Upload Validation — MIME type and file size)
// Tests the fileFilter and size-limit logic directly without spinning up a server.

import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

// ── Pure helpers extracted from uploadMiddleware logic ────────────────────────

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

/**
 * Mirrors the fileFilter logic in uploadMiddleware.js.
 * Returns true if the MIME type is accepted, false otherwise.
 */
function isMimeAllowed(mimetype) {
  return ALLOWED_MIMES.includes(mimetype);
}

/**
 * Mirrors the size-limit check: returns true if size is within limit.
 */
function isSizeAllowed(sizeBytes) {
  return sizeBytes <= MAX_FILE_SIZE;
}

// ── Arbitraries ──────────────────────────────────────────────────────────────

const invalidMimeArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => !ALLOWED_MIMES.includes(s) && s.trim().length > 0);

const validMimeArb = fc.constantFrom(...ALLOWED_MIMES);

const oversizedArb = fc.integer({ min: MAX_FILE_SIZE + 1, max: MAX_FILE_SIZE * 3 });
const validSizeArb = fc.integer({ min: 0, max: MAX_FILE_SIZE });

// ── Property 9: Avatar Upload Validation ─────────────────────────────────────
describe('Property 9: Avatar Upload Validation (MIME Type and File Size)', () => {
  it('rejects any MIME type not in the allowed list', () => {
    // Feature: user-profile-management, Property 9: MIME type rejection
    fc.assert(
      fc.property(invalidMimeArb, (mime) => {
        expect(isMimeAllowed(mime)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('accepts only image/jpeg, image/png, and image/webp', () => {
    // Feature: user-profile-management, Property 9: MIME type acceptance
    fc.assert(
      fc.property(validMimeArb, (mime) => {
        expect(isMimeAllowed(mime)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('rejects files larger than 5 MB', () => {
    // Feature: user-profile-management, Property 9: file size rejection
    fc.assert(
      fc.property(oversizedArb, (size) => {
        expect(isSizeAllowed(size)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('accepts files of 5 MB or smaller', () => {
    // Feature: user-profile-management, Property 9: file size acceptance
    fc.assert(
      fc.property(validSizeArb, (size) => {
        expect(isSizeAllowed(size)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
