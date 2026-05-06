# Campus Notification System Design - Stage 1

## Executive Summary

The Campus Notification System is a priority inbox solution designed to help students stay focused by displaying only the most important notifications first. It addresses the problem of notification overload by implementing intelligent prioritization based on notification type and recency.

## Problem Statement

Students using the campus notification platform receive a high volume of notifications across three categories:
- **Placements**: Job opportunities and hiring announcements
- **Results**: Academic results and grades
- **Events**: Campus events and activities

**Challenge**: Students lose track of important notifications amidst the volume.

**Solution**: Implement a Priority Inbox that displays top 10 most important notifications first.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           Campus Notification System                │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │         Entry Point (src/index.js)          │  │
│  └────────────────┬─────────────────────────────┘  │
│                   │                                  │
│  ┌────────────────▼────────────────┐               │
│  │   Notification Handler           │               │
│  │ (src/handlers/)                 │               │
│  └────────────────┬────────────────┘               │
│                   │                                  │
│      ┌────────────┼────────────┐                    │
│      │            │            │                    │
│  ┌───▼──┐    ┌───▼──┐    ┌───▼──┐                 │
│  │Logger│    │Fetch │    │Sort  │                 │
│  │ API  │    │ API  │    │Utils │                 │
│  └──────┘    └──────┘    └──────┘                 │
│      │            │            │                    │
│      │      ┌─────▼──────┐     │                    │
│      │      │Services &  │     │                    │
│      │      │Middleware  │     │                    │
│      │      └────────────┘     │                    │
│      │                         │                    │
│      └─────────────┬───────────┘                    │
│                    │                                 │
│          ┌─────────▼───────────┐                    │
│          │   Configuration     │                    │
│          │  (src/config/,      │                    │
│          │   src/utils/)       │                    │
│          └─────────────────────┘                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── config/
│   └── config.js              # Centralized configuration management
├── middleware/
│   └── logger.js              # Logging middleware for API communication
├── services/
│   ├── notificationService.js # Fetch notifications from API
│   └── logService.js          # Batch/single logging operations
├── utils/
│   ├── constants.js           # Enums and constants
│   ├── priorityCalculator.js  # Weight calculation logic
│   └── notificationSorter.js  # Sorting algorithm
├── handlers/
│   └── notificationHandler.js # Main business logic orchestrator
└── index.js                   # Application entry point
```

## Component Design

### 1. Configuration Management (`src/config/config.js`)

**Purpose**: Centralized, environment-based configuration

**Features**:
- Loads from `.env` file using dotenv
- Provides sensible defaults
- Manages API endpoints, authentication, and app settings

**Exports**:
```javascript
{
  apis: { logs: { url }, notifications: { url } },
  auth: { token },
  app: { name, version, topNotificationsCount, environment }
}
```

### 2. Constants (`src/utils/constants.js`)

**Purpose**: Single source of truth for allowed values and enums

**Exports**:
```javascript
{
  NOTIFICATION_TYPES: { PLACEMENT, RESULT, EVENT },
  LOG_LEVELS: { DEBUG, INFO, WARN, ERROR, FATAL },
  STACK_TYPES: { BACKEND, FRONTEND },
  PACKAGE_NAMES: { SERVICE, HANDLER, ... },
  PRIORITY_WEIGHTS: { Placement: 3, Result: 2, Event: 1 },
  DEFAULT_HEADERS: { "Content-Type": "application/json" }
}
```

### 3. Priority Calculator (`src/utils/priorityCalculator.js`)

**Purpose**: Calculate and compare notification priorities

**Functions**:
- `calculateWeight(type)` - Returns weight for notification type
- `compareNotifications(a, b)` - Comparator function for sorting

**Logic**:
1. Weight by type (Placement=3 > Result=2 > Event=1)
2. Within same weight, sort by timestamp (newest first)

### 4. Notification Sorter (`src/utils/notificationSorter.js`)

**Purpose**: Sort and filter notifications

**Functions**:
- `sortNotifications(notifications)` - Returns fully sorted array
- `getTopNotifications(notifications, count)` - Returns top N sorted

**Complexity**: O(n log n) for sorting, O(1) for slicing

### 5. Logging Middleware (`src/middleware/logger.js`)

**Purpose**: Central logging endpoint

**Features**:
- Posts to external logging API
- Includes timestamp and environment
- Handles authorization with Bearer token
- Graceful error handling

**Usage**:
```javascript
await Log(stack, level, packageName, message);
// Returns: { success: boolean, data/error }
```

### 6. Notification Service (`src/services/notificationService.js`)

**Purpose**: Fetch and process notifications from API

**Features**:
- Authenticated API calls
- Error logging and propagation
- Returns parsed notification array

**Workflow**:
1. Log fetch attempt
2. GET request with Bearer token
3. On success: Log success, return data
4. On error: Log error, throw exception

### 7. Log Service (`src/services/logService.js`)

**Purpose**: Handle single and batch logging

**Functions**:
- `logMessage(stack, level, package, message)` - Single log
- `logBatch(logs)` - Multiple logs in sequence

**Performance**: Can be optimized with queue/buffer in production

### 8. Notification Handler (`src/handlers/notificationHandler.js`)

**Purpose**: Orchestrate the complete workflow

**Main Function**: `handleNotifications()`

**Workflow**:
```
1. Log application start
   │
