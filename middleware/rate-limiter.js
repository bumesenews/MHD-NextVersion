const rateLimit = require("express-rate-limit");

/** General API rate limit – 120 requests / minute per IP */
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
    },
});

/** Stricter limit for /api/watch (stream extraction is expensive) */
const watchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: parseInt(process.env.WATCH_RATE_LIMIT_MAX, 10) || 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too Many Requests",
        message: "Watch rate limit exceeded. Please try again later.",
    },
});

module.exports = { apiLimiter, watchLimiter };
