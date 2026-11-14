
"use client";

import React from "react";
import { MEDICAL_DISCLAIMER } from "../data/mockData";
import {
  AstronautProfile,
  BackendCheckinResult,
  TelemetryLogEntry,
  WellbeingEntry,
} from "../types/health";
import { FileTextIcon, PrinterIcon } from "./Icons";

interface ReportsViewProps {
  astronaut: AstronautProfile;
  telemetryHistory: TelemetryLogEntry[];
  latestTelemetry: TelemetryLogEntry;
  latestResult: BackendCheckinResult | null;
  wellbeingHistory: WellbeingEntry[];
}

export function ReportsView({
  astronaut,
  telemetryHistory,
  latestTelemetry,
  latestResult,
  wellbeingHistory,
}: ReportsViewProps) {
  const latestWellbeing = wellbeingHistory[wellbeingHistory.length - 1];
  const overallScore =
    latestResult?.health_score ?? latestTelemetry.health_score;
  const overallStatus =
    latestResult?.overall_status ?? latestTelemetry.overall_status;

  const avgHr = Math.round(
    telemetryHistory.reduce((sum, r) => sum + r.heart_rate, 0) /
      Math.max(1, telemetryHistory.length)
  );
  const avgSleep = (
    telemetryHistory.reduce((sum, r) => sum + r.sleep_hours, 0) /
    Math.max(1, telemetryHistory.length)
  ).toFixed(1);

  const alerts =
    latestResult?.indicators.filter((i) => i.status !== "green") ?? [];

  function handleExportJson() {
    const payload = {
      generatedAt: new Date().toISOString(),
      disclaimer: MEDICAL_DISCLAIMER,
      astronaut,
      overallStatus,
      overallScore,
      latestTelemetry,
      alerts,
      latestWellbeing,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cosmocare-mission-day-${astronaut.missionDay}-report.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Action Header (Hidden when printing) */}
      <div className="no-print cosmo-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <FileTextIcon className="h-6 w-6 text-cyan-300" />
          <div>
            <h2 className="text-lg font-bold text-white">
              Mission Health Summary Report
            </h2>
            <p className="text-xs text-slate-400">
              Printable flight-briefing overview of physical & behavioral metrics
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleExportJson}
            className="rounded-xl border border-sky-400/30 bg-slate-950/80 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400"
          >
            Export JSON Report
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:brightness-110"
          >
            <PrinterIcon className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="cosmo-card print-card space-y-6 rounded-2xl p-6 sm:p-8">
        {/* Report Title & Astronaut Info */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-sky-400/20 pb-5">
          <div>
            <p className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
              COSMOCARE-AI • NASA Hackathon Mission Briefing
            </p>
            <h3 className="mt-1 text-2xl font-bold">
              {astronaut.name} ({astronaut.callsign})
            </h3>
            <p className="mt-1 text-xs opacity-80">
              {astronaut.role} • {astronaut.missionName}
            </p>
            <p className="text-xs opacity-75">
              Habitat: {astronaut.habitat} • Mission Day {astronaut.missionDay}{" "}
              of {astronaut.totalMissionDays}
            </p>
          </div>

          <div className="rounded-xl border border-cyan-400/35 px-4 py-3 text-right">
            <p className="text-[11px] font-semibold uppercase opacity-75">
              Overall Readiness
            </p>
            <p className="text-2xl font-bold">{overallScore}/100</p>
            <p className="text-xs font-bold uppercase">
              Status: {overallStatus}
            </p>
          </div>
        </div>

        {/* Latest Measurements */}
        <div>
          <h4 className="text-sm font-bold tracking-wide uppercase opacity-80">
            1. Latest Health Measurements ({latestTelemetry.dateLabel})
          </h4>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Heart Rate", `${latestTelemetry.heart_rate} bpm`],
              [
                "Blood Pressure",
                `${latestTelemetry.systolic}/${latestTelemetry.diastolic} mmHg`,
              ],
              ["Blood Glucose", `${latestTelemetry.glucose} mg/dL`],
              ["Body Temp", `${latestTelemetry.temp} °C`],
              ["SpO2 Oxygen", `${latestTelemetry.spo2}%`],
              ["Sleep Duration", `${latestTelemetry.sleep_hours} hrs`],
              ["Body Mass", `${latestTelemetry.weight} kg`],
              ["Mood Rating", `${latestTelemetry.mood}/10`],
            ].map(([label, val]) => (
              <div
                key={label}
                className="rounded-xl border border-sky-400/15 bg-slate-950/40 p-3"
              >
                <p className="text-[11px] opacity-70">{label}</p>
                <p className="mt-1 font-mono text-sm font-bold">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Health Trends Summary */}
        <div>
          <h4 className="text-sm font-bold tracking-wide uppercase opacity-80">
            2. Multi-Day Trend Overview ({telemetryHistory.length} Logged Days)
          </h4>
          <p className="mt-2 text-sm leading-relaxed opacity-90">
            Across the recorded mission window, average resting heart rate is{" "}
            <span className="font-mono font-semibold">{avgHr} bpm</span> and
            average sleep duration is{" "}
            <span className="font-mono font-semibold">{avgSleep} hours</span>.
            Weight and oxygen saturation remain closely monitored for microgravity
            deconditioning and cabin atmosphere quality.
          </p>
        </div>

        {/* Alerts */}
        <div>
          <h4 className="text-sm font-bold tracking-wide uppercase opacity-80">
            3. Active Alerts & Deviations
          </h4>
          {alerts.length === 0 ? (
            <p className="mt-2 text-sm text-emerald-400">
              No active yellow or red deviations flagged in the latest assessment.
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {alerts.map((a) => (
                <li
                  key={a.metric}
                  className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3"
                >
                  <span className="font-bold">
                    [{a.status.toUpperCase()}] {a.label}: {a.value} {a.unit}
                  </span>{" "}
                  — {a.action}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mental Wellbeing Summary */}
        {latestWellbeing && (
          <div>
            <h4 className="text-sm font-bold tracking-wide uppercase opacity-80">
              4. Mental & Behavioral Wellbeing Summary ({latestWellbeing.dateLabel})
            </h4>
            <div className="mt-2 rounded-xl border border-sky-400/15 bg-slate-950/40 p-4 text-sm">
              <p>
                Mood: <strong>{latestWellbeing.mood}/10</strong> • Stress:{" "}
                <strong>{latestWellbeing.stress}/10</strong> • Sleep Quality:{" "}
                <strong>{latestWellbeing.sleepQuality}/10</strong> • Energy:{" "}
                <strong>{latestWellbeing.energy}/10</strong> • Isolation:{" "}
                <strong>{latestWellbeing.loneliness}/10</strong>
              </p>
              <p className="mt-2 text-xs opacity-80">
                Reflection Note: &quot;{latestWellbeing.note}&quot;
              </p>
            </div>
          </div>
        )}

        {/* Preventive Recommendations */}
        <div>
          <h4 className="text-sm font-bold tracking-wide uppercase opacity-80">
            5. Preventive Mission Recommendations
          </h4>
          <ul className="mt-2 space-y-1.5 text-sm opacity-90">
            <li>
              • Maintain scheduled aerobic and resistive ARED exercise to counter
              microgravity bone and cardiovascular loss.
            </li>
            <li>
              • Protect 7+ hour circadian sleep windows using morning blue-light
              cues and pre-sleep screen dimming.
            </li>
            <li>
              • Escalate any persistent red indicators directly to the NASA
              flight surgeon per mission protocol.
            </li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="border-t border-sky-400/15 pt-4 text-xs opacity-70">
          {MEDICAL_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}