/**
 * Website 2 – Model section configuration.
 * Flutter sends the parent profile URL; scraper derives JSON API path from it.
 * Do NOT generate section URLs in the API – only scrape the provided parent URL.
 */
module.exports = {
    name: "model-section",
    baseUrl: process.env.MODELS_BASE_URL || "https://www.xvideos.com",

    headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
    },

    /**
     * Parse parent URL from Flutter into API path segment.
     * e.g. https://www.xvideos.com/amateurs/jenny -> /amateurs/jenny
     */
    parseParentUrl: (parentUrl) => {
        const parsed = new URL(parentUrl);
        const match = parsed.pathname.match(
            /^\/(?:amateurs|profiles|models|pornstars|channels|amateur-channels)\/([^/?#]+)/i
        );

        if (!match) {
            throw new Error(
                "Invalid model parent URL. Expected /amateurs/{name}, /profiles/{name}, etc."
            );
        }

        // Preserve path type: /amateurs/x, /profiles/x, /pornstars/x, etc.
        const segment = parsed.pathname.match(
            /^(\/(?:amateurs|profiles|models|pornstars|channels|amateur-channels)\/[^/?#]+)/i
        );

        if (!segment) {
            throw new Error(
                "Invalid model parent URL. Expected /amateurs/{name}, /profiles/{name}, etc."
            );
        }

        return segment[1];
    },

    /** JSON API pagination – page 1 maps to API index 0 */
    pagination: {
        type: "jsonApi",
        startPage: 1,
        sort: "best",
        buildPath: (profilePath, page, sort) =>
            `${profilePath}/videos/${sort}/${page - 1}`,
        totalPagesField: "nb_videos",
        perPageField: "nb_per_page",
        itemsField: "videos",
    },

    jsonMapping: {
        title: "t",
        titleFallback: "tf",
        img: "i",
        imgFallback: "il",
        imgFallback2: "if",
        urlBuilder: "xvideos-json",
        urlIdField: "eid",
        urlPathField: "u",
    },

    responseType: "json",
};
