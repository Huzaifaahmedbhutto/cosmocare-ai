import { MEDICAL_DISCLAIMER } from "../data/mockData";
import {
  BackendCheckinResult,
  CheckinFormValues,
  Indicator,
  Status,
  TelemetryLogEntry,
} from "../types/health";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CheckinSubmissionOutcome {
  result: BackendCheckinResult;
  mode: "backend" | "demo-simulation";
  notice?: string;
}

/**
 * Submits the 7 core check-in metrics to the teammate's backend (`POST /api/checkin`).
 * If the backend server is offline, runs an illustrative demo simulation so the
 * frontend remains interactive for testing and demonstrations.
 */
export async function submitDailyCheckin(
  values: CheckinFormValues
): Promise<CheckinSubmissionOutcome> {
  const payload = {
    heart_rate: Number(values.heart_rate),
    systolic: Number(values.systolic),
    diastolic: Number(values.diastolic),
    glucose: Number(values.glucose),
    temp: Number(values.temp),
    sleep_hours: Number(values.sleep_hours),
    mood: Number(values.mood),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Backend returned status ${response.status}. Please check that all values are in range.`
      );
    }

    const data: BackendCheckinResult = await response.json();
    return {
      result: data,
      mode: "backend",
    };
  } catch {
    // Fallback illustrative simulation when backend is offline
    const simulated = buildIllustrativeFallbackResult(values);
    return {
      result: simulated,
      mode: "demo-simulation",
      notice:
        "Backend server (localhost:8000) is not currently running — showing illustrative Demo Simulation results.",
    };
  }
}

/**
 * Illustrative client-side wellness rules (for offline hackathon demo only).
 * Never presents simulated rules as a medical diagnosis.
 */
export function buildIllustrativeFallbackResult(
  values: CheckinFormValues
): BackendCheckinResult {
  const hr = Number(values.heart_rate);
  const sys = Number(values.systolic);
  const dia = Number(values.diastolic);
  const glu = Number(values.glucose);
  const temp = Number(values.temp);
  const sleep = Number(values.sleep_hours);
  const mood = Number(values.mood);
  const spo2 = Number(values.spo2 || 98);

  const indicators: Indicator[] = [
    {
      metric: "heart_rate",
      label: "Resting Heart Rate",
      value: hr,
      unit: "bpm",
      status: hr > 115 || hr < 45 ? "red" : hr > 95 || hr < 52 ? "yellow" : "green",
      direction: hr > 95 ? "elevated" : hr < 52 ? "low" : null,
      body_part: "heart",
      hazards: ["Altered Gravity Fields", "Isolation & Confinement"],
      why: "Microgravity fluid shifts and operational stress can raise resting cardiac workload.",
      action:
        hr > 95
          ? "Pause strenuous tasks, hydrate, and re-check after 10 minutes of calm rest."
          : "Resting pulse is within illustrative baseline range.",
      contact_surgeon: hr > 115 || hr < 45,
    },
    {
      metric: "blood_pressure",
      label: "Blood Pressure",
      value: sys,
      unit: `/${dia} mmHg`,
      status:
        sys >= 145 || dia >= 92
          ? "red"
          : sys >= 130 || dia >= 84
          ? "yellow"
          : "green",
      direction: sys >= 130 || dia >= 84 ? "elevated" : null,
      body_part: "heart",
      hazards: ["Altered Gravity Fields", "Distance from Earth"],
      why: "Fluid redistribution toward the upper torso in microgravity alters arterial pressure.",
      action:
        sys >= 130 || dia >= 84
          ? "Reduce sodium intake for the next meal cycle and repeat cuff reading while seated/tethered."
          : "Blood pressure reading aligns with expected orbital baseline.",
      contact_surgeon: sys >= 145 || dia >= 92,
    },
    {
      metric: "glucose",
      label: "Blood Glucose (Fasting)",
      value: glu,
      unit: "mg/dL",
      status:
        glu >= 126 || glu < 60
          ? "red"
          : glu >= 102 || glu < 70
          ? "yellow"
          : "green",
      direction: glu >= 102 ? "elevated" : glu < 70 ? "low" : null,
      body_part: "torso",
      hazards: ["Hostile & Closed Environment", "Altered Gravity Fields"],
      why: "Reduced physical gravity loading and stress hormones can shift insulin sensitivity.",
      action:
        glu >= 102
          ? "Prioritize scheduled resistive exercise and balanced high-fiber rations."
          : "Fasting glucose is steady within target wellness window.",
      contact_surgeon: glu >= 126 || glu < 60,
    },
    {
      metric: "temp",
      label: "Body Temperature",
      value: temp,
      unit: "°C",
      status: temp >= 38.0 || temp < 35.5 ? "red" : temp >= 37.4 ? "yellow" : "green",
      direction: temp >= 37.4 ? "elevated" : null,
      body_part: "body",
      hazards: ["Space Radiation", "Hostile & Closed Environment"],
      why: "Cabin thermal balance and immune stress under radiation can elevate core temperature.",
      action:
        temp >= 37.4
          ? "Monitor temperature every 4 hours, hydrate well, and check cabin airflow."
          : "Thermal reading is normal.",
      contact_surgeon: temp >= 38.0,
    },
    {
      metric: "sleep_hours",
      label: "Sleep Duration",
      value: sleep,
      unit: "hours",
      status: sleep < 5 ? "red" : sleep < 6.5 ? "yellow" : "green",
      direction: sleep < 6.5 ? "low" : null,
      body_part: "brain",
      hazards: ["Isolation & Confinement", "Hostile & Closed Environment"],
      why: "Lack of natural sunrise/sunset cues and cabin noise frequently shorten orbital sleep.",
      action:
        sleep < 6.5
          ? "Dim console screens 45 minutes prior to sleep window and use acoustic ear protection."
          : "Sleep duration supports cognitive sharpness and immune recovery.",
      contact_surgeon: sleep < 4,
    },
    {
      metric: "mood",
      label: "Mood Assessment",
      value: mood,
      unit: "/10",
      status: mood <= 3 ? "red" : mood <= 5 ? "yellow" : "green",
      direction: mood <= 5 ? "low" : null,
      body_part: "brain",
      hazards: ["Isolation & Confinement", "Distance from Earth"],
      why: "Long-duration confinement and communication lag with Earth increase behavioral strain.",
      action:
        mood <= 5
          ? "Schedule a decompression break, crew check-in, or Earth family audio message."
          : "Emotional wellbeing rating looks steady.",
      contact_surgeon: mood <= 2,
    },
    {
      metric: "spo2",
      label: "Oxygen Saturation (SpO2)",
      value: spo2,
      unit: "%",
      status: spo2 < 92 ? "red" : spo2 < 95 ? "yellow" : "green",
      direction: spo2 < 95 ? "low" : null,
      body_part: "torso",
      hazards: ["Hostile & Closed Environment"],
      why: "Sealed spacecraft cabins require stable oxygen and CO2 scrubbing for healthy gas exchange.",
      action:
        spo2 < 95
          ? "Verify cabin O2/CO2 environmental sensors and perform slow deep-breathing checks."
          : "Oxygen saturation is well within healthy orbital limits.",
      contact_surgeon: spo2 < 92,
    },
  ];

  const hasRed = indicators.some((i) => i.status === "red");
  const yellowCount = indicators.filter((i) => i.status === "yellow").length;
  const redCount = indicators.filter((i) => i.status === "red").length;

  const overall_status: Status = hasRed
    ? "red"
    : yellowCount > 0
    ? "yellow"
    : "green";

  const health_score = Math.max(
    25,
    Math.min(100, 96 - redCount * 18 - yellowCount * 7)
  );

  return {
    overall_status,
    health_score,
    indicators,
    disclaimer: MEDICAL_DISCLAIMER,
  };
}

/**
 * Placeholder service for the AI Health Assistant chat.
 *
 * TEAMMATE INTEGRATION GUIDE:
 * When the backend AI endpoint is ready, replace the mock response below with a fetch()
 * call to your team's endpoint URL (do NOT hardcode API keys in frontend files).
 */
export async function askCosmoCareAssistant(
  question: string,
  latestLog?: TelemetryLogEntry
): Promise<{ reply: string; isDemoMode: boolean }> {
  // Simulate realistic thinking delay so the loading indicator is visible
  await new Promise((resolve) => setTimeout(resolve, 650));

  const q = question.toLowerCase();
  const hrText = latestLog ? `${latestLog.heart_rate} bpm` : "baseline";
  const sleepText = latestLog ? `${latestLog.sleep_hours} hrs` : "baseline";

  if (q.includes("heart") || q.includes("pressure") || q.includes("bp") || q.includes("gravity")) {
    return {
      isDemoMode: true,
      reply:
        `[Demo AI Response] In microgravity, fluids shift upward toward the chest and head, which temporarily changes arterial pressure and resting heart rate (your latest recorded HR is ${hrText}). Countermeasures include daily aerobic exercise, hydration discipline, and cuff checks at heart level. Always follow mission flight-surgeon thresholds for red alerts.`,
    };
  }

  if (q.includes("sleep") || q.includes("circadian") || q.includes("tired") || q.includes("drift")) {
    return {
      isDemoMode: true,
      reply:
        `[Demo AI Response] Orbital sunrises every ~90 minutes can disrupt circadian rhythm (your latest sleep log is ${sleepText}). Try blue-enriched cabin light right after waking, lower screen brightness 45 minutes before sleep, and keep cabin temperatures slightly cool.`,
    };
  }

  if (q.includes("radiation") || q.includes("immune")) {
    return {
      isDemoMode: true,
      reply:
        `[Demo AI Response] Space radiation and confinement stress can subtly alter immune cell signaling. Watch for persistent temperature >= 37.4 °C, slow recovery, or sleep under 6 hours. Preventive habits: consistent 7+ hr rest, antioxidant-rich mission rations, and strict module hygiene.`,
    };
  }

  if (q.includes("stress") || q.includes("isolation") || q.includes("mood") || q.includes("lonely")) {
    return {
      isDemoMode: true,
      reply:
        `[Demo AI Response] 5-Minute Mission Reset Protocol: (1) Step away from alarms/displays if safe. (2) Slow box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold x 6 cycles. (3) Log your Mental Wellbeing check-in and queue a brief crew check-in or Earth message.`,
    };
  }

  return {
    isDemoMode: true,
    reply:
      `[Demo AI Response] Based on your latest Mission Day ${latestLog?.missionDay ?? 42} snapshot (Overall Score: ${latestLog?.health_score ?? 94}/100), keep monitoring your vital trends and daily mental wellbeing check-ins. For specific symptoms or red alerts, always escalate to the NASA flight surgeon. (Ready for backend AI endpoint connection.)`,
  };
}