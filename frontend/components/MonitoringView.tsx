
"use client";

import React, { useState } from "react";
import { CHECKIN_FIELDS, CHECKIN_PRESETS } from "../data/mockData";
import {
  CheckinSubmissionOutcome,
  submitDailyCheckin,
} from "../services/healthApi";
import {
  BackendCheckinResult,
  CheckinFormValues,
  Status,
  TelemetryLogEntry,
} from "../types/health";
import { AlertIcon, CheckCircleIcon, HeartPulseIcon } from "./Icons";

interface MonitoringViewProps {
  latestResult: BackendCheckinResult | null;
  lastMode: "backend" | "demo-simulation" | null;
  lastNotice: string;
  telemetryHistory: TelemetryLogEntry[];
  onCheckinComplete: (
    values: CheckinFormValues,
    outcome: CheckinSubmissionOutcome
  ) => void;
  onJumpToBody: () => void;
}

const STATUS_BADGE: Record<Status, string> = {
  green: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
  yellow: "border-amber-400/40 bg-amber-500/15 text-amber-300",
  red: "border-rose-500/45 bg-rose-500/15 text-rose-300",
};

const BORDER_COLOR: Record<Status, string> = {
  green: "border-l-emerald-400",
  yellow: "border-l-amber-400",
  red: "border-l-rose-500",
};

