from typing import List

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="CosmoCare AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CREW = [
    {"id": 1, "name": "Cmdr. Amara Nwosu", "role": "Commander"},
    {"id": 2, "name": "Dr. Kenji Mori", "role": "Flight Surgeon"},
    {"id": 3, "name": "Lena Petrova", "role": "Pilot"},
    {"id": 4, "name": "Carlos Rivera", "role": "Engineer"},
]

METRICS = ["heart_rate", "spo2", "temp", "resp_rate", "sleep_hours", "hrv"]

MESSAGES = {
    "heart_rate": ("Heart rate abnormal", "Check stress, workload and cabin conditions; advise rest."),
    "spo2": ("Blood oxygen (SpO2) abnormal", "Check cabin O2/CO2 and ventilation; recheck sensor."),
    "temp": ("Body temperature abnormal", "Check cabin temperature; assess for fever or heat stress."),
    "resp_rate": ("Respiration rate abnormal", "Check air quality; monitor breathing closely."),
    "sleep_hours": ("Sleep pattern abnormal", "Adjust schedule; ensure a rest period."),
    "hrv": ("Heart rate variability abnormal", "Possible high stress or fatigue; schedule recovery time."),
}


def build_data():
    """Simulated vitals: 7 days, 1-min interval, with a few injected anomalies."""
    rng = np.random.default_rng(42)
    end = pd.Timestamp.now().floor("min")
    idx = pd.date_range(end=end, periods=7 * 24 * 60, freq="min")
    n = len(idx)
    t = np.arange(n)
    day = np.sin(2 * np.pi * t / (24 * 60))
    data = {}
    for a in CREW:
        data[a["id"]] = pd.DataFrame({
            "timestamp": idx,
            "heart_rate": 68 + 6 * day + rng.normal(0, 2, n),
            "spo2": 97.5 + rng.normal(0, 0.5, n),
            "temp": 36.7 + 0.2 * day + rng.normal(0, 0.1, n),
            "resp_rate": 15 + rng.normal(0, 0.8, n),
            "sleep_hours": 7 + rng.normal(0, 0.2, n),
            "hrv": 55 - 5 * day + rng.normal(0, 3, n),
        })
    # injected anomalies (demo)
    data[2].loc[data[2].index[-120:], "spo2"] -= 6
    data[3].loc[data[3].index[-90:], "heart_rate"] += 18
    data[4].loc[data[4].index[-60:], "temp"] += 1.4
    return data


DATA = build_data()


def analyze_df(df: pd.DataFrame, baseline_rows: int):
    """Compare last 30 min vs personal baseline using z-score."""
    base = df.iloc[:baseline_rows]
    recent = df.iloc[-30:]
    anomalies, zmax = [], 0.0
    now = df["timestamp"].iloc[-1]
    for m in METRICS:
        mu = base[m].mean()
        sd = base[m].std() or 1e-6
        z = (recent[m].mean() - mu) / sd
        zmax = max(zmax, abs(z))
        if abs(z) >= 3:
            msg, tip = MESSAGES[m]
            direction = "high" if z > 0 else "low"
            anomalies.append({
                "timestamp": pd.Timestamp(now).isoformat(),
                "severity": "critical" if abs(z) >= 6 else "warning",
                "metric": m,
                "message": f"{msg}: {direction} (z={z:.1f})",
                "suggestion": tip,
            })
    risk = int(min(100, round(zmax * 12)))
    return risk, anomalies


def status_from_risk(risk: int) -> str:
    if risk < 35:
        return "green"
    if risk < 65:
        return "yellow"
    return "red"


@app.get("/")
def root():
    return {"app": "CosmoCare AI API", "docs": "/docs", "data": "simulated"}


@app.get("/api/crew")
def get_crew():
    out = []
    for a in CREW:
        risk, _ = analyze_df(DATA[a["id"]], 6 * 24 * 60)
        out.append({**a, "status": status_from_risk(risk), "risk_score": risk})
    return out


@app.get("/api/vitals/{astronaut_id}")
def get_vitals(astronaut_id: int, hours: int = Query(24, ge=1, le=168)):
    if astronaut_id not in DATA:
        raise HTTPException(404, "Astronaut not found")
    df = DATA[astronaut_id].tail(hours * 60)
    step = max(1, len(df) // 300)  # downsample to ~300 points for charts
    df = df.iloc[::step].copy()
    df["timestamp"] = df["timestamp"].dt.strftime("%Y-%m-%dT%H:%M:%S")
    return df.round(2).to_dict(orient="records")


@app.get("/api/alerts")
def get_alerts():
    alerts, i = [], 1
    for a in CREW:
        _, anomalies = analyze_df(DATA[a["id"]], 6 * 24 * 60)
        for an in anomalies:
            alerts.append({"id": i, "astronaut_id": a["id"], **an})
            i += 1
    return alerts

class Vital(BaseModel):
    timestamp: str
    heart_rate: float
    spo2: float
    temp: float
    resp_rate: float
    sleep_hours: float
    hrv: float


class AnalyzeRequest(BaseModel):
    vitals: List[Vital]  # at least 60 rows, oldest first


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    if len(req.vitals) < 60:
        raise HTTPException(400, "Send at least 60 readings")
    df = pd.DataFrame([v.model_dump() for v in req.vitals])
    risk, anomalies = analyze_df(df, len(df) - 30)
    return {"risk_score": risk, "anomalies": anomalies}


from rules import CheckIn, RANGES, evaluate_checkin


@app.post("/api/checkin")
def checkin(data: CheckIn):
    return evaluate_checkin(data)


@app.get("/api/reference-ranges")
def reference_ranges():
    return RANGES