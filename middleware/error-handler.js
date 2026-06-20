/**
 * Global Express error handler.
 */
function errorHandler(err, req, res, _next) {
    const status = err.status || err.response?.status || 500;
    const message =
        err.message || "An unexpected error occurred during scraping.";

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
