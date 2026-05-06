const http = require('http');
const url = require('url');
const config = require('./config/config');
const Log = require('./middleware/logger');
const fetchNotifications = require('./services/notificationService');

const WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

function parseQueryParams(queryString) {
    const params = {};
    if (!queryString) return params;
    queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
}

function sendJSON(response, statusCode, data) {
    response.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    response.end(JSON.stringify(data, null, 2));
}

function handleOptions(response) {
    response.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    response.end();
}

/**
 * Main request handler
 * @param {object} request - HTTP request object
 * @param {object} response - HTTP response object
 */
async function requestHandler(request, response) {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        handleOptions(response);
        return;
    }

    try {
        // Root endpoint
        if (pathname === '/' && request.method === 'GET') {
            await Log("backend", "info", "route", "Root endpoint accessed");

            sendJSON(response, 200, {
                success: true,
                message: `${config.app.name} - HTTP API Server`,
                version: config.app.version,
                endpoints: {
                    notifications: "/api/notifications?limit=10",
                    topNotifications: "/api/notifications/top/20",
                    health: "/api/health",
                    stats: "/api/stats"
                }
            });
            return;
        }

        // Health endpoint
        if (pathname === '/api/health' && request.method === 'GET') {
            await Log("backend", "debug", "route", "Health check requested");

            sendJSON(response, 200, {
                success: true,
                status: "API is running",
                timestamp: new Date().toISOString(),
                environment: config.app.environment
            });
            return;
        }

        // Stats endpoint
        if (pathname === '/api/stats' && request.method === 'GET') {
            await Log("backend", "info", "route", "Stats endpoint requested");

            sendJSON(response, 200, {
                success: true,
                stats: {
                    serviceName: config.app.name,
                    version: config.app.version,
                    environment: config.app.environment,
                    allowedLimits: {
                        min: 5,
                        max: 100,
                        default: 10
                    },
                    endpoints: [
                        "GET /api/notifications?limit=10",
                        "GET /api/notifications?limit=15",
                        "GET /api/notifications?limit=20",
                        "GET /api/notifications/top/10",
                        "GET /api/notifications/top/15",
                        "GET /api/notifications/top/20",
                        "GET /api/health",
                        "GET /api/stats"
                    ]
                }
            });
            return;
        }

        // Notifications endpoint with query parameter
        if (pathname === '/api/notifications' && request.method === 'GET') {
            let limit = parseInt(query.limit) || 10;

            // Validate limit
            if (limit < 5 || limit > 100) {
                limit = 10;
            }

            await Log(
                "backend",
                "info",
                "route",
                `API request: GET /api/notifications?limit=${limit}`
            );

            const notifications = await fetchNotifications();

            if (!notifications || notifications.length === 0) {
                await Log("backend", "warn", "route", "No notifications found");

                sendJSON(response, 200, {
                    success: true,
                    data: [],
                    meta: {
                        total: 0,
                        returned: 0,
                        limit: limit,
                        message: "No notifications available"
                    }
                });
                return;
            }

            const topNotifications = notifications
                .sort((a, b) => {
                    const weightDiff = (WEIGHTS[b.Type] || 0) - (WEIGHTS[a.Type] || 0);
                    if (weightDiff !== 0) return weightDiff;
                    return new Date(b.Timestamp) - new Date(a.Timestamp);
                })
                .slice(0, limit);

            await Log(
                "backend",
                "info",
                "route",
                `Returned ${topNotifications.length} notifications out of ${notifications.length}`
            );

            sendJSON(response, 200, {
                success: true,
                data: topNotifications,
                meta: {
                    total: notifications.length,
                    returned: topNotifications.length,
                    limit: limit,
                    message: `Top ${topNotifications.length} notifications`
                }
            });
            return;
        }

        // Top notifications endpoint with path parameter
        if (pathname.startsWith('/api/notifications/top/') && request.method === 'GET') {
            const count = parseInt(pathname.replace('/api/notifications/top/', ''));

            // Validate count
            if (isNaN(count) || count < 5 || count > 100) {
                sendJSON(response, 400, {
                    success: false,
                    error: "Invalid count parameter",
                    details: "Count must be between 5 and 100",
                    example: "GET /api/notifications/top/20"
                });
                return;
            }

            await Log(
                "backend",
                "info",
                "route",
                `API request: GET /api/notifications/top/${count}`
            );

            const notifications = await fetchNotifications();

            if (!notifications || notifications.length === 0) {
                sendJSON(response, 200, {
                    success: true,
                    data: [],
                    meta: {
                        total: 0,
                        returned: 0,
                        requested: count
                    }
                });
                return;
            }

            const topNotifications = notifications
                .sort((a, b) => {
                    const weightDiff = (WEIGHTS[b.Type] || 0) - (WEIGHTS[a.Type] || 0);
                    if (weightDiff !== 0) return weightDiff;
                    return new Date(b.Timestamp) - new Date(a.Timestamp);
                })
                .slice(0, count);

            await Log(
                "backend",
                "info",
                "route",
                `Returned ${topNotifications.length} out of ${notifications.length} notifications`
            );

            sendJSON(response, 200, {
                success: true,
                data: topNotifications,
                meta: {
                    total: notifications.length,
                    returned: topNotifications.length,
                    requested: count
                }
            });
            return;
        }

        // 404 - Not found
        sendJSON(response, 404, {
            success: false,
            error: "Endpoint not found",
            path: pathname,
            method: request.method,
            availableEndpoints: [
                "GET /",
                "GET /api/notifications?limit=10",
                "GET /api/notifications?limit=15",
                "GET /api/notifications?limit=20",
                "GET /api/notifications/top/10",
                "GET /api/notifications/top/15",
                "GET /api/notifications/top/20",
                "GET /api/health",
                "GET /api/stats"
            ]
        });

    } catch (error) {
        await Log(
            "backend",
            "error",
            "middleware",
            `Server error: ${error.message}`
        );

        sendJSON(response, 500, {
            success: false,
            error: "Internal server error",
            message: error.message
        });
    }
}

