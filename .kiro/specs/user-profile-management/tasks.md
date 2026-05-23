# Implementation Plan: User Profile Management

## Overview

Implement a full-stack user profile management feature: extend the User Mongoose model with profile fields, add three new REST endpoints under `/api/users`, create Multer-based avatar upload middleware, add server-side validation middleware, build a `profileService.js` API layer on the client, and render a `ProfileForm` component inside the Dashboard's existing "Profile" menu slot. All tasks follow the existing ES Module + React/Tailwind CSS v4 patterns.

## Tasks

- [x] 1. Install new dependencies
  - Run `npm install multer@1.4.5-lts.1` inside `server/`
  - Run `npm install react-hot-toast@2.4.1` inside `client/`
  - _Requirements: 4.1 (Image_Uploader), 7.6 (Toast_Service)_

- [x] 2. Extend the User Mongoose model with profile fields
  - Open `server/models/User.js` and add the following optional fields to the existing schema (after the `password` field):
    - `displayName`: `{ type: String, trim: true, default: '' }`
    - `bio`: `{ type: String, maxlength: [500, 'Bio cannot exceed 500 characters'], default: '' }`
    - `profileImage`: `{ type: String, default: '' }` — stores relative path only (e.g. `/uploads/avatars/file.jpg`)
    - `socialLinks`: nested object with sub-fields `github`, `linkedin`, `twitter`, `website`, each `{ type: String, default: '' }`
  - All new fields must be optional with empty-string defaults so existing registration logic and existing user documents are unaffected
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.1 Write property test for registration defaults (Property 1)
    - **Property 1: Registration Defaults Profile Fields**
    - For any valid registration payload, the created user document SHALL have `displayName`, `bio`, `profileImage` equal to `''` and `socialLinks` with all sub-fields equal to `''`
    - Use `fast-check` with `fc.record({ username, email, password })` generators; assert defaults after `User.create()`
    - **Validates: Requirements 1.2**

  - [x] 2.2 Write property test for bio length validation (Property 2)
    - **Property 2: Bio Length Validation**
    - For any bio string with length ≤ 500 the schema save SHALL succeed; for any bio with length > 500 it SHALL throw a validation error
    - Use `fc.string({ minLength: 0, maxLength: 500 })` for valid and `fc.string({ minLength: 501, maxLength: 1000 })` for invalid
    - **Validates: Requirements 1.3, 3.4**

- [x] 3. Create Multer upload middleware
  - Create `server/middleware/uploadMiddleware.js` using ES Module syntax
  - Configure `multer.diskStorage` to save files to `server/uploads/avatars/` with a unique filename: `<uuid>-<timestamp>.<ext>` (use `crypto.randomUUID()` — no extra dependency)
  - Add a `fileFilter` that accepts only `image/jpeg`, `image/png`, and `image/webp`; call `cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false)` for any other MIME type
  - Set `limits: { fileSize: 5 * 1024 * 1024 }` (5 MB)
  - Export a `handleUpload` wrapper function that calls `upload.single('avatar')` and intercepts `MulterError` instances, mapping `LIMIT_FILE_SIZE` to HTTP 400 `{ message: 'Image must be smaller than 5 MB' }` and other multer errors to HTTP 400 with their message; also handle the case where no file is provided in the controller (not multer)
  - _Requirements: 4.1, 4.2, 4.3, 10.3_

  - [x] 3.1 Write property test for avatar upload validation (Property 9)
    - **Property 9: Avatar Upload Validation (MIME Type and File Size)**
    - For any file with a MIME type not in `['image/jpeg', 'image/png', 'image/webp']` the filter SHALL reject it; for any file > 5 MB the size limit SHALL reject it
    - Use `fc.constantFrom(...invalidMimes)` and `fc.integer({ min: 5_242_881 })` generators
    - **Validates: Requirements 4.2, 4.3**

