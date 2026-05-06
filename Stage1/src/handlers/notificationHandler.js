const fetchNotifications = require("../services/notificationService");
const Log = require("../middleware/logger");
const config = require("../config/config");

const WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

async function handleNotifications(count = 10) {
    try {
        const topCount = (count >= 5 && count <= 100) ? count : 10;

        await Log("backend", "info", "handler", `Application started (requesting top ${topCount})`);

        const notifications = await fetchNotifications();
        if (!notifications || notifications.length === 0) {
            console.log("\n⚠️  No notifications available\n");
            return;
        }

        const sorted = notifications.sort((a, b) => {
            const weightDiff = (WEIGHTS[b.Type] || 0) - (WEIGHTS[a.Type] || 0);
            if (weightDiff !== 0) return weightDiff;
            return new Date(b.Timestamp) - new Date(a.Timestamp);
        });

        const top = sorted.slice(0, topCount);

        console.log("\n" + "=".repeat(60));
        console.log(`  TOP ${top.length} PRIORITY NOTIFICATIONS`);
        console.log("=".repeat(60) + "\n");

        top.forEach((n, i) => {
            console.log(`${i + 1}.\n   Type: ${n.Type}\n   Message: ${n.Message}\n   Timestamp: ${n.Timestamp}\n   ID: ${n.ID}\n   ` + "-".repeat(50));
        });

        console.log("\n" + "=".repeat(60) + "\n");

        await Log("backend", "info", "handler", `Top ${top.length} notifications displayed successfully`);
    } catch (error) {
        await Log("backend", "fatal", "handler", `Application error: ${error.message}`);
        console.error("\n❌ Error:", error.message, "\n");
        throw error;
    }
}

module.exports = { handleNotifications };
