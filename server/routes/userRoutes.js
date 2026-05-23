import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../controllers/userController.js';
import { validateProfile } from '../middleware/validateProfile.js';
import { handleUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, validateProfile, updateUserProfile);
router.post('/profile/avatar', protect, handleUpload, uploadAvatar);

export default router;
