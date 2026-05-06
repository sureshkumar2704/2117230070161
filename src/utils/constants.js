// Notification Types
const NOTIFICATION_TYPES = {
    PLACEMENT: "Placement",
    RESULT: "Result",
    EVENT: "Event"
};

// Log Levels
const LOG_LEVELS = {
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
    FATAL: "fatal"
};

// Stack Types
const STACK_TYPES = {
    BACKEND: "backend",
    FRONTEND: "frontend"
};

// Package Names
const PACKAGE_NAMES = {
    // Backend packages
    CACHE: "cache",
    CONTROLLER: "controller",
    CRON_JOB: "cron_job",
    DB: "db",
    DOMAIN: "domain",
    HANDLER: "handler",
    REPOSITORY: "repository",
    ROUTE: "route",
    SERVICE: "service",

    // Shared packages
    AUTH: "auth",
    CONFIG: "config",
    MIDDLEWARE: "middleware",
    UTILS: "utils"
};

// Priority Weights
const PRIORITY_WEIGHTS = {
    [NOTIFICATION_TYPES.PLACEMENT]: 3,
    [NOTIFICATION_TYPES.RESULT]: 2,
    [NOTIFICATION_TYPES.EVENT]: 1
};

// Default Headers
const DEFAULT_HEADERS = {
    "Content-Type": "application/json"
};

module.exports = {
    NOTIFICATION_TYPES,
    LOG_LEVELS,
    STACK_TYPES,
    PACKAGE_NAMES,
    PRIORITY_WEIGHTS,
    DEFAULT_HEADERS
};
