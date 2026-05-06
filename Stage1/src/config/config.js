require('dotenv').config();

const config = {
    // API Configuration
    apis: {
        logs: {
            url: process.env.LOGS_API_URL || "http://20.207.122.201/evaluation-service/logs",
        },
        notifications: {
            url: process.env.NOTIFICATIONS_API_URL || "http://20.207.122.201/evaluation-service/notifications",
        }
    },

    // Authentication
    auth: {
        token: process.env.BEARER_TOKEN || "YOUR_BEARER_TOKEN"
    },

    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost'
    },

    // Application Settings
    app: {
        name: "Campus Notification System",
        version: "1.0.0",
        topNotificationsCount: 10,
        environment: process.env.NODE_ENV || "development"
    }
};

module.exports = config;
