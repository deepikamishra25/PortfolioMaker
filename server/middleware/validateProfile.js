// Validation middleware for PUT /api/users/profile
// All checks are only applied when the field is present in the request body
// (supports partial updates).

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export const validateProfile = (req, res, next) => {
  const { username, email, bio, socialLinks } = req.body;

  // username present but empty
  if (username !== undefined && username.trim() === '') {
    res.status(400);
    return next(new Error('Username is required'));
  }

  // email present but invalid format
  if (email !== undefined && !EMAIL_REGEX.test(email)) {
    res.status(400);
    return next(new Error('Please provide a valid email address'));
  }

  // bio present and exceeds 500 chars
  if (bio !== undefined && bio.length > 500) {
    res.status(400);
    return next(new Error('Bio cannot exceed 500 characters'));
  }

  // socialLinks sub-fields: must be empty string or start with https://
  if (socialLinks !== undefined && typeof socialLinks === 'object') {
    const fields = ['github', 'linkedin', 'twitter', 'website'];
    for (const field of fields) {
      const value = socialLinks[field];
      if (value !== undefined && value !== '' && !value.startsWith('https://')) {
        res.status(400);
        return next(new Error('Social links must start with https:// or be empty'));
      }
    }
  }

  next();
};