/**
 * Start the HTTP server
 */
function startServer(port = 3000) {
    const server = http.createServer(requestHandler);

    server.listen(port, () => {
        console.log("\n" + "=".repeat(70));
        console.log(`🚀 ${config.app.name} - HTTP API Server`);
        console.log("=".repeat(70));
        console.log(`📍 Server running on: http://localhost:${port}`);
        console.log(`🌍 Environment: ${config.app.environment}`);
        console.log("\n📚 Available Endpoints:");
        console.log("   GET  /                                - Root info");
        console.log("   GET  /api/notifications?limit=10     - Get top 10 notifications");
        console.log("   GET  /api/notifications?limit=15     - Get top 15 notifications");
        console.log("   GET  /api/notifications?limit=20     - Get top 20 notifications");
        console.log("   GET  /api/notifications/top/10       - Get exactly 10 notifications");
        console.log("   GET  /api/notifications/top/15       - Get exactly 15 notifications");
        console.log("   GET  /api/notifications/top/20       - Get exactly 20 notifications");
        console.log("   GET  /api/health                     - Health check");
        console.log("   GET  /api/stats                      - Server statistics");
        console.log("\n🔗 Example URLs to test in Postman:");
        console.log("   http://localhost:3000/api/notifications?limit=10");
        console.log("   http://localhost:3000/api/notifications?limit=15");
        console.log("   http://localhost:3000/api/notifications?limit=20");
        console.log("   http://localhost:3000/api/notifications/top/25");
        console.log("   http://localhost:3000/api/health");
        console.log("\n💡 Usage:");
        console.log("   npm run server        - Start the HTTP API server");
        console.log("   npm start             - Run CLI mode (default)");
        console.log("   node src/index.js 10  - CLI mode with 10 notifications");
        console.log("   node src/index.js 20  - CLI mode with 20 notifications");
        console.log("=".repeat(70) + "\n");

        Log(
            "backend",
            "info",
            "handler",
            `API Server started on port ${port}`
        );
    });

    return server;
}

module.exports = { startServer };
