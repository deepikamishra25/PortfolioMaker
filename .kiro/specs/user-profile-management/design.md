# Design Document: User Profile Management

## Overview

This feature adds a fully functional profile management section to the PortfolioMaker dashboard. Authenticated users can view and edit their personal details, write a bio, upload a profile avatar, and manage social media links. The implementation extends the existing User Mongoose model, adds three new REST endpoints under `/api/users`, and renders a `ProfileForm` component inside the Dashboard's existing "Profile" menu slot.

The design follows the established patterns of the codebase: ES Modules on the server, React + Tailwind CSS v4 on the client, JWT auth via the existing `protect` middleware, and the shared `api` Axios instance for all HTTP calls.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React/Vite)                       │
│                                                                   │
│  Dashboard.jsx                                                    │
│    └── activeMenu === 'profile'                                   │
│          └── <ProfileForm />                                      │
│                ├── profileService.js  ──► api.js (Axios)         │
│                ├── React Hook Form                                │
│                ├── AuthContext (read user, call setUser)          │
│                └── react-hot-toast (Toast_Service)               │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / JWT Bearer
┌──────────────────────────────▼──────────────────────────────────┐
│                        SERVER (Express)                           │
│                                                                   │
│  server/index.js                                                  │
│    ├── /api/users  ──► userRoutes.js                             │
│    │     ├── GET  /profile   → protect → getUserProfile          │
│    │     ├── PUT  /profile   → protect → validateProfile         │
│    │     │                            → updateUserProfile        │
│    │     └── POST /profile/avatar → protect → upload (multer)   │
│    │                                         → uploadAvatar      │
│    └── /uploads  ──► express.static(server/uploads/)            │
│                                                                   │
│  controllers/userController.js                                    │
│  middleware/uploadMiddleware.js  (multer config)                  │
│  middleware/validateProfile.js   (input validation)              │
│  models/User.js  (extended with profile fields)                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                        MongoDB (Mongoose)                         │
│  users collection — User model with profile fields               │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: Profile Load

```
ProfileForm mounts
  │
  ├─► profileService.getProfile()
  │     └─► GET /api/users/profile  (Bearer token)
  │           └─► protect middleware validates JWT
  │                 └─► getUserProfile controller
  │                       └─► User.findById().select('-password')
  │                             └─► returns profile JSON
  │
  └─► React Hook Form reset(data) pre-populates all fields
        └─► setLoading(false) → form renders
```

### Data Flow: Profile Update

```
User submits ProfileForm
  │
  ├─► React Hook Form validates client-side
  │     └─► on error: inline messages shown, request not sent
  │
  ├─► profileService.updateProfile(data)
  │     └─► PUT /api/users/profile  (Bearer token + JSON body)
  │           ├─► protect middleware
  │           ├─► validateProfile middleware (server-side validation)
  │           └─► updateUserProfile controller
  │                 ├─► conflict check (username/email uniqueness)
  │                 ├─► User.findByIdAndUpdate()
  │                 └─► returns updated profile JSON
  │
  ├─► AuthContext.setUser(updatedUser)  — syncs header/sidebar
  └─► toast.success("Profile updated successfully")
```

### Data Flow: Avatar Upload

```
User selects file → FileReader preview shown immediately
  │
User clicks "Upload"
  │
  ├─► profileService.uploadAvatar(file)
  │     └─► POST /api/users/profile/avatar  (multipart/form-data)
  │           ├─► protect middleware
  │           ├─► multer middleware (MIME + size validation)
  │           └─► uploadAvatar controller
  │                 ├─► saves file to server/uploads/avatars/<uuid>.<ext>
  │                 ├─► User.findByIdAndUpdate({ profileImage: relativePath })
  │                 └─► returns { profileImage: '/uploads/avatars/...' }
  │
  ├─► preview updated with new path
  ├─► AuthContext.setUser({ ...user, profileImage: newPath })
  └─► toast.success("Profile image updated")
```

---

## Components and Interfaces

### New Server Files

| File | Purpose |
|------|---------|
| `server/routes/userRoutes.js` | Express router for `/api/users` endpoints |
| `server/controllers/userController.js` | Handler functions for profile CRUD and avatar upload |
| `server/middleware/uploadMiddleware.js` | Multer configuration (disk storage, MIME filter, 5 MB limit) |
| `server/middleware/validateProfile.js` | Express middleware for server-side field validation |

