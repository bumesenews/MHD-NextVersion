/**
 * Global cache constants.
 */
module.exports = {
    /** List/section scrape cache – default 8 hours */
    DEFAULT_TTL: parseInt(process.env.CACHE_TTL, 10) || 28800,
    /** Watch stream URLs (m3u8/mp4) – 3 minutes */
    WATCH_TTL: parseInt(process.env.WATCH_CACHE_TTL, 10) || 180,
    KEY_PREFIX: "scraper",
};
