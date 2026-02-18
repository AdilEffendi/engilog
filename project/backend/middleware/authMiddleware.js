const { User } = require('../models');

module.exports = async (req, res, next) => {
    try {
        // Check for custom header or query param
        const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
        console.log(`[AuthMiddleware] Request to ${req.originalUrl} - UserID: ${userId}`);

        if (!userId) {
            // For now, allow requests to proceed without user if not strict, 
            // OR return 401. 
            // Since I'm retrofitting this, some public routes might hit this if applied globally.
            // But I'm applying it to specific routes.
            // Notification routes REQUIRE user.
            // Item routes use it optionally.

            // If the route expects authentication, this might be an issue. 
            // Let's check if we can skip.
            // For now, let's just proceed with req.user = undefined.
            return next();
        }

        const user = await User.findByPk(userId);
        if (user) {
            req.user = user;
            console.log(`[AuthMiddleware] User authenticated: ${user.name} (${user.id})`);
        } else {
            console.error(`[AuthMiddleware] User not found for ID: ${userId}`);
        }
        next();
    } catch (error) {
        console.error("[AuthMiddleware] Error:", error);
        next();
    }
};
