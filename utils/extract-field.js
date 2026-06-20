const { toAbsoluteUrl } = require("./helpers");

/**
 * Extract a field value from a cheerio element using config-driven rules.
 *
 * Config shape:
 * {
 *   selector: ".title a",
 *   attr: "text" | "href" | "src" | "data-src" | ...,
 *   attrs: ["data-src", "src"],   // fallback chain
 *   absolute: true,               // prepend baseUrl for href/src
 *   regex: { pattern: "...", group: 1 }  // apply to result
 * }
 *
 * @param {import('cheerio').CheerioAPI} $
 * @param {import('cheerio').Cheerio} element
 * @param {object} fieldConfig
 * @param {string} baseUrl
 * @returns {string|null}
 */
function extractField($, element, fieldConfig, baseUrl) {
    if (!fieldConfig) return null;

    const target = fieldConfig.selector
        ? element.find(fieldConfig.selector).first()
        : element;

    if (!target.length) return null;

    let value = null;

    if (fieldConfig.attr === "text") {
        value = target.text().replace(/\s+/g, " ").trim();
    } else if (fieldConfig.attrs && Array.isArray(fieldConfig.attrs)) {
        for (const attr of fieldConfig.attrs) {
            value = target.attr(attr);
            if (value) break;
        }
    } else if (fieldConfig.attr) {
        value = target.attr(fieldConfig.attr);
    }

    // Script-based extraction (e.g. profile/channel thumbnails)
    if (!value && fieldConfig.fromScript) {
        value = extractFromScript(element, fieldConfig.fromScript);
    }

    if (!value) return null;

    if (fieldConfig.absolute) {
        value = toAbsoluteUrl(baseUrl, value);
    }

    if (fieldConfig.regex) {
        const match = String(value).match(new RegExp(fieldConfig.regex.pattern));
        if (match) {
            value = match[fieldConfig.regex.group || 1] || null;
        }
    }

    if (fieldConfig.transform && typeof fieldConfig.transform === "function") {
        value = fieldConfig.transform(value);
    }

    return value || null;
}

/**
 * Extract value from inline <script> inside an item card.
 * @param {import('cheerio').Cheerio} element
 * @param {object} scriptConfig
 * @returns {string|null}
 */
function extractFromScript(element, scriptConfig) {
    const scriptContent = element.find("script").html();
    if (!scriptContent) return null;

    if (scriptConfig.imgRegex) {
        const match = scriptContent.match(new RegExp(scriptConfig.imgRegex));
        if (match) return match[1];
    }

    if (scriptConfig.dataVideosRegex) {
        const jsonMatch = scriptContent.match(
            new RegExp(scriptConfig.dataVideosRegex)
        );
        if (jsonMatch) {
            try {
                const json = JSON.parse(jsonMatch[1]);
                if (json.length > 0 && json[0].img) {
                    return json[0].img.replace(/\\\//g, "/");
                }
            } catch {
                return null;
            }
        }
    }

    return null;
}

module.exports = { extractField, extractFromScript };
