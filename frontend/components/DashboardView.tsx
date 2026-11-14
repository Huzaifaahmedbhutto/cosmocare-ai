
"use client";

import React from "react";
import { NASA_FIVE_HAZARDS } from "../data/mockData";
import {
  AstronautProfile,
  BackendCheckinResult,
  NavTab,
  TelemetryLogEntry,
  WellbeingEntry,
} from "../types/health";
import {
  AlertIcon,
  BodyIcon,
  BotIcon,
  BrainIcon,
  ChartIcon,
  CheckCircleIcon,
  FileTextIcon,
  HeartPulseIcon,
} from "./Icons";

interface DashboardViewProps {
  astronaut: AstronautProfile;
  latestTelemetry: TelemetryLogEntry;
  latestResult: BackendCheckinResult | null;
  hasCompletedTodayCheckin: boolean;
  latestWellbeing: WellbeingEntry;
  onNavigate: (tab: NavTab) => void;
}

export function DashboardView({
  astronaut,
  latestTelemetry,
  latestResult,
  hasCompletedTodayCheckin,
  latestWellbeing,
  onNavigate,
}: DashboardViewProps) {
  const overallStatus =
    latestResult?.overall_status ?? latestTelemetry.overall_status;
  const healthScore =
    latestResult?.health_score ?? latestTelemetry.health_score;

  const alertIndicators =
    latestResult?.indicators.filter((i) => i.status !== "green") ?? [];

  const statusColor =
    overallStatus === "green"
      ? "text-emerald-300 border-emerald-400/35 bg-emerald-500/10"
      : overallStatus === "yellow"
      ? "text-amber-300 border-amber-400/35 bg-amber-500/10"
      : "text-rose-300 border-rose-500/40 bg-rose-500/10";

  const vitalCards = [
    {
      label: "Heart Rate",
      value: `${latestTelemetry.heart_rate}`,
      unit: "bpm",
      ok: latestTelemetry.heart_rate >= 52 && latestTelemetry.heart_rate <= 95,
    },
    {
      label: "Blood Pressure",
      value: `${latestTelemetry.systolic}/${latestTelemetry.diastolic}`,
      unit: "mmHg",
      ok: latestTelemetry.systolic < 130 && latestTelemetry.diastolic < 84,
    },
    {
      label: "Blood Glucose",
      value: `${latestTelemetry.glucose}`,
      unit: "mg/dL",
      ok: latestTelemetry.glucose >= 70 && latestTelemetry.glucose <= 102,
    },
    {
      label: "Body Temp",
      value: `${latestTelemetry.temp}`,
      unit: "°C",
      ok: latestTelemetry.temp >= 35.8 && latestTelemetry.temp < 37.4,
    },
    {
      label: "SpO2 Oxygen",
      value: `${latestTelemetry.spo2}`,
      unit: "%",
      ok: latestTelemetry.spo2 >= 95,
    },
    {
      label: "Sleep (24h)",
      value: `${latestTelemetry.sleep_hours}`,
      unit: "hrs",
      ok: latestTelemetry.sleep_hours >= 6.5,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Hero Row: Astronaut Profile + Overall Readiness */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="cosmo-card cosmo-card-glow rounded-2xl p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                MISSION DAY {astronaut.missionDay} OF {astronaut.totalMissionDays}
              </span>
              <h2 className="mt-3 text-2xl font-bold text-white">
                Welcome back, {astronaut.name}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                {astronaut.role} • Callsign{" "}
                <span className="font-mono text-cyan-300">{astronaut.callsign}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {astronaut.missionName} — {astronaut.habitat}
              </p>
            </div>

            <div className={`rounded-2xl border px-4 py-3 text-right ${statusColor}`}>
              <p className="text-[11px] font-semibold tracking-wider uppercase">
                Overall Health Index
              </p>
              <p className="mt-1 text-3xl font-bold">{healthScore}/100</p>
              <p className="text-xs font-medium uppercase">
                Status: {overallStatus}
              </p>
            </div>
          </div>

          {/* Daily Check-in Progress Bar */}
          <div className="mt-5 rounded-xl border border-sky-400/15 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {hasCompletedTodayCheckin ? (
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                ) : (
                  <HeartPulseIcon className="h-5 w-5 text-cyan-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {hasCompletedTodayCheckin
                      ? `Mission Day ${astronaut.missionDay} Check-in Logged`
                      : `Daily Check-in Pending for Mission Day ${astronaut.missionDay}`}
                  </p>
                  <p className="text-xs text-slate-400">
                    {hasCompletedTodayCheckin
                      ? "Your latest biometrics and body telemetry are synced across all views."
                      : "Complete your daily vitals assessment to refresh body system indicators."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate("monitoring")}
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:brightness-110"
              >
                {hasCompletedTodayCheckin ? "Update Check-in" : "Start Check-in"}
              </button>
            </div>
          </div>
        </div>

        {/* Mental Wellbeing Snapshot Card */}
        <div className="cosmo-card flex flex-col justify-between rounded-2xl p-5">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Behavioral & Mood Snapshot
              </h3>
              <BrainIcon className="h-5 w-5 text-violet-300" />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Latest log ({latestWellbeing.dateLabel})
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-sky-400/15 bg-slate-950/60 p-3">
                <p className="text-[11px] text-slate-400">Mood</p>
                <p className="mt-0.5 text-xl font-bold text-cyan-300">
                  {latestWellbeing.mood}/10
                </p>
              </div>
              <div className="rounded-xl border border-sky-400/15 bg-slate-950/60 p-3">
                <p className="text-[11px] text-slate-400">Energy</p>
                <p className="mt-0.5 text-xl font-bold text-teal-300">
                  {latestWellbeing.energy}/10
                </p>
              </div>
              <div className="rounded-xl border border-sky-400/15 bg-slate-950/60 p-3">
                <p className="text-[11px] text-slate-400">Stress Load</p>
                <p className="mt-0.5 text-xl font-bold text-amber-300">
                  {latestWellbeing.stress}/10
                </p>
              </div>
              <div className="rounded-xl border border-sky-400/15 bg-slate-950/60 p-3">
                <p className="text-[11px] text-slate-400">Isolation</p>
                <p className="mt-0.5 text-xl font-bold text-violet-300">
                  {latestWellbeing.loneliness}/10
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("wellbeing")}
            className="mt-4 w-full rounded-xl border border-violet-400/30 bg-violet-500/15 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/25"
          >
            Log Mental Wellbeing Check-in
          </button>
        </div>
      </div>

      {/* Health Summary Cards Grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">
            Latest Biometric Readings ({latestTelemetry.dateLabel})
          </h3>
          <button
            type="button"
            onClick={() => onNavigate("analytics")}
            className="text-xs font-medium text-cyan-300 hover:underline"
          >
            View Historical Trends →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          {vitalCards.map((card) => (
            <div
              key={card.label}
              className="cosmo-card rounded-2xl p-4 transition hover:border-cyan-400/35"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{card.label}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    card.ok ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                {card.value}{" "}
                <span className="text-xs font-normal text-slate-400">
                  {card.unit}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts + Quick Access */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="cosmo-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">
              Recent Telemetry Alerts
            </h3>
            <AlertIcon className="h-5 w-5 text-amber-300" />
          </div>

          <div className="mt-4 space-y-3">
            {alertIndicators.length > 0 ? (
              alertIndicators.map((item) => (
                <div
                  key={item.metric}
                  className={`rounded-xl border-l-4 bg-slate-950/70 p-3.5 text-sm ${
                    item.status === "red"
                      ? "border-rose-500"
                      : "border-amber-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {item.label}
                    </span>
                    <span className="font-mono text-xs text-slate-300">
                      {item.value} {item.unit}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{item.action}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4">
                <p className="text-sm font-semibold text-emerald-200">
                  All Active Biometrics Nominal
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  No active yellow or red deviations detected in your latest reading. Keep following scheduled aerobic and sleep hygiene countermeasures.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-sky-400/15 bg-slate-950/60 p-3.5 text-xs text-slate-300">
              <span className="font-semibold text-cyan-300">
                Historical Note (Day 35):{" "}
              </span>
              Brief dip in sleep duration (5.5 hrs) and elevated resting HR (88 bpm) resolved after sleep schedule adjustment.
            </div>
          </div>
        </div>

        {/* Quick Navigation Grid */}
        <div className="cosmo-card rounded-2xl p-5">
          <h3 className="text-base font-semibold text-white">
            Quick Mission Access
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Jump directly to any spaceflight health subsystem
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigate("body")}
              className="flex items-center gap-3 rounded-xl border border-sky-400/20 bg-slate-950/70 p-3.5 text-left transition hover:border-cyan-400/45 hover:bg-slate-900"
            >
              <BodyIcon className="h-5 w-5 shrink-0 text-cyan-300" />
              <div>
                <p className="text-sm font-semibold text-white">Body Systems</p>
                <p className="text-[11px] text-slate-400">6 clickable systems</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("analytics")}
              className="flex items-center gap-3 rounded-xl border border-sky-400/20 bg-slate-950/70 p-3.5 text-left transition hover:border-cyan-400/45 hover:bg-slate-900"
            >
              <ChartIcon className="h-5 w-5 shrink-0 text-teal-300" />
              <div>
                <p className="text-sm font-semibold text-white">Trend Charts</p>
                <p className="text-[11px] text-slate-400">Vitals & mood history</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("assistant")}
              className="flex items-center gap-3 rounded-xl border border-sky-400/20 bg-slate-950/70 p-3.5 text-left transition hover:border-cyan-400/45 hover:bg-slate-900"
            >
              <BotIcon className="h-5 w-5 shrink-0 text-violet-300" />
              <div>
                <p className="text-sm font-semibold text-white">AI Companion</p>
                <p className="text-[11px] text-slate-400">Ask health questions</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("reports")}
              className="flex items-center gap-3 rounded-xl border border-sky-400/20 bg-slate-950/70 p-3.5 text-left transition hover:border-cyan-400/45 hover:bg-slate-900"
            >
              <FileTextIcon className="h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <p className="text-sm font-semibold text-white">Mission Report</p>
                <p className="text-[11px] text-slate-400">Printable summary</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* NASA's 5 Hazards of Human Spaceflight */}
      <div className="cosmo-card rounded-2xl p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-white">
              NASA&apos;s 5 Hazards of Human Spaceflight
            </h3>
            <p className="text-xs text-slate-400">
              How COSMOCARE-AI maps daily health metrics to deep-space mission risks
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("body")}
            className="text-xs font-medium text-cyan-300 hover:underline"
          >
            Inspect Body Impact →
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {NASA_FIVE_HAZARDS.map((hazard, index) => (
            <div
              key={hazard.id}
              className="rounded-xl border border-sky-400/15 bg-slate-950/70 p-3.5"
            >
              <span className="text-[10px] font-bold tracking-wider text-cyan-300 uppercase">
                Hazard 0{index + 1}
              </span>
              <h4 className="mt-1 text-sm font-semibold text-white">
                {hazard.title}
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                {hazard.summary}
              </p>
              <p className="mt-2 text-[11px] font-medium text-teal-300">
                Focus: {hazard.focus}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}