# Requirements Document

## Introduction

The User Profile Management module adds a dedicated profile section to the PortfolioMaker dashboard. Authenticated users can view and edit their personal details (display name, username, email), write a bio, upload a profile image, and manage social media links (GitHub, LinkedIn, Twitter, personal website). Profile data is persisted in MongoDB by extending the existing User model. The backend exposes two new REST endpoints (`GET /api/users/profile` and `PUT /api/users/profile`) plus a dedicated image-upload endpoint. The frontend renders a responsive profile form inside the existing Dashboard "Profile" menu item, with image preview, real-time validation, and toast notifications for feedback.

---

## Glossary

- **Profile_API**: The Express router and controller responsible for `GET /api/users/profile`, `PUT /api/users/profile`, and `POST /api/users/profile/avatar`.
- **Profile_Form**: The React component rendered when the Dashboard sidebar "Profile" menu item is active.
- **Image_Uploader**: The Multer-based middleware that handles multipart/form-data image uploads and stores files on disk under `server/uploads/avatars/`.
- **Validation_Middleware**: The Express middleware layer that checks request body fields before they reach the controller.
- **Toast_Service**: The lightweight in-app notification component (implemented via `react-hot-toast`) that displays success and error messages.
- **AuthContext**: The existing React context that holds the authenticated user object and exposes `setUser` for updating it after a profile save.
- **User**: The Mongoose model defined in `server/models/User.js`, extended with profile fields.
- **Static_Server**: The Express `express.static` middleware that serves uploaded files from `server/uploads/` at the `/uploads` URL path.

---

## Requirements

### Requirement 1: Extend the User Data Model

**User Story:** As a developer, I want the User model to store profile fields, so that profile data can be persisted and retrieved from MongoDB.

#### Acceptance Criteria

1. THE User SHALL include optional fields: `displayName` (String, trimmed), `bio` (String, max 500 characters), `profileImage` (String, stores relative file path), and `socialLinks` (Object with sub-fields `github`, `linkedin`, `twitter`, `website`, each a String).
2. WHEN a new user is registered, THE User SHALL default all new profile fields to empty strings or empty objects so that existing registration logic is not broken.
3. THE User SHALL enforce that `bio` does not exceed 500 characters at the schema level.
4. WHEN the `profileImage` field is set, THE User SHALL store only the relative server path (e.g., `/uploads/avatars/filename.jpg`), not an absolute filesystem path.

---

### Requirement 2: Retrieve User Profile

**User Story:** As an authenticated user, I want to fetch my full profile data, so that the Profile Form can be pre-populated with my current information.

#### Acceptance Criteria

1. WHEN an authenticated request is made to `GET /api/users/profile`, THE Profile_API SHALL return a JSON object containing `_id`, `username`, `email`, `displayName`, `bio`, `profileImage`, and `socialLinks`.
2. IF the requesting user is not authenticated (missing or invalid JWT), THEN THE Profile_API SHALL respond with HTTP 401 and a descriptive error message.
3. IF the user document is not found in the database, THEN THE Profile_API SHALL respond with HTTP 404 and a descriptive error message.
4. THE Profile_API SHALL exclude the `password` field from all profile responses.

---

### Requirement 3: Update User Profile

**User Story:** As an authenticated user, I want to save changes to my personal details, bio, and social links, so that my profile reflects up-to-date information.

#### Acceptance Criteria

1. WHEN an authenticated `PUT /api/users/profile` request is received with valid body fields, THE Profile_API SHALL update the user document in MongoDB and respond with HTTP 200 and the updated profile object (excluding `password`).
2. THE Validation_Middleware SHALL reject requests where `username` is an empty string, responding with HTTP 400 and a field-level error message.
3. THE Validation_Middleware SHALL reject requests where `email` does not match a valid email format, responding with HTTP 400 and a field-level error message.
4. THE Validation_Middleware SHALL reject requests where `bio` exceeds 500 characters, responding with HTTP 400 and a descriptive error message.
5. IF the submitted `username` or `email` already belongs to a different user, THEN THE Profile_API SHALL respond with HTTP 409 and a descriptive conflict error message.
6. WHEN a `PUT /api/users/profile` request is received, THE Profile_API SHALL allow partial updates — fields omitted from the request body SHALL retain their existing values.
7. THE Validation_Middleware SHALL sanitize `socialLinks` URLs by accepting only strings that begin with `https://` or an empty string, responding with HTTP 400 for any non-conforming value.

---

### Requirement 4: Upload Profile Image

**User Story:** As an authenticated user, I want to upload a profile photo, so that my avatar is displayed across the dashboard and portfolio.

#### Acceptance Criteria

1. WHEN an authenticated `POST /api/users/profile/avatar` request is received with a valid image file, THE Image_Uploader SHALL store the file on disk under `server/uploads/avatars/` with a unique filename and respond with HTTP 200 and the relative image path.
2. THE Image_Uploader SHALL accept only files with MIME types `image/jpeg`, `image/png`, and `image/webp`, responding with HTTP 400 and a descriptive error message for any other type.
3. THE Image_Uploader SHALL reject files larger than 5 MB, responding with HTTP 400 and a descriptive error message.
4. WHEN a new avatar is successfully uploaded, THE Profile_API SHALL update the `profileImage` field on the user document with the new relative path.
5. THE Static_Server SHALL serve files from `server/uploads/` at the `/uploads` URL path so that stored image paths resolve to accessible URLs.
6. IF the upload request contains no file, THEN THE Image_Uploader SHALL respond with HTTP 400 and the message "No image file provided".

