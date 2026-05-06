const axios = require("axios");
const config = require("../config/config");
const { LOG_LEVELS, STACK_TYPES, DEFAULT_HEADERS } = require("../utils/constants");

/**
 * Send a log entry to the logging API
 * @param {string} stack - Stack type ("backend" or "frontend")
 * @param {string} level - Log level (debug, info, warn, error, fatal)
 * @param {string} packageName - Package/module name
 * @param {string} message - Log message
 * @returns {Promise<object>} - Response from logging API
 */
async function Log(stack, level, packageName, message) {
    try {
        const payload = {
            stack,
            level,
            package: packageName,
            message,
            timestamp: new Date().toISOString(),
            environment: config.app.environment
        };

        const response = await axios.post(
            config.apis.logs.url,
            payload,
            {
                headers: {
                    ...DEFAULT_HEADERS,
                    "Authorization": `Bearer ${config.auth.token}`
                }
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error("❌ Logging failed:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = Log;
