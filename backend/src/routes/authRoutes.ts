import express from 'express';
import { getCurrentUser, loginUser, logoutUser } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Logs a user in
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// @route   GET /api/auth/me
// @desc    Get current user (protected route)
router.get("/me", protect, getCurrentUser);

export default router;