2. Fetch notifications from API
   ├─ Returns: notification[]
   │
3. Sort by priority using notificationSorter
   ├─ Input: notification[]
   ├─ Output: sorted notification[]
   │
4. Get top 10 using getTopNotifications
   │
5. Display formatted output
   │
6. Log completion
```

**Helper**: `displayNotification(notification, index)` - Format and print

### 9. Entry Point (`src/index.js`)

**Purpose**: Application bootstrap

**Logic**:
```javascript
handleNotifications()
  .then(() => process.exit(0))  // Success
  .catch(() => process.exit(1)) // Failure
```

## Data Flow

```
User runs: npm start
    │
    ▼
src/index.js (imports handleNotifications)
    │
    ▼
handleNotifications()
    │
    ├─► Log("started") ──► [Logger] ──► [API: /logs]
    │
    ├─► fetchNotifications() 
    │   ├─► Log("fetching")
    │   ├─► GET /notifications ──► [API: /notifications]
    │   └─► return notification[]
    │
    ├─► getTopNotifications(notifications, 10)
    │   ├─► sortNotifications()
    │   │   ├─► calculateWeight(each.Type)
    │   │   └─► sort by weight + recency
    │   └─► return top10[]
    │
    ├─► displayNotification() (console output)
    │
    └─► Log("completed") ──► [API: /logs]
```

## Priority Algorithm Details

### Weight Assignment
```javascript
getWeight(type) {
  switch (type.toLowerCase()) {
    case "placement": return 3;
    case "result":    return 2;
    case "event":     return 1;
    default:          return 0;
  }
}
```

### Sorting Comparator
```javascript
compareNotifications(a, b) {
  const weightA = getWeight(a.Type);
  const weightB = getWeight(b.Type);
  
  // First: by weight (descending)
  if (weightA !== weightB) return weightB - weightA;
  
  // Then: by timestamp (newest first)
  return new Date(b.Timestamp) - new Date(a.Timestamp);
}
```

### Example Trace
```
Input notifications:
1. Type: Event,      Timestamp: 2026-04-22 17:51:06 → Weight: 1
2. Type: Result,     Timestamp: 2026-04-22 17:51:30 → Weight: 2
3. Type: Placement,  Timestamp: 2026-04-22 17:51:18 → Weight: 3
4. Type: Placement,  Timestamp: 2026-04-22 17:51:08 → Weight: 3

Sorted output:
1. Placement (2026-04-22 17:51:18) - Weight 3, newer of two
2. Placement (2026-04-22 17:51:08) - Weight 3, older
3. Result (2026-04-22 17:51:30)   - Weight 2
4. Event (2026-04-22 17:51:06)    - Weight 1
```

## Error Handling

### Logger Errors
```
When API fails:
  ├─ Returns { success: false, error: "..." }
  └─ Prints "❌ Logging failed: ..."
