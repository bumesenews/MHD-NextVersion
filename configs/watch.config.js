/**
 * Watch page stream extraction configuration.
 * Works across all sites that embed xvideos-style player scripts.
 */
module.exports = {
    name: "watch",
    baseUrl: process.env.WATCH_BASE_URL || "https://www.xvideos.com",

    headers: {
        Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        Referer: process.env.WATCH_REFERER || "https://www.xvideos.com/",
    },

    /** Regex patterns to pull mp4 / m3u8 URLs from player JS */
    video: {
        patterns: [
            {
                label: "m3u8",
                type: "m3u8",
                regex: "html5player\\.setVideoHLS\\s*\\(\\s*['\"](https?:\\/\\/[^'\"]+\\.m3u8[^'\"]*)['\"]",
                flags: "gi",
                group: 1,
            },
            {
                label: "mp4-high",
                type: "mp4",
                regex: "setVideoUrlHigh\\s*\\(\\s*['\"](https?:\\/\\/[^'\"]+)['\"]",
                flags: "gi",
                group: 1,
            },
            {
                label: "mp4-low",
                type: "mp4",
                regex: "setVideoUrlLow\\s*\\(\\s*['\"](https?:\\/\\/[^'\"]+)['\"]",
                flags: "gi",
                group: 1,
            },
            {
                label: "mp4-default",
                type: "mp4",
                regex: "setVideoUrl\\s*\\(\\s*['\"](https?:\\/\\/[^'\"]+)['\"]",
                flags: "gi",
                group: 1,
            },
        ],
    },

    responseType: "watch",
};
