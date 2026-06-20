/**
 * Global Express error handler.
 */
function errorHandler(err, req, res, _next) {
    const status = err.status || err.response?.status || 500;
    let message =
        err.message || "An unexpected error occurred during scraping.";

    // Provide clearer guidance for upstream anti-bot blocks in VPS/datacenter environments.
    if (status === 403 && err.response?.config?.url) {
        message = `Upstream target returned 403 (blocked/forbidden): ${err.response.config.url}. This often happens on datacenter IPs. Set SCRAPE_USER_AGENT and SCRAPE_COOKIE in .env, or use a proxy/residential egress.`;
    }

    console.error(
        JSON.stringify({
            level: "error",
            time: new Date().toISOString(),
            path: req.originalUrl,
            message,
            status,
        })
    );

    res.status(status >= 400 && status < 600 ? status : 500).json({
        error: status >= 500 ? "Internal Server Error" : "Request Error",
        message,
    });
}

module.exports = errorHandler;
