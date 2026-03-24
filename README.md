# Running Coach — Angular App

A full 16-week half marathon training coach with voice guidance, custom run mode, and maintenance week. Built with Angular 17 (standalone components, signals, lazy-loaded routes).

---

## Prerequisites

- **Node.js** 18.x or later — https://nodejs.org
- **Angular CLI** 17.x

```bash
npm install -g @angular/cli@17
```

---

## Setup

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4200)
npm start

# Build for production
npm run build:prod
# Output: dist/running-coach/
```

---

## Project Structure

```
src/
├── app/
│   ├── models/
│   │   └── training.models.ts       # All TypeScript interfaces
│   ├── services/
│   │   ├── training-data.service.ts # Full 16-week plan data + session builders
│   │   ├── run-session.service.ts   # Timer logic, signals, localStorage
│   │   └── voice-coach.service.ts   # Web Speech API wrapper
│   ├── pipes/
│   │   └── format-time.pipe.ts      # MM:SS formatter
│   ├── components/
│   │   ├── plan/                    # 16-week training plan view
│   │   ├── prep/                    # Session preview before starting
│   │   ├── active-run/              # Live timer + voice coach
│   │   ├── custom-setup/            # Custom interval builder
│   │   └── stats/                   # Progress stats
│   ├── app.component.*              # Shell + bottom nav
│   ├── app.routes.ts                # Lazy-loaded routes
│   └── app.config.ts                # Providers
├── styles.scss                      # Global CSS variables + resets
└── index.html                       # Google Fonts import
```

---

## Features

### Training Plan
- Full 16-week plan across 4 phases: Foundation → Base Building → HM Training → Taper → Race Week
- Expandable week cards with per-day session chips
- Tap any session to see a full breakdown before starting
- Completion tracking stored in `localStorage`
- Maintenance week unlocks after plan completion (repeatable indefinitely)

### Running Assistant (Active Run)
- Large countdown timer for the current interval
- Voice cues via Web Speech API:
  - Announces each transition ("Run!", "Walk now. Recover.", "Tempo pace. Push it!")
  - 30-second warning with preview of the next segment
  - 10-second warning
  - Session completion announcement
- Color-coded interval strip showing progress through the session
- "Next up" card showing what's coming after the current segment
- Pause / Resume / Stop controls

### Custom Run
- Sliders for: warm-up, run interval, walk interval, number of sets, cool-down
- Live preview bar updates as you drag
- Launches directly into the voice-coached active run

### Stats
- Progress ring (% of plan complete)
- Stat cards: sessions done, current week, estimated minutes, weeks left
- Race day target card
- Phase breakdown legend

---

## Voice Notes

The Web Speech API works in all major browsers (Chrome, Edge, Firefox, Safari).
On **iOS Safari**, audio requires a user gesture before it activates — tapping the START button satisfies this, so voice will work normally.

---

## Deployment

The built output (`dist/running-coach/browser/`) is a static site — deploy to any static host:

```bash
# Netlify (drag & drop dist folder, or use CLI)
npm install -g netlify-cli
netlify deploy --dir=dist/running-coach/browser --prod

# Vercel
npm install -g vercel
vercel dist/running-coach/browser

# GitHub Pages, Firebase Hosting, S3 — all work fine too.
```

For Angular Router to work on non-root paths when deployed, configure your host to redirect all requests to `index.html`.

---

## Customising the Plan

All training data lives in `src/app/services/training-data.service.ts`. The session builder functions at the top of the file (`easyS`, `longS`, `tempoS`, `rwS`, `intS`) make it straightforward to adjust any session. The `plan` array is the full 16-week schedule; `maintenanceWeek` is the repeatable post-race week.
