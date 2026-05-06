const { compareNotifications } = require('./priorityCalculator');

/**
 * Sort notifications by priority
 * Priority calculation: Type Weight (Placement > Result > Event) + Recency (newer first)
 * @param {array} notifications - Array of notification objects
 * @returns {array} - Sorted array of notifications
 */
function sortNotifications(notifications) {
    if (!Array.isArray(notifications)) {
        throw new Error("Invalid input: notifications must be an array");
    }

    return notifications.sort(compareNotifications);
}

/**
 * Get top N notifications from sorted list
 * @param {array} notifications - Array of notification objects
 * @param {number} count - Number of notifications to return (default: 10)
 * @returns {array} - Top N notifications
 */
function getTopNotifications(notifications, count = 10) {
    if (!Array.isArray(notifications)) {
        throw new Error("Invalid input: notifications must be an array");
    }

    const sorted = sortNotifications(notifications);
    return sorted.slice(0, Math.min(count, sorted.length));
}

module.exports = {
    sortNotifications,
    getTopNotifications
};