```

### Fetch Errors
```
When notification API fails:
  ├─ Logs error to API
  ├─ Throws error
  └─ Application exits with code 1
```

### Handler Errors
```
When any step fails:
  ├─ Logs fatal error
  ├─ Prints "❌ Error: ..."
  └─ Process exits with code 1
```

## Configuration & Secrets

### Environment Variables (`.env`)
```
BEARER_TOKEN=<your_jwt_token>
LOGS_API_URL=http://20.207.122.201/evaluation-service/logs
NOTIFICATIONS_API_URL=http://20.207.122.201/evaluation-service/notifications
NODE_ENV=development
```

### Defaults (in `config.js`)
```javascript
{
  apis: {
    logs: { url: "http://20.207.122.201/evaluation-service/logs" },
    notifications: { url: "http://20.207.122.201/evaluation-service/notifications" }
  },
  auth: { token: "YOUR_BEARER_TOKEN" },
  app: { topNotificationsCount: 10, environment: "development" }
}
```

## Testing Strategy

### Unit Tests (Recommended)
- `priorityCalculator.js`: Test weight calculation
- `notificationSorter.js`: Test sorting logic with various inputs
- Constants validation

### Integration Tests
- Mock API responses
- Test full workflow with sample data
- Verify logging calls

### Manual Testing
- Postman for API validation
- Console output verification
- Error scenario testing

## Security Considerations

### Token Management
- ✅ Stored in `.env` (not in git)
- ✅ Passed via Authorization header
- ✅ Protected route enforcement

### API Security
- ✅ HTTPS recommended (production)
- ✅ Bearer token authentication
- ✅ No sensitive data in logs

### Code Security
- ✅ Dependency audit: `npm audit`
- ✅ Environment variable protection
- ✅ Error messages (no stack traces in production)

## Performance Characteristics

| Operation | Complexity | Time |
|-----------|-----------|------|
| Fetch notifications | O(n) network | ~1-2s |
| Calculate weights | O(n) | <1ms |
| Sort notifications | O(n log n) | <10ms |
| Display top 10 | O(10) | <5ms |
| Total execution | - | ~1-2s |

## Monitoring & Observability

### Logging Events
Every significant action is logged:
- Application lifecycle (start, stop)
- API calls (request, response, error)
- Business logic (fetch, sort, display)
- Errors (with full context)

### Log Levels
- **debug**: Development-only details
- **info**: General flow information
- **warn**: Non-critical issues
- **error**: Recoverable errors
- **fatal**: Application-stopping errors

## Future Enhancements (Stage 2+)

1. **Real-time Updates**
   - WebSocket connection for live notifications
   - Browser push notifications

2. **User Features**
   - Authentication & authorization
   - Notification preferences per user
   - Mark as read/archive

3. **UI/UX**
   - Web dashboard
   - Mobile app
   - Email digest

4. **Performance**
   - Caching layer
   - Batch logging
   - Database persistence

5. **Advanced Features**
   - Search and filter
   - Analytics
   - Custom priorities
   - Notification actions

## Deployment Checklist

- [ ] `.env` configured with valid token
- [ ] `npm install` completed
- [ ] API endpoints tested with Postman
- [ ] Application runs without errors
- [ ] Console output formatted correctly
- [ ] All logging events are recorded
- [ ] Screenshots captured
- [ ] Documentation complete
- [ ] Code pushed to GitHub
- [ ] `.gitignore` prevents secret leaks

## References

- JWT Token Format: [jwt.io](https://jwt.io)
- Axios Documentation: [axios-http.com](https://axios-http.com)
- Node.js Best Practices: [nodejs.dev](https://nodejs.dev)
- ES6+ Features: [ecma262.org](https://ecma262.org)

---

**Document Version**: 1.0  
**Last Updated**: May 6, 2026  
**Status**: Stage 1 Complete
