# COSMOCARE-AI — Frontend & Backend Integration Guide

## 1. Running the Frontend Locally

From the main project folder:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Then open `http://localhost:3000` in your browser.

If your team uses a custom backend URL later, create a file named `frontend/.env.local` (never upload `.env*` files to GitHub) with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 2. Where API Code Lives

- Backend API calls: `frontend/services/healthApi.ts`
- Shared data types: `frontend/types/health.ts`
- Browser memory (`localStorage`): `frontend/hooks/useCosmoCareState.ts`

## 3. Already Connected Endpoint

- **Daily Check-in:** `POST ${API_BASE_URL}/api/checkin` inside `submitDailyCheckin()` (`frontend/services/healthApi.ts`).
- Sends: `heart_rate`, `systolic`, `diastolic`, `glucose`, `temp`, `sleep_hours`, `mood`.
- Expects: `{ overall_status, health_score, indicators, disclaimer }`.
- If the backend at `localhost:8000` is turned off, the frontend automatically switches to a clearly labeled **Demo Simulation** mode so nothing breaks.

## 4. Ready for Future Backend Integration

When backend endpoints are ready, please share the exact URL and JSON format for:
1. **AI Health Assistant** (`askCosmoCareAssistant` in `frontend/services/healthApi.ts`) — currently uses clearly labeled Demo AI replies.
2. **Extended Metrics (`spo2`, `weight`)** — currently tracked in the frontend UI and `localStorage`.
3. **History & Mental Wellbeing Storage** — currently stored in browser `localStorage` with sample mission data in `frontend/data/mockData.ts`.