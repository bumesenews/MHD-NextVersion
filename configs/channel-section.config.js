/**
 * Website 4 – Channel section configuration.
 * Parent URL e.g. https://www.xvideos.com/myanma_porn
 */
module.exports = {
    name: "channel-section",
    baseUrl: process.env.CHANNELS_BASE_URL || "https://www.xvideos.com",

    headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
    },

    parseParentUrl: (parentUrl) => {
        const parsed = new URL(parentUrl);
        const path = parsed.pathname.replace(/\/$/, "");

        const channelMatch = path.match(/^\/channels\/([^/]+)$/i);
        if (channelMatch) {
            return `/channels/${channelMatch[1]}`;
        }

        const directMatch = path.match(/^\/([^/]+)$/i);
        if (directMatch && directMatch[1] !== "channels-index") {
            return `/channels/${directMatch[1]}`;
        }

        throw new Error(
            "Invalid channel parent URL. Expected /myanma_porn or /channels/{name}."
        );
    },

    pagination: {
        type: "jsonApi",
        startPage: 1,
        sort: "best",
        buildPath: (channelPath, page, sort) =>
            `${channelPath}/videos/${sort}/${page - 1}`,
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
