# Campus Notification System - Stage 1

A Node.js application that fetches campus notifications from an API, prioritizes them based on type and recency, and displays the top 10 most important notifications.

## 📁 Project Structure

```
campus-notification-system/
├── src/
│   ├── config/
│   │   └── config.js              # Centralized configuration
│   ├── middleware/
│   │   └── logger.js              # Logging middleware for API calls
│   ├── services/
│   │   ├── notificationService.js # Fetch notifications from API
│   │   └── logService.js          # Batch logging service
│   ├── utils/
│   │   ├── constants.js           # Constants and enums
│   │   ├── priorityCalculator.js  # Weight calculation logic
│   │   └── notificationSorter.js  # Sorting and ranking logic
│   ├── handlers/
│   │   └── notificationHandler.js # Main application handler
│   └── index.js                   # Application entry point
├── screenshots/
│   ├── notifications-output.png
│   ├── logs-output.png
│   ├── notifications-api-postman.png
│   └── logs-api-postman.png
├── Notification_System_Design.md  # Design documentation
├── README.md                      # This file
├── package.json                   # Dependencies
├── .env                           # Environment variables
├── .gitignore                     # Git ignore rules
└── node_modules/                  # Dependencies
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:
```
BEARER_TOKEN=your_actual_bearer_token_here
LOGS_API_URL=http://20.207.122.201/evaluation-service/logs
NOTIFICATIONS_API_URL=http://20.207.122.201/evaluation-service/notifications
NODE_ENV=development
```

**Important**: Replace `your_actual_bearer_token_here` with your actual API token.

### 3. Run the Application
```bash
npm start
```

Or directly with Node:
```bash
node src/index.js
```

## 📊 How It Works

### 1. **Configuration** (`src/config/config.js`)
- Centralized management of API endpoints, authentication, and app settings
- Reads from `.env` file for sensitive credentials
- Provides defaults for all settings

### 2. **Constants** (`src/utils/constants.js`)
- Notification types: Placement, Result, Event
- Log levels: debug, info, warn, error, fatal
- Stack types: backend, frontend
- Priority weights for sorting

### 3. **Priority Calculator** (`src/utils/priorityCalculator.js`)
- Calculates weight for each notification type
- Compares notifications based on priority
- Priority = Type Weight (3 > 2 > 1) + Recency (newer first)

### 4. **Notification Sorter** (`src/utils/notificationSorter.js`)
- Sorts notifications by priority using comparator
- Extracts top N notifications from sorted list
- Default: top 10 notifications

### 5. **Logging Middleware** (`src/middleware/logger.js`)
- Posts logs to the external logging API
- Includes timestamp and environment info
- Handles authentication with Bearer token

### 6. **Services**
- **notificationService.js**: Fetches notifications with error handling
- **logService.js**: Batch and single message logging support

### 7. **Notification Handler** (`src/handlers/notificationHandler.js`)
- Orchestrates the entire workflow
- Logs all significant events
- Displays formatted output

### 8. **Entry Point** (`src/index.js`)
- Starts the application
- Handles success/failure exit codes

## 💻 Expected Output

```
============================================================
  TOP 10 PRIORITY NOTIFICATIONS
============================================================

1.
   Type:      Placement
   Message:   CSX Corporation hiring
   Timestamp: 2026-04-22 17:51:18
   ID:        b283218f-ea5a-4b7c-93a9-1f2f240d64b0
   --------------------------------------------------

2.
   Type:      Result
   Message:   mid-sem
   Timestamp: 2026-04-22 17:51:30
   ID:        d146095a-0d86-4a34-9e69-3900a14576bc
   --------------------------------------------------

... (up to 10 notifications)

============================================================
```

## 🔑 API Authentication

Both API endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <YOUR_TOKEN>
```

### Getting a Token

If you don't have a token, use the auth endpoint:
```bash
curl -X POST "http://20.207.122.201/evaluation-service/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "YOUR_USERNAME",
    "password": "YOUR_PASSWORD"
  }'
```

## 📋 API Endpoints

### GET `/evaluation-service/notifications`
Fetch all notifications
- **Auth**: Bearer token required
- **Response**: Array of notification objects with ID, Type, Message, Timestamp

### POST `/evaluation-service/logs`
Create a log entry
- **Auth**: Bearer token required
- **Payload**: 
  ```json
  {
    "stack": "backend",
    "level": "info",
    "package": "service",
    "message": "Descriptive message"
  }
  ```

## 🧪 Testing with Postman

### 1. **Auth Login**
- **Method**: POST
- **URL**: `http://20.207.122.201/evaluation-service/auth/login`
- **Body**:
  ```json
  {
    "username": "YOUR_USERNAME",
    "password": "YOUR_PASSWORD"
  }
  ```

### 2. **Fetch Notifications**
- **Method**: GET
- **URL**: `http://20.207.122.201/evaluation-service/notifications`
- **Header**: `Authorization: Bearer <TOKEN>`

### 3. **Create Log**
- **Method**: POST
- **URL**: `http://20.207.122.201/evaluation-service/logs`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "stack": "backend",
    "level": "error",
    "package": "handler",
    "message": "Test log message"
  }
  ```

## 📝 Logging Events

The application logs these events:

| Event | Level | Package |
|-------|-------|---------|
| Application started | info | handler |
| Fetching notifications | info | service |
| Notifications fetched | info | service |
| Notifications displayed | info | handler |
| Any error | error | service/handler |
| Critical failure | fatal | handler |

## 🔄 Priority Algorithm

**Formula**: `Priority = Type Weight + Recency`

1. **Type Weights** (higher = more important):
   - Placement: 3
   - Result: 2
   - Event: 1

2. **Recency**: Within same type, newer notifications appear first

**Example Sorting**:
```
Input:
- Event (2026-04-22 17:51:06)
- Result (2026-04-22 17:51:30)
- Placement (2026-04-22 17:51:18)
- Placement (2026-04-22 17:51:08)

Output (sorted):
1. Placement (2026-04-22 17:51:18) - Weight 3, newest first
2. Placement (2026-04-22 17:51:08) - Weight 3
3. Result (2026-04-22 17:51:30) - Weight 2
4. Event (2026-04-22 17:51:06) - Weight 1
```

## 🛠️ Development

### Adding New Features
- Update constants in `src/utils/constants.js`
- Add new services in `src/services/`
- Create new handlers in `src/handlers/`
- Update config in `src/config/config.js`

### Error Handling
- All errors are logged to the API
- Graceful fallbacks for API failures
- Console output for debugging

### Performance
- Non-blocking async/await pattern
- Efficient O(n log n) sorting algorithm
- Optional batch logging for high-volume scenarios

## 📚 Documentation

See [Notification_System_Design.md](./Notification_System_Design.md) for:
- Architecture overview
- Component design details
- Data flow diagrams
- Future enhancements
- Deployment checklist

## 📸 Screenshots

- `screenshots/notifications-output.png` - Console output
- `screenshots/logs-output.png` - Logging output
- `screenshots/notifications-api-postman.png` - Postman API test
- `screenshots/logs-api-postman.png` - Postman log API test

## ✅ Next Steps (Stage 2)

- Real-time notification streaming with WebSockets
- User authentication and authorization
- Web UI dashboard for notifications
- Database persistence
- Advanced filtering and search
- Notification preferences per user
- Email/SMS notifications

## 📄 License

ISC

## 🤝 Support

For issues or questions, refer to [Notification_System_Design.md](./Notification_System_Design.md)