- [x] 4. Create profile validation middleware
  - Create `server/middleware/validateProfile.js` using ES Module syntax
  - Export a single `validateProfile` middleware function that checks the request body and calls `next(error)` (with `res.status()` set) for any of the following violations:
    - `username` present but empty string → HTTP 400 `"Username is required"`
    - `email` present but not matching a valid email regex → HTTP 400 `"Please provide a valid email address"`
    - `bio` present and length > 500 → HTTP 400 `"Bio cannot exceed 500 characters"`
    - Any `socialLinks` sub-field present, non-empty, and not starting with `https://` → HTTP 400 `"Social links must start with https:// or be empty"`
  - All checks are only applied when the field is present in the body (partial update support)
  - _Requirements: 3.2, 3.3, 3.4, 3.7_

  - [x] 4.1 Write property test for invalid email rejection (Property 5)
    - **Property 5: Invalid Email Format Rejected**
    - For any string that does not match a valid email format, `validateProfile` SHALL set status 400 and call `next` with an error
    - Use `fc.string()` filtered to exclude valid email patterns
    - **Validates: Requirements 3.3**

  - [x] 4.2 Write property test for social link URL validation (Property 8)
    - **Property 8: Social Link URL Validation**
    - For any non-empty social link value that does not start with `https://`, `validateProfile` SHALL reject with HTTP 400; empty strings and `https://`-prefixed strings SHALL pass
    - Use `fc.string()` with mixed prefixes (`http://`, random, `https://`)
    - **Validates: Requirements 3.7**

- [x] 5. Create the user controller
  - Create `server/controllers/userController.js` using ES Module syntax
  - Implement and export three functions:

  **`getUserProfile(req, res, next)`**
  - Query `User.findById(req.user._id).select('-password')`
  - If not found → `res.status(404)` + `next(new Error('User not found'))`
  - On success → `res.json(user)` with all profile fields included
  - _Requirements: 2.1, 2.3, 2.4_

  **`updateUserProfile(req, res, next)`**
  - Extract `displayName`, `username`, `email`, `bio`, `socialLinks` from `req.body` (only fields present in body are updated — partial update)
  - If `username` or `email` is being changed, check for conflicts with other users using `User.findOne({ $or: [...], _id: { $ne: req.user._id } })`; if conflict → `res.status(409)` + `next(new Error(...))`
  - Use `User.findByIdAndUpdate(req.user._id, { $set: updateFields }, { new: true, runValidators: true }).select('-password')`
  - On success → `res.json(updatedUser)`
  - _Requirements: 3.1, 3.5, 3.6_

  **`uploadAvatar(req, res, next)`**
  - If `req.file` is falsy → `res.status(400)` + `next(new Error('No image file provided'))`
  - Build relative path: `/uploads/avatars/${req.file.filename}`
  - Update user: `User.findByIdAndUpdate(req.user._id, { profileImage: relativePath }, { new: true })`
  - On success → `res.json({ profileImage: relativePath })`
  - _Requirements: 4.1, 4.4, 4.6_

  - [x] 5.1 Write property test for profile response shape and password exclusion (Property 3)
    - **Property 3: Profile Response Shape and Password Exclusion**
    - For any user document, `getUserProfile` SHALL return all of `_id`, `username`, `email`, `displayName`, `bio`, `profileImage`, `socialLinks` and SHALL NOT include `password`
    - Use `fc.record(...)` to generate arbitrary user documents; assert response shape
    - **Validates: Requirements 2.1, 2.4**

  - [x] 5.2 Write property test for profile update reflecting submitted values (Property 4)
    - **Property 4: Profile Update Reflects Submitted Values**
    - For any valid profile update payload, the response body SHALL contain values matching the submitted fields and the DB document SHALL reflect those values
    - Use `fc.record({ displayName: fc.string(), bio: fc.string({ maxLength: 500 }), ... })` generators
    - **Validates: Requirements 3.1**

  - [x] 5.3 Write property test for partial update preserving omitted fields (Property 7)
    - **Property 7: Partial Update Preserves Omitted Fields**
    - For any update payload that omits one or more fields, the omitted fields SHALL retain their previous values in the DB and in the response
    - Use `fc.subarray(profileFieldNames)` to generate arbitrary subsets of fields to include/omit
    - **Validates: Requirements 3.6**

  - [x] 5.4 Write property test for duplicate username/email conflict (Property 6)
    - **Property 6: Duplicate Username or Email Conflict**
    - For any `username` or `email` already belonging to a different user, `updateUserProfile` SHALL respond with HTTP 409
    - Generate pairs of users with shared username or email using `fc.record(...)`
    - **Validates: Requirements 3.5**

