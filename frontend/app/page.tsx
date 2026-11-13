"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Status = "green" | "yellow" | "red";

type Indicator = {
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
};

type Result = {
  overall_status: Status;
  health_score: number;
  indicators: Indicator[];
  disclaimer: string;
};

const FIELDS = [
  { key: "heart_rate", label: "Resting heart rate", unit: "bpm", min: 20, max: 250, step: 1 },
  { key: "systolic", label: "Systolic BP", unit: "mmHg", min: 50, max: 260, step: 1 },
  { key: "diastolic", label: "Diastolic BP", unit: "mmHg", min: 30, max: 160, step: 1 },
  { key: "glucose", label: "Blood glucose (fasting)", unit: "mg/dL", min: 20, max: 600, step: 1 },
  { key: "temp", label: "Body temperature", unit: "°C", min: 30, max: 43, step: 0.1 },
  { key: "sleep_hours", label: "Sleep (last 24 h)", unit: "hours", min: 0, max: 24, step: 0.5 },
  { key: "mood", label: "Mood (1 = very low, 10 = very good)", unit: "/10", min: 1, max: 10, step: 1 },
];

const PRESETS: Record<string, Record<string, string>> = {
  Healthy: { heart_rate: "72", systolic: "115", diastolic: "75", glucose: "90", temp: "36.8", sleep_hours: "7.5", mood: "7" },
  Stressed: { heart_rate: "110", systolic: "135", diastolic: "85", glucose: "105", temp: "37.0", sleep_hours: "5.5", mood: "4" },
  Critical: { heart_rate: "130", systolic: "150", diastolic: "95", glucose: "130", temp: "38.5", sleep_hours: "3", mood: "2" },
};

const COLORS: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  none: "#475569",
};

const RANK: Record<string, number> = { green: 1, yellow: 2, red: 3 };

const PART_NAMES: Record<string, string> = {
  brain: "Brain (sleep, mood)",
  heart: "Heart (heart rate, blood pressure)",
  torso: "Torso (metabolism, blood glucose)",
  body: "Whole body (temperature)",
};

export default function Home() {
  const [form, setForm] = useState<Record<string, string>>(PRESETS.Healthy);
  const [result, setResult] = useState<Result | null>(null);
  const [part, setPart] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body: Record<string, number> = {};
      for (const f of FIELDS) body[f.key] = Number(form[f.key]);
      const res = await fetch(`${API}/api/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Please check that all values are in a valid range.");
      setResult(await res.json());
      setPart(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function partStatus(p: string): string {
    if (!result) return "none";
    const items = result.indicators.filter((i) => i.body_part === p);
    if (items.length === 0) return "none";
    return items.reduce((w, i) => (RANK[i.status] > RANK[w] ? i.status : w), "green" as string);
  }

  const shown = result
    ? part
      ? result.indicators.filter((i) => i.body_part === part)
      : result.indicators
    : [];

  const partProps = (p: string) => ({
    onClick: () => setPart(p),
    style: { cursor: "pointer", fill: COLORS[partStatus(p)], opacity: part === p ? 1 : 0.75 } as React.CSSProperties,
    stroke: part === p ? "#ffffff" : "#0f172a",
    strokeWidth: part === p ? 3 : 1.5,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-5">
        <h1 className="text-2xl font-bold">CosmoCare AI</h1>
        <p className="text-sm text-slate-400">
          Astronaut self-assessment companion. Demo tool with simulated data, not a medical device.
        </p>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-3">
        {/* Check-in form */}
        <form onSubmit={submit} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-3 text-lg font-semibold">Daily health check-in</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((name) => (
              <button
                type="button"
                key={name}
                onClick={() => setForm(PRESETS[name])}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
              >
                Load {name}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {FIELDS.map((f) => (
              <label key={f.key} className="block text-sm">
                <span className="text-slate-300">
                  {f.label} <span className="text-slate-500">({f.unit})</span>
                </span>
                <input
                  type="number"
                  required
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                />
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-md bg-cyan-500 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Assess my health"}
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </form>

        {/* Body figure */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-1 text-lg font-semibold">Body status</h2>
          <p className="mb-3 text-xs text-slate-400">Tap a body part to see its indicators.</p>
          <svg viewBox="0 0 200 380" className="mx-auto h-96">
            {/* whole body (arms and legs) */}
            <g {...partProps("body")}>
              <rect x="38" y="108" width="24" height="120" rx="12" />
              <rect x="138" y="108" width="24" height="120" rx="12" />
              <rect x="70" y="228" width="26" height="140" rx="12" />
              <rect x="104" y="228" width="26" height="140" rx="12" />
            </g>
            {/* torso */}
            <rect x="65" y="102" width="70" height="130" rx="18" {...partProps("torso")} />
            {/* head / brain */}
            <circle cx="100" cy="55" r="34" {...partProps("brain")} />
            {/* heart */}
            <ellipse cx="112" cy="145" rx="18" ry="16" {...partProps("heart")} />
            <text x="100" y="60" textAnchor="middle" fontSize="12" fill="#0f172a" pointerEvents="none">brain</text>
            <text x="112" y="149" textAnchor="middle" fontSize="11" fill="#0f172a" pointerEvents="none">heart</text>
            <text x="86" y="205" textAnchor="middle" fontSize="11" fill="#0f172a" pointerEvents="none">torso</text>
          </svg>
          <div className="mt-3 flex justify-center gap-4 text-xs text-slate-400">
            {(["green", "yellow", "red"] as Status[]).map((s) => (
              <span key={s} className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: COLORS[s] }} />
                {s === "green" ? "Normal" : s === "yellow" ? "Caution" : "Alert"}
              </span>
            ))}
          </div>
        </section>

        {/* Results */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-3 text-lg font-semibold">Results and guidance</h2>
          {!result && <p className="text-sm text-slate-400">Fill in your check-in and press "Assess my health".</p>}
          {result && (
            <>
              <div
                className="mb-4 rounded-lg p-4 text-slate-950"
                style={{ background: COLORS[result.overall_status] }}
              >
                <p className="text-sm font-medium uppercase">Overall: {result.overall_status}</p>
                <p className="text-3xl font-bold">{result.health_score}/100</p>
              </div>
              {part && (
                <button onClick={() => setPart(null)} className="mb-3 text-xs text-cyan-400 underline">
                  Showing: {PART_NAMES[part]} (show all)
                </button>
              )}
              <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                {shown.map((i) => (
                  <div
                    key={i.metric}
                    className="rounded-lg border-l-4 bg-slate-950 p-3 text-sm"
                    style={{ borderColor: COLORS[i.status] }}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold">{i.label}</span>
                      <span className="font-mono">
                        {i.value} {i.unit}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-300">{i.action}</p>
                    <p className="mt-1 text-xs text-slate-500">{i.why}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {i.hazards.map((h) => (
                        <span key={h} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                          {h}
                        </span>
                      ))}
                    </div>
                    {i.contact_surgeon && (
                      <p className="mt-2 text-xs font-semibold text-red-400">Contact the flight surgeon.</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">{result.disclaimer}</p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}