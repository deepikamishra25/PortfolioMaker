// Feature: user-profile-management
// Tests: Property 3 (Profile Response Shape), Property 4 (Update Reflects Values),
//        Property 6 (Duplicate Conflict), Property 7 (Partial Update Preserves Fields)
// These tests use pure logic / mock stubs — no live DB connection required.

import fc from 'fast-check';
import { describe, it, expect, vi } from 'vitest';

// ── Pure helper: build a mock user document ───────────────────────────────────

function makeUser(overrides = {}) {
  return {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    bio: 'A short bio.',
    profileImage: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      website: '',
    },
    ...overrides,
  };
}

// ── Simulate getUserProfile response shape ────────────────────────────────────

/**
 * Simulates what getUserProfile returns: the user doc without password.
 * Returns null if user not found.
 */
function simulateGetUserProfile(userDoc) {
  if (!userDoc) return null;
  // eslint-disable-next-line no-unused-vars
  const { password, ...rest } = userDoc;
  return rest;
}

// ── Simulate updateUserProfile logic ─────────────────────────────────────────

/**
 * Simulates the partial-update logic in updateUserProfile.
 * Returns { status, body } where status is 200 or 409.
 */
function simulateUpdateUserProfile(currentUser, body, otherUsers = []) {
  const { displayName, username, email, bio, socialLinks } = body;

  // Conflict checks
  if (username !== undefined) {
    const conflict = otherUsers.find(
      (u) => u.username === username && u._id !== currentUser._id
    );
    if (conflict) return { status: 409, body: { message: 'Username already taken' } };
  }
  if (email !== undefined) {
    const conflict = otherUsers.find(
      (u) => u.email === email.toLowerCase() && u._id !== currentUser._id
    );
    if (conflict) return { status: 409, body: { message: 'Email already in use' } };
  }

  // Build update fields (partial update)
  const updateFields = { ...currentUser };
  if (displayName !== undefined) updateFields.displayName = displayName;
  if (bio !== undefined) updateFields.bio = bio;
  if (username !== undefined) updateFields.username = username;
  if (email !== undefined) updateFields.email = email.toLowerCase();

  if (socialLinks !== undefined && typeof socialLinks === 'object') {
    const fields = ['github', 'linkedin', 'twitter', 'website'];
    for (const field of fields) {
      if (socialLinks[field] !== undefined) {
        updateFields.socialLinks = {
          ...updateFields.socialLinks,
          [field]: socialLinks[field],
        };
      }
    }
  }

  // Remove password from response
  // eslint-disable-next-line no-unused-vars
  const { password, ...responseDoc } = updateFields;
  return { status: 200, body: responseDoc };
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

const usernameArb = fc
  .stringMatching(/^[a-zA-Z0-9]{3,20}$/)
  .filter((s) => s.length >= 3);

const emailArb = fc.emailAddress();

const displayNameArb = fc
  .string({ minLength: 0, maxLength: 50 })
  .filter((s) => !s.includes('\x00'));

const bioArb = fc
  .string({ minLength: 0, maxLength: 500 })
  .filter((s) => !s.includes('\x00'));

const socialLinkArb = fc.oneof(
  fc.constant(''),
  fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => !s.includes('\x00'))
    .map((s) => `https://${s}`)
);

const profileFieldNames = ['displayName', 'bio', 'username', 'email'];

