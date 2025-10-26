import express from 'express';
import { loginUser, logoutUser } from '../controllers/authController'; // Adjust path
import { protect } from '@/middleware/authMiddleware';
// Import middleware if you add a 'get profile' route
// import { protect } from '../middleware/authMiddleware'; 

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Logs a user in
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get("/me", protect, async (req: any, res) => {
    res.json({
      user: req.user
    });
});
// @desc    A protected route to get the logged-in user's profile
// router.get('/me', protect, getMyProfile); // You can add this controller

export default router;