// Feature: user-profile-management
// Tests: Property 1 (Registration Defaults) and Property 2 (Bio Length Validation)
// These tests use Mongoose schema validation directly — no live DB connection required.

import fc from 'fast-check';
import mongoose from 'mongoose';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// ── Inline schema (mirrors server/models/User.js) so tests are self-contained ──
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    displayName: { type: String, trim: true, default: '' },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    profileImage: { type: String, default: '' },
    socialLinks: {
      github:   { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter:  { type: String, default: '' },
      website:  { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Use a unique model name to avoid OverwriteModelError across test runs
const TestUser = mongoose.models.TestUser || mongoose.model('TestUser', userSchema);

// ── Arbitraries ──────────────────────────────────────────────────────────────
// Valid username: 3-20 alphanumeric chars (no spaces, satisfies unique + trim)
const usernameArb = fc
  .stringMatching(/^[a-zA-Z0-9]{3,20}$/)
  .filter((s) => s.length >= 3);

// Valid email
const emailArb = fc.emailAddress();

// Valid password (≥ 6 chars, no null bytes)
const passwordArb = fc
  .string({ minLength: 6, maxLength: 30 })
  .filter((s) => !s.includes('\x00'));

// ── Property 1: Registration Defaults Profile Fields ─────────────────────────
describe('Property 1: Registration Defaults Profile Fields', () => {
  it('newly created user document has empty-string defaults for all profile fields', () => {
    // Feature: user-profile-management, Property 1: Registration Defaults Profile Fields
    fc.assert(
      fc.property(usernameArb, emailArb, passwordArb, (username, email, password) => {
        // Build a doc without providing any profile fields
        const doc = new TestUser({ username, email, password });

        expect(doc.displayName).toBe('');
        expect(doc.bio).toBe('');
        expect(doc.profileImage).toBe('');
        expect(doc.socialLinks.github).toBe('');
        expect(doc.socialLinks.linkedin).toBe('');
        expect(doc.socialLinks.twitter).toBe('');
        expect(doc.socialLinks.website).toBe('');
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 2: Bio Length Validation ────────────────────────────────────────
describe('Property 2: Bio Length Validation', () => {
  it('bio with length ≤ 500 passes schema validation', async () => {
    // Feature: user-profile-management, Property 2: Bio Length Validation (valid)
    await fc.assert(
      fc.asyncProperty(
        usernameArb,
        emailArb,
        passwordArb,
        fc.string({ minLength: 0, maxLength: 500 }).filter((s) => !s.includes('\x00')),
        async (username, email, password, bio) => {
          const doc = new TestUser({ username, email, password, bio });
          // validateSync only checks schema rules, not DB constraints (unique etc.)
          const err = doc.validateSync(['bio']);
          expect(err).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('bio with length > 500 fails schema validation', async () => {
    // Feature: user-profile-management, Property 2: Bio Length Validation (invalid)
    await fc.assert(
      fc.asyncProperty(
        usernameArb,
        emailArb,
        passwordArb,
        fc.string({ minLength: 501, maxLength: 1000 }).filter((s) => !s.includes('\x00')),
        async (username, email, password, bio) => {
          const doc = new TestUser({ username, email, password, bio });
          const err = doc.validateSync(['bio']);
          expect(err).toBeDefined();
          expect(err.errors.bio).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
