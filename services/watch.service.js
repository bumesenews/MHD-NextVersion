const requestService = require("./request.service");
const cacheService = require("./cache.service");
const { extractStreamsFromHtml } = require("../utils/extract-video");
const { buildCacheKey } = require("../utils/cache-key");
const { WATCH_TTL } = require("../constants/cache");
const logger = require("../utils/logger");

/**
 * Watch page extractor – returns mp4 / m3u8 stream URLs.
 */
class WatchService {
    /**
     * @param {object} config watch.config.js
     * @param {string} videoPageUrl full video page URL from client
     * @returns {Promise<Array<{ title: string, img: null, url: string }>>}
     */
    async extractStreams(config, videoPageUrl) {
        const cacheKey = buildCacheKey(config.name, { url: videoPageUrl });

        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        logger.info("Extracting watch streams", { videoPageUrl });

        const { data: html } = await requestService.fetch(videoPageUrl, {
            headers: config.headers,
        });

        const streams = extractStreamsFromHtml(html, config.video);

        if (!streams.length) {
            throw new Error("No mp4 or m3u8 streams found on the watch page.");
        }

        cacheService.set(cacheKey, streams, WATCH_TTL);
        return streams;
    }
}

module.exports = new WatchService();
