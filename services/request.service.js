const axios = require("axios");

const DEFAULT_HEADERS = {
    "User-Agent":
        process.env.SCRAPE_USER_AGENT ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    DNT: "1",
    "Upgrade-Insecure-Requests": "1",
};

/**
 * HTTP client wrapper – all outbound scrape requests go through here.
 */
class RequestService {
    constructor() {
        this.timeout = parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000;
        this.retries = parseInt(process.env.REQUEST_RETRY_COUNT, 10) || 2;
    }

    /**
     * @param {string} url
     * @param {object} config headers + responseType overrides
     * @returns {Promise<{ data: any, contentType: string }>}
     */
    async fetch(url, config = {}) {
        let lastError;

        for (let attempt = 0; attempt <= this.retries; attempt += 1) {
            try {
                const response = await axios.get(url, {
                    timeout: this.timeout,
                    maxRedirects: 5,
                    headers: {
                        ...DEFAULT_HEADERS,
                        ...(process.env.SCRAPE_COOKIE
                            ? { Cookie: process.env.SCRAPE_COOKIE }
                            : {}),
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
            } catch (error) {
                lastError = error;

                const status = error.response?.status;
                const retryable = status === 403 || status === 429 || status >= 500;
                const canRetry = attempt < this.retries;

                if (!retryable || !canRetry) {
                    break;
                }

                const delayMs = 500 * (attempt + 1);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
        throw lastError;
    }
}

module.exports = new RequestService();
