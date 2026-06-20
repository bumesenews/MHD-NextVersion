const axios = require("axios");

const DEFAULT_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
};

/**
 * HTTP client wrapper – all outbound scrape requests go through here.
 */
class RequestService {
    constructor() {
        this.timeout = parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000;
    }

    /**
     * @param {string} url
     * @param {object} config headers + responseType overrides
     * @returns {Promise<{ data: any, contentType: string }>}
     */
    async fetch(url, config = {}) {
        const response = await axios.get(url, {
            timeout: this.timeout,
            headers: {
                ...DEFAULT_HEADERS,
                ...config.headers,
            },
            responseType: config.responseType || "text",
            validateStatus: (status) => status >= 200 && status < 400,
        });

        let data = response.data;

        // Axios may return JSON endpoints as string when responseType is text
        if (typeof data === "string" && data.trim().startsWith("{")) {
            try {
                data = JSON.parse(data);
            } catch {
                // keep raw string
            }
        }

        return {
            data,
            contentType: response.headers["content-type"] || "",
        };
    }
}

module.exports = new RequestService();
