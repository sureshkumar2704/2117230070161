const { handleNotifications } = require('./handlers/notificationHandler');

// Run the application
handleNotifications()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error("Application failed:", error);
        process.exit(1);
    });
