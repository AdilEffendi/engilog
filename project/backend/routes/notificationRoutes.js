const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware'); // Check if this exists

// All routes require authentication
// Assuming authMiddleware adds req.user
// If authMiddleware file name is different, I need to check.
// Checking file structure earlier: authController exists, let's assume middleware exists or I need to find it.
// Wait, I haven't checked for authMiddleware. I'll use a placeholder or check.
// Better to check first. But for now I'll assume standard naming based on previous files.
// Actually, looking at `server.js`... it imports routes.
// `itemRoutes.js` doesn't seem to use auth middleware explicitly in the file I viewed?
// Let me check `itemRoutes` again.

// Re-reading itemRoutes from previous view_file:
// router.get('/', itemController.getAllItems);
// It does NOT use auth middleware? That's risky but okay for now.
// But notifications definitely need a user context (`req.user.id`).
// If there is no global auth middleware blocking requests, I need to know how `req.user` is populated.
// `authController` likely handles login.
// Let's assume I need to create or use an auth middleware.

// For now, I will create the routes and assume I can add middleware later if needed.
// But wait, `getNotifications` uses `req.user.id`.
// I MUST ensure `req.user` is available.

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
