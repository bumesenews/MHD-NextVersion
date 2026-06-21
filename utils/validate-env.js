/**
 * Warn on placeholder or invalid scrape URLs before outbound requests fail at runtime.
 */

const PLACEHOLDER_HOSTS = new Set([
    "website1.com",
    "website2.com",
    "website3.com",
    "website4.com",
    "www.example.com",
    "example.com",
    "yourdomain.com",
]);

const URL_VARS = [
    "HOME_BASE_URL",
    "MODELS_BASE_URL",
    "TAGS_BASE_URL",
    "CHANNELS_BASE_URL",
    "WATCH_BASE_URL",
    "WATCH_REFERER",
];

/**
 * @returns {{ errors: string[], warnings: string[] }}
 */
function validateEnv() {
    const errors = [];
    const warnings = [];

    for (const key of URL_VARS) {
        const raw = process.env[key];
        if (!raw) continue;

        let parsed;
        try {
            parsed = new URL(raw);
        } catch {
            errors.push(
                `${key}="${raw}" is not a valid URL. Use full https:// URLs (e.g. https://www.xvideos.com).`
            );
            continue;
        }

        const host = parsed.hostname.toLowerCase();
        if (PLACEHOLDER_HOSTS.has(host)) {
            errors.push(
                `${key} points to placeholder host "${host}". Copy real values from your working local .env.`
            );
        }
    }

    const modelsPath = process.env.MODELS_LIST_PATH || "";
    if (modelsPath.startsWith("/models/")) {
        warnings.push(
            `MODELS_LIST_PATH="${modelsPath}" looks wrong. Use /pornstars-index (not /models/pornstars-index).`
        );
    }

    if (!process.env.API_KEY) {
        warnings.push("API_KEY is not set. All requests are allowed without authentication.");
    }

    return { errors, warnings };
}

/**
 * Log validation results; exit in production when placeholders are detected.
 */
function assertEnvOrExit() {
    const { errors, warnings } = validateEnv();
    const logger = require("./logger");

    for (const message of warnings) {
        logger.warn("Env warning", { message });
    }

    for (const message of errors) {
        logger.error("Env error", { message });
    }

    if (errors.length && process.env.NODE_ENV === "production") {
        logger.error("Refusing to start with invalid scrape URLs. Fix .env and restart.");
        process.exit(1);
    }
}

module.exports = { validateEnv, assertEnvOrExit };
