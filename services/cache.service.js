const NodeCache = require("node-cache");
const { DEFAULT_TTL } = require("../constants/cache");
const logger = require("../utils/logger");

/**
 * In-memory cache – suitable for single-instance VPS deployment.
 * TTL defaults to 8 hours (28800 s).
 */
class CacheService {
    constructor() {
        this.cache = new NodeCache({
            stdTTL: DEFAULT_TTL,
            checkperiod: 600,
            useClones: false,
        });

        this.cache.on("expired", (key) => {
            logger.info("Cache expired", { key });
        });
    }

    /**
     * @param {string} key
     * @returns {any|null}
     */
    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Treat cached empty arrays as miss (e.g. prior failed JSON parse)
            if (Array.isArray(value) && value.length === 0) {
                logger.info("Cache skip empty", { key });
                return null;
            }
            logger.info("Cache hit", { key });
            return value;
        }
        logger.info("Cache miss", { key });
        return null;
    }

    /**
     * @param {string} key
     * @param {any} value
     * @param {number} [ttl]
     */
    set(key, value, ttl) {
        this.cache.set(key, value, ttl || DEFAULT_TTL);
    }

    /** @returns {object} */
    stats() {
        return this.cache.getStats();
    }
}

module.exports = new CacheService();
