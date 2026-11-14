
import pandas as pd
import numpy as np
from pathlib import Path

rng = np.random.default_rng(42)

astronaut_ids = [1, 2, 3, 4]
dates = pd.date_range(start="2026-11-01", periods=14, freq="D")

records = []

for astronaut_id in astronaut_ids:
    for day in range(14):

        # Normal variation in physical health measurements
        heart_rate = rng.normal(74, 2.5)
        systolic = rng.normal(110, 2.0)
        diastolic = rng.normal(70, 2.0)
        glucose = rng.normal(88, 2.5)
        temp = rng.normal(36.7, 0.10)

        # Controlled sleep and mood variation
        sleep_hours = rng.normal(7.7, 0.10)
        mood = rng.normal(8.4, 0.15)

        # Gradual isolation-related changes for astronaut 3
        if astronaut_id == 3:
            sleep_hours -= day * 0.065
            mood -= day * 0.14

        # Milder gradual changes for astronaut 4
        if astronaut_id == 4:
            sleep_hours -= day * 0.045
            mood -= day * 0.09

        records.append({
            "date": dates[day],
            "astronaut_id": astronaut_id,
            "heart_rate": round(np.clip(heart_rate, 60, 100), 1),
            "systolic": round(np.clip(systolic, 90, 120), 1),
            "diastolic": round(np.clip(diastolic, 60, 80), 1),
            "glucose": round(np.clip(glucose, 70, 99), 1),
            "temp": round(np.clip(temp, 36.1, 37.2), 2),
            "sleep_hours": round(np.clip(sleep_hours, 6, 8), 2),
            "mood": round(np.clip(mood, 6, 9), 1)
        })

df = pd.DataFrame(records)

output_path = Path(__file__).parent / "data" / "checkins.csv"
df.to_csv(output_path, index=False)

print("Dataset generated successfully!")
print("Dataset shape:", df.shape)
print("\nAverage sleep and mood by astronaut:")
print(
    df.groupby("astronaut_id")[["sleep_hours", "mood"]]
    .mean()
    .round(2)
)
print("\nDataset saved at:", output_path)