### New Client Files

| File | Purpose |
|------|---------|
| `client/src/pages/ProfileForm.jsx` | Main profile editing component rendered in Dashboard |
| `client/src/services/profileService.js` | Named API call functions using the shared `api` Axios instance |

### Modified Files

| File | Change |
|------|--------|
| `server/models/User.js` | Add `displayName`, `bio`, `profileImage`, `socialLinks` fields |
| `server/index.js` | Mount `userRoutes` at `/api/users`; register `express.static` for `/uploads` |
| `client/src/pages/Dashboard.jsx` | Render `<ProfileForm />` when `activeMenu === 'profile'` |
| `client/src/context/AuthContext.jsx` | Expose `setUser` in context value |

### profileService.js Interface

```js
// client/src/services/profileService.js
import api from './api.js';

export const getProfile = () =>
  api.get('/users/profile');

export const updateProfile = (data) =>
  api.put('/users/profile', data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post('/users/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
```

### userController.js Interface

```js
// server/controllers/userController.js
export const getUserProfile(req, res, next)   // GET /api/users/profile
export const updateUserProfile(req, res, next) // PUT /api/users/profile
export const uploadAvatar(req, res, next)      // POST /api/users/profile/avatar
```

### API Endpoint Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/profile` | JWT | Fetch authenticated user's profile |
| PUT | `/api/users/profile` | JWT | Update profile fields (partial update supported) |
| POST | `/api/users/profile/avatar` | JWT | Upload avatar image |

**GET /api/users/profile — Response (200)**
```json
{
  "_id": "...",
  "username": "johndoe",
  "email": "john@example.com",
  "displayName": "John Doe",
  "bio": "Full-stack developer...",
  "profileImage": "/uploads/avatars/uuid.jpg",
  "socialLinks": {
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "website": "https://johndoe.dev"
  }
}
```

**PUT /api/users/profile — Request Body (all fields optional)**
```json
{
  "displayName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "bio": "Full-stack developer...",
  "socialLinks": {
    "github": "https://github.com/johndoe",
    "linkedin": "",
    "twitter": "",
    "website": "https://johndoe.dev"
  }
}
```

**POST /api/users/profile/avatar — Response (200)**
```json
{
  "profileImage": "/uploads/avatars/a1b2c3d4-uuid.jpg"
}
```

---

## Data Models

### Extended User Schema

```js
// server/models/User.js — additions to existing schema
{
  // Existing fields: username, email, password (unchanged)

  displayName: {
    type: String,
    trim: true,
    default: '',
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
    // Stores relative path only: '/uploads/avatars/filename.jpg'
  },
  socialLinks: {
    github:   { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter:  { type: String, default: '' },
    website:  { type: String, default: '' },
  },
}
```

All new fields are optional with empty string/object defaults, so existing registration logic and existing user documents are unaffected.

### File Storage Layout

```
server/
  uploads/
    avatars/
      <uuid>-<timestamp>.<ext>   ← stored by multer
```

Files are served at `/uploads/avatars/<filename>` via `express.static`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Registration Defaults Profile Fields

*For any* valid user registration payload, the created user document SHALL have `displayName`, `bio`, and `profileImage` equal to empty strings, and `socialLinks` equal to an object with all sub-fields as empty strings.

**Validates: Requirements 1.2**

---

### Property 2: Bio Length Validation

*For any* bio string, a save or update operation SHALL succeed if and only if the bio's length is ≤ 500 characters; any bio with length > 500 SHALL be rejected with an error.

**Validates: Requirements 1.3, 3.4**

---

### Property 3: Profile Response Shape and Password Exclusion

*For any* authenticated user, the response from `GET /api/users/profile` SHALL contain all of `_id`, `username`, `email`, `displayName`, `bio`, `profileImage`, and `socialLinks`, and SHALL NOT contain a `password` field.

**Validates: Requirements 2.1, 2.4**

---

### Property 4: Profile Update Reflects Submitted Values

*For any* valid profile update payload sent to `PUT /api/users/profile`, the response body SHALL contain values that match the submitted fields, and the updated document in the database SHALL reflect those values.

