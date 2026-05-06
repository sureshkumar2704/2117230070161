const fetchNotifications = require("../services/notificationService");
const { getTopNotifications } = require("../utils/notificationSorter");
const Log = require("../middleware/logger");
const config = require("../config/config");

/**
 * Display formatted notification
 * @param {object} notification - Notification object
 * @param {number} index - Display index
 */
function displayNotification(notification, index) {
    console.log(`${index + 1}.`);
    console.log(`   Type:      ${notification.Type}`);
    console.log(`   Message:   ${notification.Message}`);
    console.log(`   Timestamp: ${notification.Timestamp}`);
    console.log(`   ID:        ${notification.ID}`);
    console.log("   " + "-".repeat(50));
}

/**
 * Handle the entire notification processing workflow
 * 1. Log application start
 * 2. Fetch notifications from API
 * 3. Sort by priority
 * 4. Select top 10
 * 5. Display results
 * 6. Log completion
 */
async function handleNotifications() {
    try {
        // Log application start
        await Log(
            "backend",
            "info",
            "handler",
            `${config.app.name} - Application started`
        );

        // Fetch notifications
        const notifications = await fetchNotifications();

        if (!notifications || notifications.length === 0) {
            console.log("\n⚠️  No notifications available\n");
            await Log(
                "backend",
                "warn",
                "handler",
                "No notifications found in API response"
            );
            return;
        }

        // Get top notifications
        const topNotifications = getTopNotifications(
            notifications,
            config.app.topNotificationsCount
        );

        // Display results
        console.log("\n" + "=".repeat(60));
        console.log(`  TOP ${topNotifications.length} PRIORITY NOTIFICATIONS`);
        console.log("=".repeat(60) + "\n");

        topNotifications.forEach((notification, index) => {
            displayNotification(notification, index);
        });

        console.log("\n" + "=".repeat(60) + "\n");

        // Log completion
        await Log(
            "backend",
            "info",
            "handler",
            `Top ${topNotifications.length} notifications displayed successfully`
        );

        return topNotifications;
    } catch (error) {
        // Log fatal error
        await Log(
            "backend",
            "fatal",
            "handler",
            `Application error: ${error.message}`
        );

        console.error("\n❌ Error:", error.message, "\n");
        throw error;
    }
}

module.exports = {
    handleNotifications,
    displayNotification
};
