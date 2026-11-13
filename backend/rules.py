from typing import Optional

from pydantic import BaseModel, Field

DISCLAIMER = (
    "Research/demo tool using simulated data. Not a medical device and not a "
    "diagnosis. Always follow your flight surgeon's guidance."
)

# green = normal band, yellow = caution band (includes green), outside yellow = red
# NOTE: general adult reference values. Verify and cite a source in the submission.
RANGES = {
    "heart_rate": {"label": "Resting heart rate", "unit": "bpm", "green": [60, 100], "yellow": [50, 120]},
    "systolic": {"label": "Systolic blood pressure", "unit": "mmHg", "green": [90, 119.9], "yellow": [80, 139.9]},
    "diastolic": {"label": "Diastolic blood pressure", "unit": "mmHg", "green": [60, 79.9], "yellow": [50, 89.9]},
    "glucose": {"label": "Blood glucose (fasting)", "unit": "mg/dL", "green": [70, 99.9], "yellow": [60, 125.9]},
    "temp": {"label": "Body temperature", "unit": "C", "green": [36.1, 37.2], "yellow": [35.5, 38.0]},
    "sleep_hours": {"label": "Sleep (last 24 h)", "unit": "hours", "green": [7, 24], "yellow": [5, 24]},
    "mood": {"label": "Mood (1 = very low, 10 = very good)", "unit": "/10", "green": [6, 10], "yellow": [4, 10]},
}

RADIATION = "Space radiation"
ISOLATION = "Isolation and confinement"
DISTANCE = "Distance from Earth"
GRAVITY = "Gravity fields"
CLOSED_ENV = "Hostile closed environments"

BP_WHY = (
    "Blood pressure shows how hard the heart and blood vessels are working. "
    "Spaceflight changes fluid distribution and can affect cardiovascular health."
)
BP_YELLOW = "Sit and rest for 10 minutes, drink water, then re-measure. Note recent exercise, caffeine or stress."
BP_RED = "Stop activity, sit or lie down and re-measure. Report to the flight surgeon if it stays out of range."

INFO = {
    "heart_rate": {
        "body_part": "heart",
        "hazards": [GRAVITY, CLOSED_ENV],
        "why": "Heart rate shows how hard the cardiovascular system is working. Spaceflight can change heart function and fluid distribution.",
        "yellow": "Rest for 10 minutes, hydrate, then re-measure. Note recent exercise or stress.",
        "red": "Stop activity, sit or lie down and re-measure. Contact the flight surgeon if it stays out of range.",
    },
    "systolic": {"body_part": "heart", "hazards": [GRAVITY], "why": BP_WHY, "yellow": BP_YELLOW, "red": BP_RED},
    "diastolic": {"body_part": "heart", "hazards": [GRAVITY], "why": BP_WHY, "yellow": BP_YELLOW, "red": BP_RED},
    "glucose": {
        "body_part": "torso",
        "hazards": [CLOSED_ENV, DISTANCE],
        "why": "Blood sugar reflects nutrition and metabolism. Limited food variety and stress on long missions can affect it.",
        "yellow": "Check meal timing and food intake, drink water, and re-measure in a while.",
        "red": "Re-measure to confirm. If confirmed, contact the flight surgeon and follow your medical protocol.",
    },
    "temp": {
        "body_part": "body",
        "hazards": [CLOSED_ENV, RADIATION],
        "why": "Body temperature is a quick sign of infection, heat stress or immune changes, which spaceflight can influence.",
        "yellow": "Check cabin temperature, rest, hydrate, and re-measure in 30 minutes.",
        "red": "Re-measure to confirm. Contact the flight surgeon about possible fever or heat stress.",
    },
    "sleep_hours": {
        "body_part": "brain",
        "hazards": [ISOLATION, CLOSED_ENV],
        "why": "Good sleep protects mood, focus and recovery. Light, noise and schedule changes in space often disrupt it.",
        "yellow": "Protect your next sleep period: dim lights, reduce noise, keep a fixed routine.",
        "red": "Severe sleep loss. Tell the crew and flight surgeon, and reduce risky tasks until rested.",
    },
    "mood": {
        "body_part": "brain",
        "hazards": [ISOLATION, DISTANCE],
        "why": "Mood is an early indicator of behavioral health. Isolation and distance from Earth can affect it on long missions.",
        "yellow": "Talk to a crewmate or family, take a short break, and do something you enjoy.",
        "red": "Please reach out to the flight surgeon or behavioral health support. You do not have to handle this alone.",
    },
}


class CheckIn(BaseModel):
    astronaut_id: Optional[int] = None
    heart_rate: float = Field(ge=20, le=250)
    systolic: float = Field(ge=50, le=260)
    diastolic: float = Field(ge=30, le=160)
    glucose: float = Field(ge=20, le=600)
    temp: float = Field(ge=30, le=43)
    sleep_hours: float = Field(ge=0, le=24)
    mood: float = Field(ge=1, le=10)


def _status(metric: str, value: float) -> str:
    g = RANGES[metric]["green"]
    y = RANGES[metric]["yellow"]
    if g[0] <= value <= g[1]:
        return "green"
    if y[0] <= value <= y[1]:
        return "yellow"
    return "red"


def evaluate_checkin(data: CheckIn) -> dict:
    values = data.model_dump()
    indicators = []
    penalty = 0
    for metric, r in RANGES.items():
        value = values[metric]
        status = _status(metric, value)
        if status == "green":
            action = "Within the normal range. Keep up your routine."
        else:
            action = INFO[metric][status]
        direction = None
        if status != "green":
            direction = "high" if value > r["green"][1] else "low"
        penalty += {"green": 0, "yellow": 10, "red": 25}[status]
        indicators.append({
            "metric": metric,
            "label": r["label"],
            "value": value,
            "unit": r["unit"],
            "status": status,
            "direction": direction,
            "body_part": INFO[metric]["body_part"],
            "hazards": INFO[metric]["hazards"],
            "why": INFO[metric]["why"],
            "action": action,
            "contact_surgeon": status == "red",
        })
    statuses = [i["status"] for i in indicators]
    overall = "red" if "red" in statuses else "yellow" if "yellow" in statuses else "green"
    return {
        "overall_status": overall,
        "health_score": max(0, 100 - penalty),
        "indicators": indicators,
        "disclaimer": DISCLAIMER,
    }