**Validates: Requirements 3.1**

---

### Property 5: Invalid Email Format Rejected

*For any* string that does not conform to a valid email address format, a `PUT /api/users/profile` request with that string as the `email` field SHALL be rejected with HTTP 400.

**Validates: Requirements 3.3**

---

### Property 6: Duplicate Username or Email Conflict

*For any* `username` or `email` value that already belongs to a different user in the database, a `PUT /api/users/profile` request submitting that value SHALL be rejected with HTTP 409.

**Validates: Requirements 3.5**

---

### Property 7: Partial Update Preserves Omitted Fields

*For any* profile update payload that omits one or more fields, the omitted fields SHALL retain their previous values in the database and in the response — no field SHALL be cleared unless explicitly included in the request body.

**Validates: Requirements 3.6**

---

### Property 8: Social Link URL Validation

*For any* value submitted in a `socialLinks` sub-field, the request SHALL be accepted if and only if the value is an empty string or begins with `https://`; any other non-empty value SHALL be rejected with HTTP 400.

**Validates: Requirements 3.7**

---

### Property 9: Avatar Upload Validation (MIME Type and File Size)

*For any* file submitted to `POST /api/users/profile/avatar`, the upload SHALL be accepted if and only if the file's MIME type is one of `image/jpeg`, `image/png`, or `image/webp` AND the file size is ≤ 5 MB; any file failing either condition SHALL be rejected with HTTP 400.

**Validates: Requirements 4.2, 4.3**

---

### Property 10: Avatar Upload Round-Trip

*For any* successfully uploaded avatar file, a subsequent `GET /api/users/profile` request SHALL return a `profileImage` value that matches the relative path returned by the upload response.

**Validates: Requirements 4.4**

---

### Property 11: Profile Image URL Construction

*For any* relative `profileImage` path stored on a user (e.g., `/uploads/avatars/file.jpg`), the `ProfileForm` component SHALL construct the full display URL by prepending the server base URL, such that the resulting URL is a valid, accessible image URL.

**Validates: Requirements 6.3**

---

### Property 12: Error Toast Message Completeness

*For any* failed profile update response from the server, the displayed error toast SHALL contain either the `message` field from the server's error response body or the fallback string "Failed to update profile" — the toast SHALL never be empty or undefined.

**Validates: Requirements 7.2**

---

## Error Handling

### Server-Side

All controller functions follow the existing pattern of setting `res.status()` then calling `next(error)`, which is caught by the global `errorHandler` middleware in `errorMiddleware.js`.

| Scenario | HTTP Status | Message |
|----------|-------------|---------|
| Missing/invalid JWT | 401 | "Not authorized, token failed" (from `protect`) |
| User not found in DB | 404 | "User not found" |
| Empty username | 400 | "Username is required" |
| Invalid email format | 400 | "Please provide a valid email address" |
| Bio exceeds 500 chars | 400 | "Bio cannot exceed 500 characters" |
| Invalid social link URL | 400 | "Social links must start with https:// or be empty" |
| Username/email conflict | 409 | "Username already taken" / "Email already in use" |
| No file in avatar upload | 400 | "No image file provided" |
| Invalid MIME type | 400 | "Only JPEG, PNG, and WebP images are allowed" |
| File too large | 400 | "Image must be smaller than 5 MB" |
| Unexpected server error | 500 | Error message (stack in dev only) |

### Multer Error Handling

Multer throws specific error types (`MulterError`) that must be caught separately from general errors. The `uploadMiddleware.js` wraps multer in a custom middleware that intercepts `MulterError` instances and maps them to appropriate HTTP 400 responses before calling `next`.

```js
// Pattern for wrapping multer errors
export const handleUpload = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image must be smaller than 5 MB' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};
```

### Client-Side

- React Hook Form handles client-side validation before any network request is made.
- `profileService.js` functions return the raw Axios promise; the `ProfileForm` component catches errors in `try/catch` blocks.
- The existing `api.js` response interceptor handles 401 responses globally (redirect to `/login?expired=true`).
- All other errors surface their `error.response?.data?.message` to `react-hot-toast`.

---

## Testing Strategy

### Unit Tests

Focus on specific examples, edge cases, and pure logic:

- **User model**: Verify schema defaults, bio maxlength enforcement, and that password is not returned by default select.
- **validateProfile middleware**: Test each validation rule with valid and invalid inputs (empty username, malformed email, bio at 500 chars, bio at 501 chars, valid/invalid social link URLs).
- **userController**: Test `getUserProfile` returns correct shape; test `updateUserProfile` partial update logic; test conflict detection.
- **uploadMiddleware**: Test MIME type filter rejects non-image types; test size limit.
- **profileService.js**: Verify each exported function calls the correct endpoint with the correct method and payload.
- **ProfileForm**: Test loading state, field pre-population, inline validation errors, submit button disabled state, toast messages, and AuthContext sync.

### Property-Based Tests

Use a property-based testing library (recommended: **fast-check** for both Node.js server tests and Vitest-based client tests) with a minimum of **100 iterations per property**.

Each test must be tagged with a comment in the format:
`// Feature: user-profile-management, Property N: <property_text>`

**Properties to implement as PBT:**

| Property | Test Target | Generator |
|----------|-------------|-----------|
| P1: Registration defaults | User model | Arbitrary valid registration payloads |
| P2: Bio length validation | User model + validateProfile | Strings of arbitrary length |
| P3: Profile response shape | GET /api/users/profile | Arbitrary user documents |
| P4: Update reflects submitted values | PUT /api/users/profile | Arbitrary valid profile update payloads |
| P5: Invalid email rejected | validateProfile middleware | Arbitrary non-email strings |
| P6: Duplicate conflict | PUT /api/users/profile | Pairs of users with shared username/email |
| P7: Partial update preserves fields | PUT /api/users/profile | Arbitrary subsets of profile fields |
| P8: Social link URL validation | validateProfile middleware | Arbitrary strings (mix of https://, http://, random) |
| P9: Avatar upload validation | uploadMiddleware | Arbitrary MIME types and file sizes |
| P10: Avatar upload round-trip | POST avatar + GET profile | Arbitrary valid image files |
| P11: Image URL construction | ProfileForm URL builder | Arbitrary relative paths |
| P12: Error toast completeness | ProfileForm error handler | Arbitrary server error response shapes |

### Integration Tests

- Verify the `/uploads` static route serves uploaded files correctly (1–2 examples).
- Verify all three profile endpoints return 401 without a valid JWT.
- Verify the full profile update flow end-to-end against a test MongoDB instance.

### Test Configuration

```js
// Example fast-check property test structure
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('user-profile-management', () => {
  it('P2: bio length validation', () => {
    // Feature: user-profile-management, Property 2: bio length validation
    fc.assert(
      fc.property(fc.string({ minLength: 501, maxLength: 1000 }), (longBio) => {
        const result = validateBioLength(longBio);
        expect(result.valid).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
```

---

## File and Folder Structure

```
PortfolioMaker/
├── server/
│   ├── controllers/
│   │   ├── authController.js        (existing)
│   │   ├── portfolioController.js   (existing)
│   │   └── userController.js        ← NEW
│   ├── middleware/
│   │   ├── authMiddleware.js        (existing)
│   │   ├── errorMiddleware.js       (existing)
│   │   ├── uploadMiddleware.js      ← NEW (multer config)
│   │   └── validateProfile.js      ← NEW (input validation)
│   ├── models/
│   │   └── User.js                  ← MODIFIED (add profile fields)
│   ├── routes/
│   │   ├── authRoutes.js            (existing)
│   │   ├── portfolioRoutes.js       (existing)
│   │   └── userRoutes.js            ← NEW
│   ├── uploads/
│   │   └── avatars/                 ← NEW (created at runtime by multer)
│   └── index.js                     ← MODIFIED (mount userRoutes + static)
│
└── client/
    └── src/
        ├── context/
        │   └── AuthContext.jsx      ← MODIFIED (expose setUser)
        ├── pages/
        │   ├── Dashboard.jsx        ← MODIFIED (render ProfileForm)
        │   └── ProfileForm.jsx      ← NEW
        └── services/
            ├── api.js               (existing)
            └── profileService.js    ← NEW
```

### New Dependencies

**Server** — add to `server/package.json`:
```json
"multer": "^1.4.5-lts.1"
```

**Client** — add to `client/package.json`:
```json
"react-hot-toast": "^2.4.1"
```