export function MonitoringView({
  latestResult,
  lastMode,
  lastNotice,
  telemetryHistory,
  onCheckinComplete,
  onJumpToBody,
}: MonitoringViewProps) {
  const [form, setForm] = useState<CheckinFormValues>(CHECKIN_PRESETS.Healthy);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");

  function validateForm(): string | null {
    for (const field of CHECKIN_FIELDS) {
      const raw = form[field.key].trim();
      if (!raw) {
        return `Please enter a value for ${field.label}.`;
      }
      const num = Number(raw);
      if (Number.isNaN(num) || num < field.min || num > field.max) {
        return `${field.label} must be between ${field.min} and ${field.max} ${field.unit}.`;
      }
    }
    if (Number(form.systolic) <= Number(form.diastolic)) {
      return "Systolic BP should be higher than Diastolic BP.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setValidationError(err);
      return;
    }

    setValidationError("");
    setLoading(true);
    try {
      const outcome = await submitDailyCheckin(form);
      onCheckinComplete(form, outcome);
    } finally {
      setLoading(false);
    }
  }

  const filteredIndicators = latestResult
    ? filterStatus === "all"
      ? latestResult.indicators
      : latestResult.indicators.filter((i) => i.status === filterStatus)
    : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Left: Measurement Cards & Check-in Form */}
        <form
          onSubmit={handleSubmit}
          className="cosmo-card rounded-2xl p-5 xl:col-span-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-400/15 pb-4">
            <div className="flex items-center gap-2.5">
              <HeartPulseIcon className="h-5 w-5 text-cyan-300" />
              <div>
                <h2 className="text-lg font-bold text-white">
                  Daily Biometric Check-in
                </h2>
                <p className="text-xs text-slate-400">
                  Enter your measurements or load a mission simulation preset
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.keys(CHECKIN_PRESETS).map((presetName) => (
                <button
                  key={presetName}
                  type="button"
                  onClick={() => {
                    setForm(CHECKIN_PRESETS[presetName]);
                    setValidationError("");
                  }}
                  className="rounded-full border border-sky-400/25 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200"
                >
                  Load {presetName}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            {CHECKIN_FIELDS.map((field) => (
              <div
                key={field.key}
                className="rounded-xl border border-sky-400/15 bg-slate-950/65 p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <label
                    htmlFor={`field-${field.key}`}
                    className="text-sm font-semibold text-white"
                  >
                    {field.label}
                  </label>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                    {field.normalRange}
                  </span>
                </div>

                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  {field.instruction}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    id={`field-${field.key}`}
                    type="number"
                    required
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={form[field.key]}
                    onChange={(e) =>
                      setForm({ ...form, [field.key]: e.target.value })
                    }
                    className="w-full rounded-lg border border-sky-400/20 bg-slate-900 px-3 py-2 text-sm font-mono text-white outline-none focus:border-cyan-400"
                  />
                  <span className="shrink-0 text-xs font-medium text-slate-400">
                    {field.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {validationError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-200">
              <AlertIcon className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400">
              Core 7 metrics are sent to your teammate&apos;s backend (`/api/checkin`) with automatic demo fallback if offline.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-[0_0_20px_-5px_rgba(34,211,238,0.6)] transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Analyzing Telemetry..." : "Assess My Health"}
            </button>
          </div>
        </form>

        {/* Right: Assessment Results & Guidance */}
        <div className="cosmo-card flex flex-col rounded-2xl p-5 xl:col-span-5">
          <div className="flex items-center justify-between border-b border-sky-400/15 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Assessment & Guidance
              </h2>
              <p className="text-xs text-slate-400">
                Color-coded spaceflight status & preventive actions
              </p>
            </div>
            {latestResult && (
              <button
                type="button"
                onClick={onJumpToBody}
                className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
              >
                Inspect on Body →
              </button>
            )}
          </div>

          {!latestResult ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <HeartPulseIcon className="h-10 w-10 text-cyan-400/70" />
              <p className="mt-3 text-sm font-semibold text-white">
                Ready for Daily Assessment
              </p>
              <p className="mt-1 max-w-xs text-xs text-slate-400">
                Review the measurements on the left (or click a preset like &quot;Load Stressed&quot;) and press &quot;Assess My Health&quot;.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {lastMode === "demo-simulation" && lastNotice && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2 text-[11px] text-amber-200">
                  {lastNotice}
                </div>
              )}

              {lastMode === "backend" && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2 text-[11px] text-emerald-200">
                  <CheckCircleIcon className="h-4 w-4 shrink-0" />
                  <span>Connected to live teammate backend API (`/api/checkin`).</span>
                </div>
              )}

              {/* Overall Score Box */}
              <div
                className={`flex items-center justify-between rounded-2xl border p-4 ${
                  STATUS_BADGE[latestResult.overall_status]
                }`}
              >
                <div>
                  <p className="text-xs font-semibold uppercase">
                    Overall Status: {latestResult.overall_status}
                  </p>
                  <p className="mt-0.5 text-xs opacity-85">
                    Based on {latestResult.indicators.length} monitored indicators
                  </p>
                </div>
                <p className="text-3xl font-bold">
                  {latestResult.health_score}/100
                </p>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2">
                {(["all", "green", "yellow", "red"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilterStatus(status)}
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                      filterStatus === status
                        ? "bg-cyan-400 text-slate-950"
                        : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-400/40"
                    }`}
                  >
                    {status === "all"
                      ? "All"
                      : status === "green"
                      ? "Normal"
                      : status === "yellow"
                      ? "Caution"
                      : "Alert"}
                  </button>
                ))}
              </div>

              {/* Indicator Cards */}
              <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                {filteredIndicators.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No indicators in this status category.
                  </p>
                ) : (
                  filteredIndicators.map((ind) => (
                    <div
                      key={ind.metric}
                      className={`rounded-xl border border-sky-400/10 border-l-4 bg-slate-950/75 p-3.5 ${
                        BORDER_COLOR[ind.status]
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-white">
                          {ind.label}
                        </span>
                        <span className="font-mono text-sm font-bold text-cyan-200">
                          {ind.value} {ind.unit}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                        {ind.action}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">{ind.why}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {ind.hazards.map((h) => (
                          <span
                            key={h}
                            className="rounded-full bg-slate-800/90 px-2 py-0.5 text-[10px] text-cyan-200"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                      {ind.contact_surgeon && (
                        <p className="mt-2 text-xs font-bold text-rose-400">
                          ⚠ Threshold exceeded: Contact Mission Flight Surgeon.
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Logged Submissions Table */}
      <div className="cosmo-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white">
          Recent Check-in History (Saved in Browser)
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-sky-400/15 text-slate-400">
                <th className="py-2 pr-3">Day</th>
                <th className="py-2 pr-3">Score</th>
                <th className="py-2 pr-3">HR (bpm)</th>
                <th className="py-2 pr-3">BP (mmHg)</th>
                <th className="py-2 pr-3">Glucose</th>
                <th className="py-2 pr-3">Temp</th>
                <th className="py-2 pr-3">SpO2</th>
                <th className="py-2 pr-3">Sleep</th>
                <th className="py-2">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-400/10 text-slate-200">
              {[...telemetryHistory]
                .reverse()
                .slice(0, 6)
                .map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5 pr-3 font-semibold text-white">
                      {row.dateLabel}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          row.overall_status === "green"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : row.overall_status === "yellow"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {row.health_score}/100
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 font-mono">{row.heart_rate}</td>
                    <td className="py-2.5 pr-3 font-mono">
                      {row.systolic}/{row.diastolic}
                    </td>
                    <td className="py-2.5 pr-3 font-mono">{row.glucose}</td>
                    <td className="py-2.5 pr-3 font-mono">{row.temp} °C</td>
                    <td className="py-2.5 pr-3 font-mono">{row.spo2}%</td>
                    <td className="py-2.5 pr-3 font-mono">
                      {row.sleep_hours}h
                    </td>
                    <td className="py-2.5 text-slate-400">{row.source}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}