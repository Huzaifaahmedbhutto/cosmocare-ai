export type Status = "green" | "yellow" | "red";

export type NavTab =
  | "dashboard"
  | "monitoring"
  | "body"
  | "analytics"
  | "wellbeing"
  | "assistant"
  | "reports";

// Exact body part keys used by the teammate's backend API
export type BackendBodyPart = "brain" | "heart" | "torso" | "body";

// Six detailed physiological systems for the Interactive Body view
export type BodySystemId =
  | "nervous"
  | "cardiovascular"
  | "respiratory"
  | "musculoskeletal"
  | "immune"
  | "digestive";

export interface Indicator {
  metric: string;
  label: string;
  value: number;
  unit: string;
  status: Status;
  direction: string | null;
  body_part: string;
  hazards: string[];
  why: string;
  action: string;
  contact_surgeon: boolean;
}

export interface BackendCheckinResult {
  overall_status: Status;
  health_score: number;
  indicators: Indicator[];
  disclaimer: string;
}

export interface CheckinFormValues {
  heart_rate: string;
  systolic: string;
  diastolic: string;
  glucose: string;
  temp: string;
  sleep_hours: string;
  mood: string;
  spo2: string;
  weight: string;
}

export interface TelemetryLogEntry {
  id: string;
  missionDay: number;
  dateLabel: string;
  timestamp: string;
  heart_rate: number;
  systolic: number;
  diastolic: number;
  glucose: number;
  temp: number;
  sleep_hours: number;
  mood: number;
  spo2: number;
  weight: number;
  overall_status: Status;
  health_score: number;
  source: "backend" | "demo-simulation" | "sample-history";
}

export interface WellbeingEntry {
  id: string;
  missionDay: number;
  dateLabel: string;
  timestamp: string;
  mood: number; // 1-10
  stress: number; // 1-10 (higher = more stressed)
  sleepQuality: number; // 1-10
  energy: number; // 1-10
  loneliness: number; // 1-10 (higher = more isolated)
  note: string;
}

export interface BodySystemInfo {
  id: BodySystemId;
  name: string;
  shortLabel: string;
  mappedBodyParts: BackendBodyPart[];
  relatedMetrics: string[];
  functionSummary: string;
  spaceflightHazards: string[];
  warningSigns: string[];
  preventiveRecommendations: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  isDemoMode?: boolean;
}

export interface AstronautProfile {
  name: string;
  callsign: string;
  role: string;
  missionName: string;
  missionDay: number;
  totalMissionDays: number;
  habitat: string;
}