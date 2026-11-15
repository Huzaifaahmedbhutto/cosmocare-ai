# CosmoCare AI

**An astronaut self-assessment and health decision-support tool for long-duration space missions.**

Built for the **2026 NASA Space Apps Challenge** (Universal Event), challenge: *Create Health Monitoring Software for Astronauts on Space Missions*.

- Live app: https://cosmocare-ai-werj.vercel.app
- Live API docs: https://cosmocare-ai.vercel.app/docs
- Code: https://github.com/Huzaifaahmedbhutto/cosmocare-ai

> **Demo tool using simulated data. It is not a medical device and does not replace flight surgeon guidance.**

---

## The problem

On missions to the Moon and Mars, astronauts face space radiation, isolation and confinement, distance from Earth, altered gravity and hostile closed environments (NASA's five hazards of human spaceflight). Help from Earth can be delayed, so crews carry much of the responsibility for noticing changes in their own health early.

## Our solution

CosmoCare AI lets an astronaut complete a **daily health check-in** and immediately see:

- the status of each indicator (**green** normal, **yellow** caution, **red** alert),
- an overall **0-100 health score**,
- **why** the indicator matters in spaceflight and **which NASA hazard** is linked to it,
- a simple **recommended action**, and an instruction to **contact the flight surgeon** when anything is red.

## Features

- **Daily biometric check-in** for heart rate, systolic and diastolic blood pressure, fasting glucose, body temperature, sleep, mood, SpO2 and weight, with Healthy, Stressed and Critical presets for quick demos.
- **Color-coded triage and health score.** Each yellow indicator costs 10 points and each red one 25 points.
- **Interactive body map** with six systems (nervous, cardiovascular, respiratory, musculoskeletal, immune, metabolic). Click a system to see its readings, hazards, warning signs and guidance.
- **NASA hazard mapping.** Every indicator is tagged with the related hazard(s).
- **Health analytics** with trend views, a **mental wellbeing** check-in, a **health assistant** and **printable reports**.
- **Demo fallback.** If the backend is unreachable, the app clearly labels results as a demo simulation.

## Reference ranges used by the backend

General adult reference values (not NASA-specific ranges).

| Indicator | Normal (green) | Caution (yellow) | Related NASA hazards |
|---|---|---|---|
| Resting heart rate (bpm) | 60 - 100 | 50 - 120 | Gravity fields, hostile closed environments |
| Systolic BP (mmHg) | 90 - 119.9 | 80 - 139.9 | Gravity fields |
| Diastolic BP (mmHg) | 60 - 79.9 | 50 - 89.9 | Gravity fields |
| Fasting glucose (mg/dL) | 70 - 99.9 | 60 - 125.9 | Hostile closed environments, distance from Earth |
| Body temperature (C) | 36.1 - 37.2 | 35.5 - 38.0 | Hostile closed environments, space radiation |
| Sleep (hours) | 7 or more | 5 or more | Isolation and confinement, hostile closed environments |
| Mood (1-10) | 6 - 10 | 4 - 10 | Isolation and confinement, distance from Earth |

Values outside the caution band are red.

## Architecture

```
Next.js frontend (Vercel)  --POST /api/checkin-->  FastAPI backend (Vercel)
   check-in form, body map,                          rules, ranges, hazards,
   analytics, wellbeing, reports                     guidance, health score
```

### API endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/checkin` | Evaluate a daily check-in and return status, score, hazards and guidance |
| GET | `/api/reference-ranges` | Reference ranges used by the rules |
| GET | `/api/crew` | Simulated crew with risk status |
| GET | `/api/vitals/{astronaut_id}` | Simulated vitals time series |
| GET | `/api/alerts` | Z-score anomaly alerts on simulated telemetry |
| POST | `/api/analyze` | Z-score analysis of submitted vitals |

## Repository structure

```
backend/    FastAPI app (main.py, rules.py, requirements.txt)
frontend/   Next.js app (app, components, hooks, services, types, data)
ml/         Simulated 14-day dataset, trend analysis, plots, references.md
```

## Run locally

**Backend**

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open http://localhost:8000/docs

**Frontend** (in a second terminal)

```powershell
cd frontend
npm install
"NEXT_PUBLIC_API_URL=http://localhost:8000" | Set-Content .env.local
npm run dev
```

Open http://localhost:3000. On macOS or Linux, activate the venv with `source .venv/bin/activate` and create `.env.local` with the same line.

## Deployment

Two Vercel projects from this repository: the backend (root directory `backend`, FastAPI) and the frontend (root directory `frontend`, Next.js) with the environment variable `NEXT_PUBLIC_API_URL` set to the backend URL.

## ML trend analysis (`ml/`)

A simulated 14-day dataset for four astronauts (`ml/data/checkins.csv`), personal-baseline deviation and trend analysis (`ml/trend.py`), and plots for sleep, mood and heart rate (`ml/plots/`). It flags gradual declines such as falling sleep and mood. See `ml/references.md` for sources.

## Honest limitations

- All astronaut data is **simulated**.
- Reference ranges are general adult values, not NASA-specific.
- SpO2 and weight are recorded in the interface but are **not scored** by the backend yet.
- The z-score anomaly module runs on simulated crew telemetry, not on check-in results.
- The `ml/` module is included in the repository but is **not yet integrated** into the live dashboard.
- Check-in history is stored in the browser (localStorage).

## Future work

Wearable integration, predictive models for early decline detection, integration with cabin O2 and CO2 sensors, and connecting the ML trend module to the live dashboard.

## Team (CosmoCare AI)

| Member | Role |
|---|---|
| Huzaifa Ahmed Bhutto ([@Huzaifaahmedbhutto](https://github.com/Huzaifaahmedbhutto)) | Team lead, backend, integration, deployment |
| Sumaiya Binte Rizwan ([@sumaiyarizwan42-cyber](https://github.com/sumaiyarizwan42-cyber)) | Frontend dashboard |
| Mahnoor Haseeb ([@MahnoorHaseeb-cyber](https://github.com/MahnoorHaseeb-cyber)) | Data and ML |
| Ali Hamza | Design, documentation and presentation |

## NASA and partner resources

- NASA Human Research Program, 5 Hazards of Human Spaceflight: https://www.nasa.gov/hrp/hazards/
- NASA Human Research Program, Risks of Human Spaceflight: https://www.nasa.gov/hrp/risks/
- NASA Human Research Program, Ongoing Research in Space: https://www.nasa.gov/hrp/ongoing-hrp-research/
- Canadian Space Agency, Monitoring Radiation for Astronaut Health: https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- Canadian Space Agency, Why Do We Conduct Science Experiments in Space?: https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp

## AI assistance

AI tools were used as assistants during development (including Claude for backend code and documentation help, and Gemini / NotebookLM for presentation visuals). The team reviewed, tested and integrated all outputs. Full disclosure is in our NASA Space Apps submission.

## Disclaimer

CosmoCare AI is a hackathon demonstration. It uses simulated data and illustrative wellness rules. It is not a certified medical device and must not be used for medical decisions.