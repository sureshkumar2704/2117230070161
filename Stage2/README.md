# Stage 2 — Frontend

A React UI for the notification inbox. Connects to Stage 1, handles filtering/sorting, and tracks read status.

## Getting Started

```bash
cd Stage2
npm install
npm run dev
```

*(Make sure Stage 1 is running on port 3000 first)*

## Features

- Adjustable limits (10, 15, or 20 items)
- Filter by category (Placement, Result, Event)
- Local storage for tracking "viewed" status
- Auto-sorts by type then time

## Key Files

- `App.jsx` — main layout
- `NotificationList.jsx` — sorting & rendering logic
- `NotificationCard.jsx` — individual row component

## Building for Production

```bash
npm run build
npm run preview
```

## Notes
- "Viewed" state only persists on your current browser.
- Displays a clear error if the backend goes down.