---

### Requirement 5: Profile Form UI

**User Story:** As an authenticated user, I want a responsive profile editing form in the Dashboard, so that I can view and update my profile without leaving the app.

#### Acceptance Criteria

1. WHEN the Dashboard sidebar "Profile" menu item is activated, THE Profile_Form SHALL render within the main content area of the Dashboard, replacing the default analytics view.
2. THE Profile_Form SHALL display input fields for `displayName`, `username`, `email`, `bio`, and four social link fields (`github`, `linkedin`, `twitter`, `website`).
3. WHEN the Profile_Form mounts, THE Profile_Form SHALL call `GET /api/users/profile` and pre-populate all fields with the returned data.
4. THE Profile_Form SHALL use React Hook Form for field registration, validation, and submission handling.
5. THE Profile_Form SHALL display inline validation error messages beneath each field that fails client-side validation before the form is submitted.
6. WHILE a form submission is in progress, THE Profile_Form SHALL disable the submit button and display a loading indicator to prevent duplicate submissions.
7. THE Profile_Form SHALL be responsive, rendering in a single-column layout on screens narrower than 768 px and a two-column layout on screens 768 px and wider, using Tailwind CSS utility classes.
8. THE Profile_Form SHALL match the existing Dashboard visual style: dark glassmorphic panels, `slate-950` background, pink/purple accent colors, and Tailwind CSS v4 utility classes.

---

### Requirement 6: Profile Image Preview

**User Story:** As an authenticated user, I want to preview my selected profile image before uploading it, so that I can confirm the correct file is chosen.

#### Acceptance Criteria

1. WHEN a user selects an image file via the file input, THE Profile_Form SHALL display a local preview of the selected image using a `FileReader` object URL before any upload occurs.
2. WHEN no image has been selected and no `profileImage` exists on the profile, THE Profile_Form SHALL display a default avatar placeholder (a `User` icon from Lucide React).
3. WHEN a `profileImage` path exists on the loaded profile, THE Profile_Form SHALL display the image by constructing the full URL as `{VITE_API_URL or server base}/uploads/...`.
4. WHEN the user clicks the upload button after selecting a file, THE Profile_Form SHALL send the file to `POST /api/users/profile/avatar` as `multipart/form-data` and update the preview with the returned path on success.
5. IF the image upload fails, THEN THE Profile_Form SHALL retain the previous preview and display an error toast via the Toast_Service.

---

### Requirement 7: Toast Notifications

**User Story:** As an authenticated user, I want to see clear success and error notifications after profile actions, so that I know whether my changes were saved.

#### Acceptance Criteria

1. WHEN a profile update (`PUT /api/users/profile`) succeeds, THE Toast_Service SHALL display a success toast with the message "Profile updated successfully".
2. WHEN a profile update fails due to a server or network error, THE Toast_Service SHALL display an error toast containing the server-provided error message or a fallback message "Failed to update profile".
3. WHEN an avatar upload succeeds, THE Toast_Service SHALL display a success toast with the message "Profile image updated".
4. WHEN an avatar upload fails, THE Toast_Service SHALL display an error toast with a descriptive message.
5. THE Toast_Service SHALL auto-dismiss toasts after 4 seconds.
6. THE Toast_Service SHALL be implemented using the `react-hot-toast` library, installed as a project dependency.

---

### Requirement 8: AuthContext Profile Sync

**User Story:** As an authenticated user, I want the dashboard header and sidebar to reflect my updated username immediately after saving, so that the UI stays consistent.

#### Acceptance Criteria

1. WHEN a profile update succeeds, THE Profile_Form SHALL call the AuthContext `setUser` function with the updated user object so that all components consuming AuthContext reflect the new data without a page reload.
2. WHEN a new avatar is uploaded successfully, THE Profile_Form SHALL update the AuthContext user object to include the new `profileImage` path.
3. WHILE the profile data is loading on mount, THE Profile_Form SHALL display a skeleton or spinner in place of the form fields.

---

### Requirement 9: API Service Integration

**User Story:** As a developer, I want all profile API calls to go through the existing Axios instance, so that JWT authentication is applied automatically and error handling is consistent.

#### Acceptance Criteria

1. THE Profile_Form SHALL use the existing `api` Axios instance from `client/src/services/api.js` for all HTTP calls to the Profile_API.
2. WHEN the Axios response interceptor detects a 401 response from any profile endpoint, THE Profile_Form SHALL redirect the user to `/login?expired=true` via the existing interceptor logic without additional handling in the component.
3. THE Profile_Form SHALL expose profile API calls as named functions in a dedicated `client/src/services/profileService.js` module, keeping component code free of raw Axios calls.

---

### Requirement 10: Backend Route Registration

**User Story:** As a developer, I want the profile routes registered on the Express server, so that the new endpoints are reachable at the documented paths.

#### Acceptance Criteria

1. THE Profile_API SHALL be mounted at `/api/users` in `server/index.js`, making the full endpoint paths `/api/users/profile` (GET, PUT) and `/api/users/profile/avatar` (POST).
2. WHEN the server starts, THE Static_Server SHALL be registered in `server/index.js` to serve `/uploads` from the `server/uploads/` directory.
3. THE Profile_API routes SHALL use ES Module `import/export` syntax with `.js` file extensions on all internal imports, consistent with the existing server codebase.
4. THE Profile_API SHALL apply the existing `authMiddleware` to all three profile endpoints to enforce authentication.
