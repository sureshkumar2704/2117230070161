# Stage 2 Setup

## 1. Start the App

```bash
cd Stage2
npm install
npm run dev
```

*Requires Stage 1 running at `http://localhost:3000`.*

## 2. Verification Steps

Once running at `http://localhost:5173`, check that you can:
- Toggle the limit dropdown (10, 15, 20)
- Filter the list by category (Placement, Result, Event)
- Click a card to mark it as viewed
- Refresh the page and see the viewed items are still saved

## 3. Production Build

```bash
npm run build
npm run preview
```

## Tech Notes
- Styling is a mix of Material UI and plain CSS.
- Points to `http://localhost:3000/api/notifications` by default.
- Gracefully handles backend downtime with an error state.
