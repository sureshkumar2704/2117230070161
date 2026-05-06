const axios = require("axios");
const Log = require("../middleware/logger");
const config = require("../config/config");
const { DEFAULT_HEADERS } = require("../utils/constants");

/**
 * Send multiple logs in a batch (for performance optimization)
 * @param {array} logs - Array of log objects with stack, level, package, message
 * @returns {Promise<array>} - Array of responses from logging API
 */
async function logBatch(logs) {
    try {
        const responses = [];

        for (const log of logs) {
            const payload = {
                stack: log.stack,
                level: log.level,
                package: log.package,
                message: log.message,
                timestamp: new Date().toISOString(),
                environment: config.app.environment
            };

            try {
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

                responses.push({
                    success: true,
                    data: response.data
                });
            } catch (error) {
                responses.push({
                    success: false,
                    error: error.message
                });
            }
        }

        return responses;
    } catch (error) {
        console.error("❌ Batch logging failed:", error.message);
        throw error;
    }
}

/**
 * Log a single message
 * @param {string} stack - Stack type
 * @param {string} level - Log level
 * @param {string} packageName - Package name
 * @param {string} message - Log message
 * @returns {Promise<object>} - Response from logging API
 */
async function logMessage(stack, level, packageName, message) {
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

module.exports = {
    logBatch,
    logMessage
};
