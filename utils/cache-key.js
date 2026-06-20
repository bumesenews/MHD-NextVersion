const crypto = require("crypto");
const { KEY_PREFIX } = require("../constants/cache");

/**
 * Build a deterministic cache key from endpoint + params.
 * @param {string} namespace e.g. "home", "model-section"
 * @param {Record<string, string|number>} params
 * @returns {string}
 */
function buildCacheKey(namespace, params = {}) {
    const sorted = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&");

    const raw = `${KEY_PREFIX}:${namespace}:${sorted}`;
    const hash = crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
    return `${KEY_PREFIX}:${namespace}:${hash}`;
}

module.exports = { buildCacheKey };
