/**
 * Myanmar search listing – https://www.xvideos.com/?k=myanmar
 * Pagination: page 1 = /?k=myanmar, page 2+ = /?k=myanmar&p={page-1}
 */
module.exports = {
    name: "myanmar",
    baseUrl: process.env.MYANMAR_BASE_URL || "https://www.xvideos.com",
    listPath: process.env.MYANMAR_LIST_PATH || "/?k=myanmar",

    headers: {
        Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
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

    pagination: {
        type: "query",
        startPage: 1,
        buildPath: (listPath, page) => {
            if (page <= 1) return listPath;
            const separator = listPath.includes("?") ? "&" : "?";
            return `${listPath}${separator}p=${page - 1}`;
        },
    },

    responseType: "html",
};
