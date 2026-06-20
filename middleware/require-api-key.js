const { isAuthorized } = require("../utils/security");

/**
 * Reject requests when API_KEY is configured and header is missing/wrong.
 */
function requireApiKey(req, res, next) {
    if (isAuthorized(req)) {
        return next();
    }

    return res.status(401).json({
        error: "Unauthorized",
        message: "Valid API key required. Send X-Api-Key header.",
    });
}

module.exports = requireApiKey;
