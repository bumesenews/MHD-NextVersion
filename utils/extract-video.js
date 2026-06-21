const { toAbsoluteUrl } = require("./helpers");

/**
 * Map a JSON API video object to { title, img, url } using config mapping.
 * @param {object} item
 * @param {object} mapping
 * @param {string} baseUrl
 * @returns {{ title: string, img: string|null, url: string }|null}
 */
function mapJsonVideoItem(item, mapping, baseUrl) {
    const title = item[mapping.title] || item[mapping.titleFallback] || "";
    const img =
        item[mapping.img] ||
        item[mapping.imgFallback] ||
        item[mapping.imgFallback2] ||
        null;

    let url = null;

    if (mapping.urlBuilder === "xvideos-json") {
        const eid = item[mapping.urlIdField];
        const pathField = item[mapping.urlPathField];

        if (pathField && String(pathField).includes("/video.")) {
            url = toAbsoluteUrl(baseUrl, pathField);
        } else if (eid) {
            const slug = String(pathField || "")
                .split("/")
                .pop();
            url = `${baseUrl.replace(/\/$/, "")}/video.${eid}/${slug || "_"}`;
        }
    } else if (mapping.urlField) {
        url = toAbsoluteUrl(baseUrl, item[mapping.urlField]);
    }

    if (!title || !url) return null;

    return { title, img, url };
}

/**
 * Extract mp4 / m3u8 stream URLs from watch page HTML using regex patterns.
 * @param {string} html
 * @param {object} videoConfig
 * @returns {Array<{ title: string, img: null, url: string }>}
 */
function extractStreamsFromHtml(html, videoConfig) {
    const streams = [];
    const seen = new Set();

    for (const pattern of videoConfig.patterns || []) {
        const regex = new RegExp(pattern.regex, pattern.flags || "gi");
        let match;

        while ((match = regex.exec(html)) !== null) {
            const url = match[pattern.group || 1];
            if (!url || seen.has(url)) continue;
            seen.add(url);

            streams.push({
                title: pattern.label || pattern.type || "stream",
                img: null,
                url,
            });
        }
    }

    return streams;
}

/**
 * Extract a balanced JSON array that follows a marker in page HTML/JS.
 * @param {string} html
 * @param {string} marker
 * @returns {any[]|null}
 */
function extractJsonArrayAfterMarker(html, marker) {
    const idx = html.indexOf(marker);
    if (idx === -1) return null;

    const start = html.indexOf("[", idx);
    if (start === -1) return null;

    let depth = 0;
    for (let i = start; i < html.length; i += 1) {
        const char = html[i];
        if (char === "[") depth += 1;
        else if (char === "]") {
            depth -= 1;
            if (depth === 0) {
                try {
                    const parsed = JSON.parse(html.slice(start, i + 1));
                    return Array.isArray(parsed) ? parsed : null;
                } catch {
                    return null;
                }
            }
        }
    }

    return null;
}

/**
 * Parse related videos embedded in xvideos watch page JavaScript.
 * @param {string} html
 * @param {object} jsonMapping
 * @param {string} baseUrl
 * @returns {Array<{ title: string, img: string|null, url: string }>}
 */
function extractRelatedFromHtml(html, jsonMapping, baseUrl) {
    const markers = [
        "video_related=",
        "setRelatedVideos(",
        '"related_videos":',
        "related_videos=",
    ];

    for (const marker of markers) {
        const rawItems = extractJsonArrayAfterMarker(html, marker);
        if (!rawItems?.length) continue;

        const items = [];
        for (const raw of rawItems) {
            const mapped = mapJsonVideoItem(raw, jsonMapping, baseUrl);
            if (mapped) items.push(mapped);
        }

        if (items.length > 0) return items;
    }

    return [];
}

module.exports = {
    mapJsonVideoItem,
    extractStreamsFromHtml,
    extractRelatedFromHtml,
};
