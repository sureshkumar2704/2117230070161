# Stage 1 — Design Notes

Two entry points: a CLI that prints to the terminal, and an HTTP API that returns JSON.

## Flow

1. Fetch notifications from the external service
2. Sort by type (Placement → Result → Event), then by timestamp descending
3. Serve via CLI output or API response

## Key Files

- `src/index.js` — picks CLI or server mode based on args
- `src/server.js` — API routes
- `src/services/notificationService.js` — fetches data
- `src/handlers/notificationHandler.js` — sorting logic
- `src/middleware/logger.js` — fire-and-forget logging

## API Response Shape

```json
{
  "success": true,
  "data": [],
  "meta": { "total": 0, "returned": 10, "limit": 10 }
}
```

## Decisions

- No framework — plain Node.js by design
- Log failures are swallowed so the app never crashes because of them
- Out-of-range limits default to 10
