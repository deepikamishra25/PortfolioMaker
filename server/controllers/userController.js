import User from '../models/User.js';

// ── GET /api/users/profile ────────────────────────────────────────────────────
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/profile ────────────────────────────────────────────────────
export const updateUserProfile = async (req, res, next) => {
  try {
    const { displayName, username, email, bio, socialLinks } = req.body;

    // Build update object — only include fields that were sent
    const updateFields = {};
    if (displayName !== undefined) updateFields.displayName = displayName;
    if (bio !== undefined)         updateFields.bio = bio;

    if (username !== undefined) {
      // Check for conflict with another user
      const conflict = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });
      if (conflict) {
        res.status(409);
        return next(new Error('Username already taken'));
      }
      updateFields.username = username;
    }

    if (email !== undefined) {
      const conflict = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.user._id },
      });
      if (conflict) {
        res.status(409);
        return next(new Error('Email already in use'));
      }
      updateFields.email = email.toLowerCase();
    }

    // Merge socialLinks sub-fields (partial update within the nested object)
    if (socialLinks !== undefined && typeof socialLinks === 'object') {
      const fields = ['github', 'linkedin', 'twitter', 'website'];
      for (const field of fields) {
        if (socialLinks[field] !== undefined) {
          updateFields[`socialLinks.${field}`] = socialLinks[field];
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404);
      return next(new Error('User not found'));
    }

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/users/profile/avatar ───────────────────────────────────────────
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('No image file provided'));
    }

    const relativePath = `/uploads/avatars/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: relativePath },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404);
      return next(new Error('User not found'));
    }

    res.json({ profileImage: relativePath });
  } catch (err) {
    next(err);
  }
};
