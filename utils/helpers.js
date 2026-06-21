/**
 * Shared helper utilities.
 */

/**
 * Parse page query param (1-based) into a safe integer >= 1.
 * @param {string|number|undefined} value
 * @returns {number}
 */
function parsePage(value) {
    const page = parseInt(value, 10);
    return Number.isFinite(page) && page >= 1 ? page : 1;
}

/**
 * Convert 1-based UI page to 0-based scraper index when needed.
 * @param {number} page
 * @returns {number}
 */
function toZeroBasedPage(page) {
    return Math.max(0, page - 1);
}

/**
 * Build absolute URL from base + relative path.
 * @param {string} baseUrl
 * @param {string|null|undefined} path
 * @returns {string|null}
 */
function toAbsoluteUrl(baseUrl, path) {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const base = baseUrl.replace(/\/$/, "");
    const rel = path.startsWith("/") ? path : `/${path}`;
    return `${base}${rel}`;
}

/**
 * Validate that a string is a usable HTTP(S) URL.
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

/**
 * Strip count suffix from tag labels e.g. "amateur 64,319" -> "amateur".
 * @param {string} text
 * @returns {string}
 */
function stripCountSuffix(text) {
    return String(text || "")
        .replace(/\s[\d,]+$/, "")
        .trim();
}

/**
 * Extract xvideos video eid from a watch page URL.
 * e.g. /video.ooltike3264/slug -> ooltike3264
 * @param {string} url
 * @returns {string|null}
 */
function extractVideoEid(url) {
    try {
        const match = new URL(url).pathname.match(/\/video\.([^/?#]+)/i);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

module.exports = {
    parsePage,
    toZeroBasedPage,
    toAbsoluteUrl,
    isValidUrl,
    stripCountSuffix,
    extractVideoEid,
};
