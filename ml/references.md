# CosmoCare AI - References and Reference Ranges

## 1. NASA Human Research Program - 5 Hazards of Human Spaceflight

NASA identifies five major hazards of human spaceflight: space radiation, isolation and confinement, distance from Earth, altered gravity fields, and hostile closed environments. These hazards can affect astronaut health, behaviour, sleep and performance. CosmoCare AI links each health indicator to the related hazard(s).

Source: https://www.nasa.gov/hrp/hazards/

## 2. NASA - Isolation and Confinement

NASA discusses how isolation and confinement can contribute to sleep loss, circadian disruption and performance difficulties. Used as background for the sleep and mood trend analysis.

Source: https://www.nasa.gov/hrp/hazard-isolation-and-confinement/

## 3. NASA Human Research Program - Risks and Ongoing Research

Used as background on the health risks of spaceflight and on how indicators are chosen.

Sources:
- https://www.nasa.gov/hrp/risks/
- https://www.nasa.gov/hrp/ongoing-hrp-research/

## 4. Canadian Space Agency (CSA)

Background reading on radiation monitoring and astronaut health research.

Sources:
- https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp

## 5. MedlinePlus - Vital Signs

General reference for resting vital signs of a healthy adult: pulse 60 to 100 beats per minute, blood pressure between 90/60 and 120/80 mmHg, temperature 36.5 to 37.3 C.

Source: https://medlineplus.gov/ency/article/002341.htm

## 6. CDC - Diabetes Testing

Reference for fasting blood glucose: normal is 99 mg/dL or below, 100 to 125 mg/dL is the prediabetes range, and 126 mg/dL or above is the diabetes range.

Source: https://www.cdc.gov/diabetes/diabetes-testing/index.html

## 7. How the reference ranges in the app were set

| Indicator | Green (normal) | Basis |
|---|---|---|
| Resting heart rate | 60 - 100 bpm | MedlinePlus |
| Systolic blood pressure | 90 - 119.9 mmHg | MedlinePlus (up to 120/80) |
| Diastolic blood pressure | 60 - 79.9 mmHg | MedlinePlus (up to 120/80) |
| Fasting glucose | 70 - 99.9 mg/dL | Upper limit from CDC; the 70 mg/dL lower limit is a common low-glucose threshold and is not taken from the CDC page |
| Body temperature | 36.1 - 37.2 C | Adapted from MedlinePlus (36.5 - 37.3 C); slightly wider band |
| Sleep | 7 hours or more | Illustrative simulation assumption |
| Mood (1 to 10) | 6 - 10 | Illustrative simulation assumption |

The yellow (caution) and red (alert) cut-offs and the 0 to 100 health score penalties (10 per yellow indicator, 25 per red indicator) are project-defined for demonstration and are not clinical guidelines. These are general adult reference values, not NASA-specific ranges.

## 8. Dataset and Simulation Disclaimer

The dataset used in this project is synthetically generated for demonstration purposes.

It contains simulated measurements for four astronauts over fourteen days. The gradual sleep and mood changes are artificially introduced to demonstrate personal-baseline monitoring and trend detection.

These records are NOT actual astronaut health data.

The simulated values and alert thresholds are intended for software demonstration, not medical diagnosis or clinical decision-making.

Sleep and mood values are illustrative simulation assumptions, not universal clinical reference ranges.