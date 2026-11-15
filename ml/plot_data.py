
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

# Load the simulated astronaut dataset
BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / "data" / "checkins.csv"
PLOT_DIR = BASE_DIR / "plots"

PLOT_DIR.mkdir(exist_ok=True)

df = pd.read_csv(DATA_PATH)
df["date"] = pd.to_datetime(df["date"])

# Metrics to visualize
charts = [
    ("sleep_hours", "Sleep Hours", "Hours", "sleep_trends.png"),
    ("mood", "Mood Trends", "Mood Score (1-10)", "mood_trends.png"),
    ("heart_rate", "Heart Rate Trends", "Beats per Minute", "heart_rate_trends.png")
]

for metric, title, ylabel, filename in charts:

    plt.figure(figsize=(10, 6))

    for astronaut_id, group in df.groupby("astronaut_id"):
        group = group.sort_values("date")

        plt.plot(
            group["date"],
            group[metric],
            marker="o",
            label=f"Astronaut {astronaut_id}"
        )

    plt.title(title + " - Simulated Mission Data")
    plt.xlabel("Mission Date")
    plt.ylabel(ylabel)
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.xticks(rotation=45)

    plt.tight_layout()

    plt.savefig(PLOT_DIR / filename, dpi=300)
    plt.close()

    print(f"Saved: {filename}")

print("\nAll 3 charts generated successfully!")
