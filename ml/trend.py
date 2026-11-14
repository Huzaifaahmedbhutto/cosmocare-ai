
import pandas as pd
import numpy as np
from pathlib import Path


# Health metrics to analyse
METRICS = [
    "heart_rate",
    "systolic",
    "diastolic",
    "glucose",
    "temp",
    "sleep_hours",
    "mood"
]


# Minimum meaningful changes for demo anomaly filtering
MIN_CHANGE = {
    "heart_rate": 8.0,
    "systolic": 10.0,
    "diastolic": 8.0,
    "glucose": 10.0,
    "temp": 0.4
}


def detect_trends(df):

    required_columns = ["date", "astronaut_id"] + METRICS

    # Validate dataset columns
    missing = [
        col for col in required_columns
        if col not in df.columns
    ]

    if missing:
        raise ValueError(f"Missing columns: {missing}")

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])

    trends = []
    alerts = []

    # Analyse each astronaut separately
    for astronaut_id, group in df.groupby("astronaut_id"):

        group = group.sort_values("date").reset_index(drop=True)

        if len(group) < 14:
            raise ValueError(
                f"Astronaut {astronaut_id} needs "
                "at least 14 daily records."
            )

        # First 7 days: personal baseline
        baseline = group.iloc[:7]

        # Last 7 days: recent observations
        recent = group.iloc[-7:]

        for metric in METRICS:

            baseline_mean = baseline[metric].mean()
            baseline_std = baseline[metric].std(ddof=1)

            recent_mean = recent[metric].mean()

            # Calculate z-score safely
            if pd.isna(baseline_std) or baseline_std == 0:
                z_score = 0.0
            else:
                z_score = (
                    (recent_mean - baseline_mean) / baseline_std
                )

            # Calculate 7-day trend slope
            x = np.arange(len(recent))
            y = recent[metric].to_numpy(dtype=float)

            slope = np.polyfit(x, y, 1)[0]

            change = recent_mean - baseline_mean

            # Store trend results
            trends.append({
                "astronaut_id": int(astronaut_id),
                "metric": metric,
                "baseline_mean": round(float(baseline_mean), 3),
                "recent_mean": round(float(recent_mean), 3),
                "z_score": round(float(z_score), 3),
                "slope_per_day": round(float(slope), 4)
            })

            # Alert generation
            risk = None
            message = None

            # Detect gradual sleep decline
            if metric == "sleep_hours" and slope <= -0.04:
                risk = "medium"
                message = (
                    f"Sleep is gradually decreasing "
                    f"({slope:.3f} hours per day)."
                )

            # Detect gradual mood decline
            elif metric == "mood" and slope <= -0.08:
                risk = "medium"
                message = (
                    f"Mood is gradually decreasing "
                    f"({slope:.3f} points per day)."
                )

            # Detect other significant metric deviations
            elif metric in MIN_CHANGE:

                if (
                    abs(z_score) >= 2.0
                    and abs(change) >= MIN_CHANGE[metric]
                ):
                    risk = "medium"
                    message = (
                        f"{metric} has deviated from astronaut "
                        f"{astronaut_id}'s personal baseline. "
                        f"Z-score: {z_score:.2f}, "
                        f"change: {change:.2f}."
                    )

            # Add alert if a condition is met
            if risk is not None:
                alerts.append({
                    "astronaut_id": int(astronaut_id),
                    "metric": metric,
                    "message": message,
                    "risk": risk
                })

    return {
        "trends": trends,
        "alerts": alerts
    }


# Execute analysis when the file is run directly
if __name__ == "__main__":

    data_path = (
        Path(__file__).parent
        / "data"
        / "checkins.csv"
    )

    df = pd.read_csv(data_path)

    results = detect_trends(df)

    print("\n========== TREND ANALYSIS ==========")

    trends_df = pd.DataFrame(results["trends"])

    print(trends_df.to_string(index=False))

    print("\n========== ALERTS ==========")

    if results["alerts"]:

        for alert in results["alerts"]:
            print(alert)

    else:
        print("No alerts generated.")

    print("\nTotal trend records:", len(results["trends"]))
    print("Total alerts:", len(results["alerts"]))
