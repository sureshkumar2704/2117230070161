const axios = require("axios");
const Log = require("../middleware/logger");
const config = require("../config/config");
const { DEFAULT_HEADERS } = require("../utils/constants");

/**
 * Fetch all notifications from the API
 * @returns {Promise<array>} - Array of notification objects
 */
async function fetchNotifications() {
    try {
        await Log(
            "backend",
            "info",
            "service",
            "Fetching notifications from API"
        );

        const response = await axios.get(
            config.apis.notifications.url,
            {
                headers: {
                    ...DEFAULT_HEADERS,
                    "Authorization": `Bearer ${config.auth.token}`
                }
            }
        );

        const notificationCount = response.data.notifications?.length || 0;
        await Log(
            "backend",
            "info",
            "service",
            `Notifications fetched successfully (${notificationCount} total)`
        );

        return response.data.notifications || [];
    } catch (error) {
        await Log(
            "backend",
            "error",
            "service",
            `Failed to fetch notifications: ${error.message}`
        );

        throw error;
    }
}

module.exports = fetchNotifications;
