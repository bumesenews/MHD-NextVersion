/**
 * Simple structured logger for production use.
 */
const logger = {
    info(message, meta = {}) {
        console.log(
            JSON.stringify({
                level: "info",
                time: new Date().toISOString(),
                message,
                ...meta,
            })
        );
    },

    warn(message, meta = {}) {
        console.warn(
            JSON.stringify({
                level: "warn",
                time: new Date().toISOString(),
                message,
                ...meta,
            })
        );
    },

    error(message, meta = {}) {
        console.error(
            JSON.stringify({
                level: "error",
                time: new Date().toISOString(),
                message,
                ...meta,
            })
        );
    },
};

module.exports = logger;
