const { PRIORITY_WEIGHTS } = require('./constants');

/**
 * Calculate the weight of a notification based on its type
 * @param {string} type - The notification type (Placement, Result, Event)
 * @returns {number} - The priority weight
 */
function calculateWeight(type) {
    const weight = PRIORITY_WEIGHTS[type];
    return weight !== undefined ? weight : 0;
}

/**
 * Compare two notifications based on priority
 * Priority is determined by: Type Weight (descending) -> Timestamp (newest first)
 * @param {object} notificationA - First notification object
 * @param {object} notificationB - Second notification object
 * @returns {number} - Comparison result for sorting
 */
function compareNotifications(notificationA, notificationB) {
    const weightA = calculateWeight(notificationA.Type);
    const weightB = calculateWeight(notificationB.Type);

    // Sort by weight (descending)
    if (weightA !== weightB) {
        return weightB - weightA;
    }

    // If weights are equal, sort by timestamp (newest first)
    return new Date(notificationB.Timestamp) - new Date(notificationA.Timestamp);
}

module.exports = {
    calculateWeight,
    compareNotifications
};
