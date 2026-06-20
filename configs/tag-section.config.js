/**
 * Website 3 – Tag section configuration.
 * Parent URL e.g. https://www.xvideos.com/tags/myanmar
 */
module.exports = {
    name: "tag-section",
    baseUrl: process.env.TAGS_BASE_URL || "https://www.xvideos.com",

    headers: {
        Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    },

    parseParentUrl: (parentUrl) => {
        const parsed = new URL(parentUrl);
        const match = parsed.pathname.match(/^\/tags\/([^/]+)/i);

        if (!match) {
            throw new Error(
                "Invalid tag parent URL. Expected /tags/{name}."
            );
        }

        return `/tags/${match[1]}`;
    },

    selectors: {
        item: ".thumb-block",
        title: {
            selector: ".thumb-under .title a",
            attr: "text",
        },
        img: {
            selector: ".thumb img",
            attrs: ["data-src", "src"],
        },
        url: {
            selector: ".title a[href*='/video.'], a[href*='/video.']",
            attr: "href",
            absolute: true,
        },
    },

    /** page 1 = /tags/name, page 2 = /tags/name/1 */
    pagination: {
        type: "pathSuffix",
        startPage: 1,
        buildPath: (tagPath, page) => {
            if (page <= 1) return tagPath;
            return `${tagPath}/${page - 1}`;
        },
    },

    responseType: "html",
};
