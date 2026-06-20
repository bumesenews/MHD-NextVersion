/**
 * Optional CORS – set CORS_ORIGIN in .env (e.g. * or https://your-app.com)
 */
function corsMiddleware(req, res, next) {
    const origin = process.env.CORS_ORIGIN;

    if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key");
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
}

module.exports = corsMiddleware;
