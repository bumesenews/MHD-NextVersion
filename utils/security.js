/**
 * Security helpers – SSRF protection and URL normalization.
 */

const DEFAULT_ALLOWED_HOSTS = [
    "www.xvideos.com",
    "xvideos.com",
    "www.xvideos2.com",
    "xvideos2.com",
    "www.xvideos3.com",
    "xvideos3.com",
];

/**
 * Hostnames allowed for outbound scrape requests (comma-separated in .env).
 * @returns {Set<string>}
 */
function getAllowedHosts() {
    const raw = process.env.ALLOWED_SCRAPE_HOSTS || "";
    const hosts = raw
        .split(",")
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean);

    return new Set(hosts.length ? hosts : DEFAULT_ALLOWED_HOSTS);
}

/**
 * Decode and trim a URL from query string.
 * @param {string} value
 * @returns {string|null}
 */
function normalizeUrlParam(value) {
    if (!value || typeof value !== "string") return null;

    let decoded = value.trim();
    try {
        decoded = decodeURIComponent(decoded);
    } catch {
        // use raw value
    }
    return decoded.trim() || null;
}

/**
 * Block private / local targets (SSRF).
 * @param {string} hostname
 * @returns {boolean}
 */
function isBlockedHost(hostname) {
    const host = hostname.toLowerCase();

    if (
        host === "localhost" ||
        host.endsWith(".local") ||
        host === "0.0.0.0"
    ) {
        return true;
    }

    if (host === "::1" || host.startsWith("127.")) return true;

    // Private IPv4 ranges
    if (/^10\./.test(host)) return true;
    if (/^192\.168\./.test(host)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;

    return false;
}

/**
 * Validate URL for scraping – HTTPS/HTTP, allowed host, no SSRF.
 * @param {string} url
 * @returns {{ valid: boolean, url?: string, error?: string }}
 */
function validateScrapeUrl(url) {
    const normalized = normalizeUrlParam(url);
    if (!normalized) {
        return { valid: false, error: "URL is required." };
    }

    let parsed;
    try {
        parsed = new URL(normalized);
    } catch {
        return { valid: false, error: "URL format is invalid." };
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { valid: false, error: "Only http and https URLs are allowed." };
    }

    if (isBlockedHost(parsed.hostname)) {
        return { valid: false, error: "Target host is not allowed." };
    }

    const allowed = getAllowedHosts();
    if (!allowed.has(parsed.hostname.toLowerCase())) {
        return {
            valid: false,
            error: `Host '${parsed.hostname}' is not in the allowed scrape list.`,
        };
    }

    return { valid: true, url: parsed.href };
}

/**
 * Optional API key check when API_KEY is set in environment.
 * @param {import('express').Request} req
 * @returns {boolean}
 */
function isAuthorized(req) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return true;

    const provided =
        req.headers["x-api-key"] ||
        req.headers["authorization"]?.replace(/^Bearer\s+/i, "");

    return provided === apiKey;
}

module.exports = {
    getAllowedHosts,
    normalizeUrlParam,
    validateScrapeUrl,
    isAuthorized,
};