- [x] 6. Create user routes and register them on the server
  - Create `server/routes/userRoutes.js` using ES Module syntax
  - Import `protect` from `../middleware/authMiddleware.js`
  - Import `getUserProfile`, `updateUserProfile`, `uploadAvatar` from `../controllers/userController.js`
  - Import `validateProfile` from `../middleware/validateProfile.js`
  - Import `handleUpload` from `../middleware/uploadMiddleware.js`
  - Define routes:
    - `GET  /profile` → `protect`, `getUserProfile`
    - `PUT  /profile` → `protect`, `validateProfile`, `updateUserProfile`
    - `POST /profile/avatar` → `protect`, `handleUpload`, `uploadAvatar`
  - In `server/index.js`:
    - Import `userRoutes` and mount at `/api/users`
    - Add `app.use('/uploads', express.static('uploads'))` **before** the error middleware (path is relative to where the server process runs, i.e. the `server/` directory)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 7. Checkpoint — verify backend endpoints
  - Ensure the server starts without errors after the above changes
  - Manually test (or write integration tests) that:
    - `GET /api/users/profile` returns 401 without a token
    - `PUT /api/users/profile` returns 401 without a token
    - `POST /api/users/profile/avatar` returns 401 without a token
    - `GET /api/users/profile` returns the correct shape with a valid token
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create the profile API service on the client
  - Create `client/src/services/profileService.js` using ES Module syntax
  - Import the shared `api` Axios instance from `./api.js`
  - Export three named functions:
    ```js
    export const getProfile = () => api.get('/users/profile');
    export const updateProfile = (data) => api.put('/users/profile', data);
    export const uploadAvatar = (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.post('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    };
    ```
  - No raw Axios calls should remain in component code
  - _Requirements: 9.1, 9.3_

- [x] 9. Expose `setUser` from AuthContext
  - Open `client/src/context/AuthContext.jsx`
  - Add `setUser` to the context value object so consuming components can sync the user state after a profile update:
    ```jsx
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, setUser }}>
    ```
  - _Requirements: 8.1, 8.2_

- [x] 10. Build the ProfileForm component
  - Create `client/src/pages/ProfileForm.jsx`
  - The component must:

  **Loading state (Requirement 8.3)**
  - On mount, call `getProfile()` from `profileService.js`
  - While loading, render a skeleton/spinner in place of the form (a centered pink spinner matching the Dashboard loading style)

  **Form fields (Requirement 5.2, 5.4)**
  - Use `react-hook-form` (`useForm`) with `defaultValues` reset via `reset(data)` after the profile loads
  - Fields: `displayName` (text), `username` (text, required), `email` (text, required, email pattern), `bio` (textarea, maxLength 500), `socialLinks.github`, `socialLinks.linkedin`, `socialLinks.twitter`, `socialLinks.website` (all text, optional)
  - Show inline validation error messages beneath each failing field (Requirement 5.5)

  **Avatar section (Requirements 6.1–6.5)**
  - Render a circular avatar preview area above the form
  - If `profileImage` exists on the loaded profile, construct the full URL as `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}{profileImage}` and display it in an `<img>` tag
  - If no image exists, display a `<User>` icon from Lucide React as placeholder
  - On file input change, use `FileReader` to show a local object URL preview immediately (before upload)
  - Provide an "Upload" button that calls `uploadAvatar(file)` from `profileService.js`, updates the preview with the returned path, calls `setUser({ ...user, profileImage: newPath })`, and shows a success toast
  - On upload failure, retain the previous preview and show an error toast

  **Form submission (Requirements 3.1, 7.1, 7.2, 8.1)**
  - On valid submit, call `updateProfile(data)` from `profileService.js`
  - On success: call `setUser(updatedUser)` from AuthContext, show `toast.success('Profile updated successfully')`
  - On failure: show `toast.error(err.response?.data?.message || 'Failed to update profile')`
  - Disable the submit button and show a loading indicator while submission is in progress (Requirement 5.6)

  **Layout and styling (Requirements 5.7, 5.8)**
  - Single-column on mobile, two-column grid on `md:` and wider using Tailwind CSS v4 utility classes
  - Dark glassmorphic panels, `slate-950` background, pink/purple accent colors matching the existing Dashboard style

  - [x] 10.1 Write property test for image URL construction (Property 11)
    - **Property 11: Profile Image URL Construction**
    - For any relative `profileImage` path (e.g. `/uploads/avatars/file.jpg`), the URL builder in `ProfileForm` SHALL prepend the server base URL to produce a valid, accessible URL
    - Extract the URL construction logic into a pure helper function and test it with `fc.string()` generators for arbitrary relative paths
    - **Validates: Requirements 6.3**

  - [x] 10.2 Write property test for error toast message completeness (Property 12)
    - **Property 12: Error Toast Message Completeness**
    - For any failed profile update response shape, the displayed error toast SHALL contain either `error.response.data.message` or the fallback `"Failed to update profile"` — never empty or undefined
    - Extract the error message resolution logic into a pure helper and test with `fc.record({ response: fc.option(...) })` generators
    - **Validates: Requirements 7.2**

