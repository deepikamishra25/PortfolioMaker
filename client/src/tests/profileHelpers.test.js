// Feature: user-profile-management
// Tests: Property 11 (Profile Image URL Construction) and Property 12 (Error Toast Message Completeness)
// Tests pure helper functions extracted from ProfileForm.jsx

import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

// ── Import pure helpers from ProfileForm ─────────────────────────────────────
// We import the named exports directly so tests validate the real implementation.
import { buildImageUrl, resolveErrorMessage } from '../pages/ProfileForm.jsx';

// ── Arbitraries ───────────────────────────────────────────────────────────────

// Arbitrary relative paths (e.g. '/uploads/avatars/file.jpg')
const relativePathArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => !s.includes('\x00'))
  .map((s) => `/${s}`);

// Arbitrary API base URLs (with /api suffix, as VITE_API_URL is typically set)
const apiUrlArb = fc.oneof(
  fc.constant('http://localhost:5000/api'),
  fc.constant('https://api.example.com/api'),
  fc.constant('http://127.0.0.1:3000/api'),
  fc.constant('')
);

// Arbitrary server error response shapes
const errorWithMessageArb = fc.record({
  response: fc.record({
    data: fc.record({
      message: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => !s.includes('\x00')),
    }),
  }),
});

const errorWithoutMessageArb = fc.oneof(
  fc.constant({}),
  fc.constant({ response: {} }),
  fc.constant({ response: { data: {} } }),
  fc.constant(null),
  fc.constant(undefined),
  fc.string({ minLength: 0, maxLength: 50 })
);

// ── Property 11: Profile Image URL Construction ───────────────────────────────
describe('Property 11: Profile Image URL Construction', () => {
  it('prepends the server base URL (without /api) to any relative path', () => {
    // Feature: user-profile-management, Property 11: Profile Image URL Construction
    fc.assert(
      fc.property(relativePathArb, apiUrlArb, (relativePath, apiUrl) => {
        const result = buildImageUrl(relativePath, apiUrl);

        // Result must be a non-empty string
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);

        // Result must end with the relative path
        expect(result.endsWith(relativePath)).toBe(true);

        // Result must NOT contain '/api' immediately before the relative path
        // (the base URL should have /api stripped)
        const base = (apiUrl || '').replace(/\/api\/?$/, '');
        expect(result).toBe(`${base}${relativePath}`);
      }),
      { numRuns: 100 }
    );
  });

  it('returns empty string for empty or falsy relativePath', () => {
    // Feature: user-profile-management, Property 11: empty path returns empty string
    fc.assert(
      fc.property(apiUrlArb, (apiUrl) => {
        expect(buildImageUrl('', apiUrl)).toBe('');
        expect(buildImageUrl(null, apiUrl)).toBe('');
        expect(buildImageUrl(undefined, apiUrl)).toBe('');
      }),
      { numRuns: 50 }
    );
  });
});

// ── Property 12: Error Toast Message Completeness ─────────────────────────────
describe('Property 12: Error Toast Message Completeness', () => {
  it('returns the server message when error.response.data.message is present', () => {
    // Feature: user-profile-management, Property 12: Error Toast Message Completeness (with message)
    fc.assert(
      fc.property(errorWithMessageArb, (err) => {
        const result = resolveErrorMessage(err);

        // Must be a non-empty string
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);

        // Must equal the server-provided message
        expect(result).toBe(err.response.data.message);
      }),
      { numRuns: 100 }
    );
  });

  it('returns the fallback string when error has no response message', () => {
    // Feature: user-profile-management, Property 12: Error Toast Message Completeness (fallback)
    fc.assert(
      fc.property(errorWithoutMessageArb, (err) => {
        const result = resolveErrorMessage(err);

        // Must be a non-empty string — never empty or undefined
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);

        // Must be the fallback message
        expect(result).toBe('Failed to update profile');
      }),
      { numRuns: 100 }
    );
  });
});
