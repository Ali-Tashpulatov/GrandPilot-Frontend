# GrandPilot — Grand Mobile

> AI-Powered Support Ticket Management System | Decentrathon 6.0

A production-quality React frontend for GrandPilot (Grand Mobile AI triage system). Built as Agent 2's deliverable for the hackathon.

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06b6d4)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

The app starts at **http://localhost:5173** by default.

## Environment Variables

Copy `.env.example` to `.env` and update as needed:

```
VITE_API_BASE_URL=http://localhost:8000
```

The API URL can also be changed at runtime via **Settings → Backend API URL**.

## Features

### 📊 Overview Dashboard
- Real-time ticket statistics (Total, Pending, AI Processed, Escalated)
- Ticket activity line chart, category/priority distribution
- Recent tickets list, AI activity timeline, system health status

### 🎫 Support Tickets (Three-Panel Workspace)
- **Inbox**: Search, filter by category/priority/status, ticket list
- **Details**: Full complaint, player ID, language, extracted AI facts
- **AI Copilot**: Classification, confidence, rule references, verdict, suggested reply
- **Actions**: Approve / Edit / Escalate (demo — saved locally with clear labeling)

### 🧪 AI Playground (Critical Demo Feature)
- Submit custom complaints in any language (EN, RU, KK, UZ)
- Pre-built example complaints
- Full AI analysis display: category, priority, confidence, rules, verdict, draft
- Raw JSON response inspector
- Live/Demo mode indicator

### 📖 Rule Explorer
- Browse and search game rules (loaded from backend GET /rules)
- Shows empty state when rules are unavailable

### 📈 Analytics
- Ticket volume over time (area chart)
- Category and priority distribution (pie/bar charts)
- Human escalation count
- Status distribution
- All charts clearly labeled as "Demo Data" when using sample data

### ⚙️ Settings
- Interface language: English / Русский / Қазақша
- Theme (dark)
- Backend API URL configuration
- Connection test
- Connection status with troubleshooting guide

## Backend Integration

The frontend is integrated with the **FastAPI backend** running at `http://127.0.0.1:8000`.

### Active Backend Endpoints

#### 1. POST `/triage`
Submits player complaints for real-time automated AI triage.

Request (matching backend Pydantic schema):
```json
{
  "ticket_id": "TKT-001",
  "kind": "complaint",
  "lang": "ru",
  "messages": [
    {
      "role": "player",
      "text": "Игрок нарушил правило чата и оскорбил родных"
    }
  ]
}
```

Response:
```json
{
  "ticket_id": "TKT-001",
  "category": "complaint.insult",
  "priority": "p2",
  "rule_refs": ["2.1"],
  "verdict": "need_evidence",
  "punishment_suggestion": null,
  "draft": "Уважаемый игрок, благодарим вас за вашу жалобу...",
  "needs_human": false,
  "confidence": 0.95,
  "processing_time_ms": 3.82
}
```

#### 2. GET `/health`
Health probe returning service status (`{"status":"ok","service":"support-copilot"}`). Auto-polled every 15s by the connection status indicator.

#### 3. GET `/rules/refs`
Returns the whitelist of valid official game rule references (`{"refs":["1.1","1.1.1",...,"6.5"]}`). Populates the Rule Explorer.

### Integration Points
- `src/services/api.ts` — Centralized API client with timeout, error handling
- `src/types/api.ts` — TypeScript interfaces for all request/response types
- `src/hooks/useTriage.ts` — TanStack Query mutation for /triage
- `src/hooks/useConnectionStatus.ts` — Auto-polling health check
- `src/hooks/useRules.ts` — Rules fetching with caching
- `src/config/api.ts` — API configuration and URL management

### Missing Backend Capabilities (for Agent 1)
- `POST /triage` — Primary endpoint (expected)
- `GET /health` — Health check endpoint
- `GET /rules` — Rules list endpoint
- Operator action persistence (approve/edit/escalate)
- Ticket list API (currently using demo data)
- Analytics data API (currently using demo data)

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite 6 | Build tooling |
| Tailwind CSS 3 | Styling |
| Lucide React | Icons |
| Recharts | Analytics charts |
| Framer Motion | Animations |
| React Router 6 | Navigation |
| TanStack Query 5 | API state management |

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── ConnectionIndicator.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── StatusBadge.tsx
│   └── layout/          # Layout components
│       ├── AppLayout.tsx
│       ├── Sidebar.tsx
│       └── TopBar.tsx
├── config/
│   └── api.ts           # API configuration
├── data/
│   └── demo.ts          # Demo/sample data
├── hooks/
│   ├── useConnectionStatus.ts
│   ├── useRules.ts
│   └── useTriage.ts
├── i18n/
│   └── translations.ts  # EN/RU/KK translations
├── pages/
│   ├── OverviewPage.tsx
│   ├── TicketsPage.tsx
│   ├── PlaygroundPage.tsx
│   ├── RulesPage.tsx
│   ├── AnalyticsPage.tsx
│   └── SettingsPage.tsx
├── services/
│   └── api.ts           # API client
├── types/
│   └── api.ts           # TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

## What's Genuinely Working

| Feature | Status |
|---|---|
| All 6 navigation pages render and are interactive | ✅ Working |
| Live connection probe (GET `/health`) | ✅ Live & connected (auto-polling) |
| AI Playground triage (POST `/triage`) | ✅ Live & connected to FastAPI |
| Live Ticket Workspace triage | ✅ Live (can triage any ticket via backend) |
| Rule Explorer (GET `/rules/refs`) | ✅ Live (101 verified whitelist rule references) |
| Approve / Edit / Escalate operator actions | ✅ Working (demo, clearly labeled) |
| Charts and analytics dashboard | ✅ Working (demo labeled) |
| Multilingual complaints (RU/KK/UZ/EN) | ✅ Working with backend language support |
| Responsive layout (desktop/tablet/mobile) | ✅ Working |
| i18n language switching (EN/RU/KK) | ✅ Working |
| API URL configuration via Settings | ✅ Working |

## License

Built for Decentrathon 6.0 by Grand Mobile Team.


## Production API configuration
Set `VITE_API_BASE_URL` in `.env.local` before `npm run build` (see `.env.example`). Use HTTPS when hosting the frontend on HTTPS. Settings stores a browser-local override; clear `api_base_url` from local storage to restore the build-time default. The backend must allow the frontend origin through CORS. SPA hosting must rewrite unknown paths to `index.html`.

Current confirmed endpoints: `POST /triage`, `GET /health`, `GET /rules/refs`. The rules endpoint supplies IDs only; full rule content requires an agreed backend endpoint/schema. The frontend does not infer rule text or sanctions from IDs. Ticket lists and analytics currently use bundled demo data; operator actions are local component state and are not persisted to the backend.
