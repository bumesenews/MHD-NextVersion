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
        const slug = String(item[mapping.urlPathField] || "")
            .split("/")
            .pop();
        const eid = item[mapping.urlIdField];
        url = eid
            ? `${baseUrl.replace(/\/$/, "")}/video.${eid}/${slug || "_"}`
            : null;
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

module.exports = { mapJsonVideoItem, extractStreamsFromHtml };