- [x] 11. Wire ProfileForm into the Dashboard
  - Open `client/src/pages/Dashboard.jsx`
  - Import `ProfileForm` from `./ProfileForm.jsx`
  - In the scrollable working space section, add a conditional render: when `activeMenu === 'profile'`, render `<ProfileForm />` instead of (or wrapping) the default analytics content
  - The existing analytics content should only render when `activeMenu === 'analytics'` (or any non-profile menu)
  - Add `<Toaster />` from `react-hot-toast` to the Dashboard JSX (or to `App.jsx` if a global placement is preferred) with `toastOptions={{ duration: 4000 }}` to satisfy the 4-second auto-dismiss requirement
  - _Requirements: 5.1, 7.5, 7.6_

- [x] 12. Checkpoint — verify avatar upload round-trip (Property 10)
  - Start the dev server and navigate to the Dashboard Profile section
  - Upload a valid image and confirm:
    - The preview updates immediately with the local FileReader URL
    - After upload, the preview switches to the server-served URL
    - A subsequent page reload still shows the uploaded avatar (confirming DB persistence)
    - `GET /api/users/profile` returns a `profileImage` matching the path returned by the upload response
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 4.4, 4.5, 6.4_

  - [x] 12.1 Write property test for avatar upload round-trip (Property 10)
    - **Property 10: Avatar Upload Round-Trip**
    - For any successfully uploaded avatar file, a subsequent `GET /api/users/profile` SHALL return a `profileImage` value matching the relative path returned by the upload response
    - Use integration test with a test MongoDB instance and `fc.constantFrom(validImageBuffers)` generators
    - **Validates: Requirements 4.4**

- [x] 13. Final checkpoint — full integration verification
  - Verify the complete profile flow end-to-end:
    - Profile form loads and pre-populates all fields from `GET /api/users/profile`
    - Updating display name, bio, and social links persists correctly and the Dashboard header/sidebar reflects the new username immediately (AuthContext sync)
    - Partial updates do not clear omitted fields
    - Validation errors (empty username, bad email, bio > 500 chars, invalid social link URL) show inline on the form and are also rejected server-side
    - Duplicate username/email shows a 409 error toast
    - Toast notifications appear and auto-dismiss after 4 seconds
    - The `/uploads/avatars/` static route serves uploaded images correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at the backend boundary and after full integration
- Property tests validate universal correctness properties using `fast-check` with a minimum of 100 iterations per property
- Unit tests validate specific examples and edge cases
- The design document's Correctness Properties section maps directly to the `*`-marked PBT sub-tasks (Properties 1–12)
