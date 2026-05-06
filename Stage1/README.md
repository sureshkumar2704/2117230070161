# Campus Notification System — Stage 1

Fetches notifications from the external service, sorts them by type and time, and exposes them through either the terminal or a simple HTTP API.

## Getting Started

```bash
cd Stage1
npm install
cp .env.example .env
```

Open `.env` and paste your Bearer token, then:

```bash
npm start
```

## Running

**CLI** — prints the top N notifications directly in the terminal:

```bash
node src/index.js 15
```

**API** — starts the local server on port 3000:

```bash
npm run server
# GET /api/notifications?limit=10
```

Other endpoints: `/api/health`, `/api/stats`, `/api/notifications/top/:n`

## Sorting Order

Placement → Result → Event, newest first within each group.

## Project Files

| Path | Purpose |
|------|---------|
| `.env` | local config (token) |
| `.env.example` | template to copy from |
| `src/` | all source code |
| `Notification_System_Design.md` | flow overview |