// ── Property 3: Profile Response Shape and Password Exclusion ─────────────────
describe('Property 3: Profile Response Shape and Password Exclusion', () => {
  it('response contains all required profile fields and excludes password', () => {
    // Feature: user-profile-management, Property 3: Profile Response Shape and Password Exclusion
    fc.assert(
      fc.property(
        usernameArb,
        emailArb,
        displayNameArb,
        bioArb,
        (username, email, displayName, bio) => {
          const userDoc = makeUser({
            username,
            email,
            displayName,
            bio,
            password: 'hashed_secret_password',
          });

          const response = simulateGetUserProfile(userDoc);

          // Must not be null
          expect(response).not.toBeNull();

          // Must contain all required fields
          expect(response).toHaveProperty('_id');
          expect(response).toHaveProperty('username');
          expect(response).toHaveProperty('email');
          expect(response).toHaveProperty('displayName');
          expect(response).toHaveProperty('bio');
          expect(response).toHaveProperty('profileImage');
          expect(response).toHaveProperty('socialLinks');

          // Must NOT contain password
          expect(response).not.toHaveProperty('password');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns null when user is not found', () => {
    // Feature: user-profile-management, Property 3: null user returns null
    const response = simulateGetUserProfile(null);
    expect(response).toBeNull();
  });
});

// ── Property 4: Profile Update Reflects Submitted Values ─────────────────────
describe('Property 4: Profile Update Reflects Submitted Values', () => {
  it('response body contains values matching the submitted fields', () => {
    // Feature: user-profile-management, Property 4: Profile Update Reflects Submitted Values
    fc.assert(
      fc.property(
        displayNameArb,
        bioArb,
        socialLinkArb,
        socialLinkArb,
        (displayName, bio, github, linkedin) => {
          const currentUser = makeUser({ _id: 'user123' });
          const body = {
            displayName,
            bio,
            socialLinks: { github, linkedin },
          };

          const result = simulateUpdateUserProfile(currentUser, body);

          expect(result.status).toBe(200);
          expect(result.body.displayName).toBe(displayName);
          expect(result.body.bio).toBe(bio);
          expect(result.body.socialLinks.github).toBe(github);
          expect(result.body.socialLinks.linkedin).toBe(linkedin);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 6: Duplicate Username or Email Conflict ─────────────────────────
describe('Property 6: Duplicate Username or Email Conflict', () => {
  it('returns 409 when username already belongs to a different user', () => {
    // Feature: user-profile-management, Property 6: Duplicate Username Conflict
    fc.assert(
      fc.property(usernameArb, (username) => {
        const currentUser = makeUser({ _id: 'user_A', username: 'user_a_original' });
        const otherUser = makeUser({ _id: 'user_B', username });

        const result = simulateUpdateUserProfile(
          currentUser,
          { username },
          [otherUser]
        );

        expect(result.status).toBe(409);
        expect(result.body.message).toBe('Username already taken');
      }),
      { numRuns: 100 }
    );
  });

  it('returns 409 when email already belongs to a different user', () => {
    // Feature: user-profile-management, Property 6: Duplicate Email Conflict
    fc.assert(
      fc.property(emailArb, (email) => {
        const currentUser = makeUser({ _id: 'user_A', email: 'original@example.com' });
        const otherUser = makeUser({ _id: 'user_B', email: email.toLowerCase() });

        const result = simulateUpdateUserProfile(
          currentUser,
          { email },
          [otherUser]
        );

        expect(result.status).toBe(409);
        expect(result.body.message).toBe('Email already in use');
      }),
      { numRuns: 100 }
    );
  });

  it('allows update when username/email belongs to the same user', () => {
    // Feature: user-profile-management, Property 6: Same user no conflict
    fc.assert(
      fc.property(usernameArb, emailArb, (username, email) => {
        const currentUser = makeUser({ _id: 'user_A', username, email });

        // No other users — should succeed
        const result = simulateUpdateUserProfile(currentUser, { username, email }, []);

        expect(result.status).toBe(200);
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 7: Partial Update Preserves Omitted Fields ──────────────────────
describe('Property 7: Partial Update Preserves Omitted Fields', () => {
  it('omitted fields retain their previous values in the response', () => {
    // Feature: user-profile-management, Property 7: Partial Update Preserves Omitted Fields
    fc.assert(
      fc.property(
        fc.subarray(profileFieldNames, { minLength: 1, maxLength: profileFieldNames.length }),
        displayNameArb,
        bioArb,
        usernameArb,
        emailArb,
        (includedFields, displayName, bio, username, email) => {
          const originalUser = makeUser({
            _id: 'user_X',
            displayName: 'Original Name',
            bio: 'Original bio',
            username: 'originaluser',
            email: 'original@example.com',
          });

          // Build a body with only the included fields
          const allValues = { displayName, bio, username, email };
          const body = {};
          for (const field of includedFields) {
            body[field] = allValues[field];
          }

          const result = simulateUpdateUserProfile(originalUser, body);

          // For fields NOT in the body, the original value should be preserved
          for (const field of profileFieldNames) {
            if (!includedFields.includes(field)) {
              if (field === 'email') {
                expect(result.body[field]).toBe(originalUser[field]);
              } else {
                expect(result.body[field]).toBe(originalUser[field]);
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
