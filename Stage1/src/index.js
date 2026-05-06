const { handleNotifications } = require('./handlers/notificationHandler');
const { startServer } = require('./server');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

/**
 * Display usage information
 */
function showUsage() {
    console.log("\n📖 Usage:");
    console.log("   npm start                  - Run CLI with default (10 notifications)");
    console.log("   npm run server             - Start HTTP API server on port 3000");
    console.log("   node src/index.js 10       - CLI with 10 notifications");
    console.log("   node src/index.js 15       - CLI with 15 notifications");
    console.log("   node src/index.js 20       - CLI with 20 notifications");
    console.log("   node src/index.js server   - Start server mode\n");
}

// Determine execution mode
if (command === 'server' || process.env.RUN_MODE === 'server') {
    // Start HTTP API Server
    const port = process.env.PORT || 3000;
    startServer(port);
} else if (command === '--help' || command === '-h') {
    // Show help
    showUsage();
} else {
    // CLI Mode: Run with specified count or default
    let count = 10;
    
    // Check if command is a number
    if (command && !isNaN(parseInt(command))) {
        count = parseInt(command);
    }
    
    const notificationCount = count >= 5 && count <= 100 ? count : 10;
    
    console.log(`\n💻 Running in CLI mode with ${notificationCount} notifications\n`);
    
    handleNotifications(notificationCount)
        .then(() => {
            console.log("\n✅ Application completed successfully\n");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ Application failed:", error.message, "\n");
            process.exit(1);
        });
}

