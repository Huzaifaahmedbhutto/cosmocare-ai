
"use client";

import React, { useState } from "react";
import { BODY_SYSTEMS } from "../data/mockData";
import {
  BackendCheckinResult,
  BodySystemId,
  Status,
  TelemetryLogEntry,
} from "../types/health";
import { AlertIcon, BodyIcon, CheckCircleIcon, ShieldIcon } from "./Icons";

interface InteractiveBodyViewProps {
  latestResult: BackendCheckinResult | null;
  latestTelemetry: TelemetryLogEntry;
  onGoToCheckin: () => void;
}

const RANK: Record<Status, number> = { green: 1, yellow: 2, red: 3 };

const COLOR_HEX: Record<Status, string> = {
  green: "#10b981",
  yellow: "#f59e0b",
  red: "#f43f5e",
};

export function InteractiveBodyView({
  latestResult,
  latestTelemetry,
  onGoToCheckin,
}: InteractiveBodyViewProps) {
  const [selectedId, setSelectedId] = useState<BodySystemId>("cardiovascular");

  function getSystemStatus(id: BodySystemId): Status {
    if (latestResult) {
      const system = BODY_SYSTEMS.find((s) => s.id === id);
      if (system) {
        const matched = latestResult.indicators.filter((ind) => {
          if (id === "respiratory") {
            return ind.metric === "spo2" || ind.metric === "temp";
          }
          if (id === "digestive") {
            return ind.metric === "glucose";
          }
          if (id === "immune") {
            return ind.metric === "temp" || ind.metric === "sleep_hours";
          }
          return system.mappedBodyParts.includes(
            ind.body_part as "brain" | "heart" | "torso" | "body"
          );
        });
        if (matched.length > 0) {
          return matched.reduce<Status>(
            (worst, cur) =>
              RANK[cur.status] > RANK[worst] ? cur.status : worst,
            "green"
          );
        }
      }
    }

    // Fallback baseline evaluation from latest telemetry history
    switch (id) {
      case "nervous":
        if (latestTelemetry.sleep_hours < 5 || latestTelemetry.mood <= 3)
          return "red";
        if (latestTelemetry.sleep_hours < 6.5 || latestTelemetry.mood <= 5)
          return "yellow";
        return "green";
      case "cardiovascular":
        if (
          latestTelemetry.heart_rate > 115 ||
          latestTelemetry.systolic >= 145
        )
          return "red";
        if (latestTelemetry.heart_rate > 95 || latestTelemetry.systolic >= 130)
          return "yellow";
        return "green";
      case "respiratory":
        if (latestTelemetry.spo2 < 92) return "red";
        if (latestTelemetry.spo2 < 95) return "yellow";
        return "green";
      case "digestive":
        if (latestTelemetry.glucose >= 126 || latestTelemetry.glucose < 60)
          return "red";
        if (latestTelemetry.glucose >= 102 || latestTelemetry.glucose < 70)
          return "yellow";
        return "green";
      case "immune":
        if (latestTelemetry.temp >= 38.0) return "red";
        if (latestTelemetry.temp >= 37.4) return "yellow";
        return "green";
      case "musculoskeletal":
        return latestTelemetry.weight < 64.5 ? "yellow" : "green";
    }
  }

  function getLiveReadingsForSystem(id: BodySystemId): string[] {
    switch (id) {
      case "nervous":
        return [
          `Sleep: ${latestTelemetry.sleep_hours} hrs`,
          `Mood: ${latestTelemetry.mood}/10`,
        ];
      case "cardiovascular":
        return [
          `Heart Rate: ${latestTelemetry.heart_rate} bpm`,
          `Blood Pressure: ${latestTelemetry.systolic}/${latestTelemetry.diastolic} mmHg`,
        ];
      case "respiratory":
        return [
          `SpO2: ${latestTelemetry.spo2}%`,
          `Temp: ${latestTelemetry.temp} °C`,
        ];
      case "musculoskeletal":
        return [`Body Mass: ${latestTelemetry.weight} kg`];
      case "immune":
        return [
          `Body Temp: ${latestTelemetry.temp} °C`,
          `Recovery Sleep: ${latestTelemetry.sleep_hours} hrs`,
        ];
      case "digestive":
        return [
          `Fasting Glucose: ${latestTelemetry.glucose} mg/dL`,
          `Body Mass: ${latestTelemetry.weight} kg`,
        ];
    }
  }

  const selectedSystem =
    BODY_SYSTEMS.find((s) => s.id === selectedId) ?? BODY_SYSTEMS[0];
  const selectedStatus = getSystemStatus(selectedSystem.id);

  function svgRegionProps(id: BodySystemId) {
    const status = getSystemStatus(id);
    const active = selectedId === id;
    return {
      onClick: () => setSelectedId(id),
      style: {
        cursor: "pointer",
        fill: COLOR_HEX[status],
        fillOpacity: active ? 0.85 : 0.35,
        stroke: active ? "#ffffff" : COLOR_HEX[status],
        strokeWidth: active ? 2.5 : 1.5,
        transition: "all 0.2s ease",
      } as React.CSSProperties,
    };
  }

  return (
    <div className="space-y-5">
      {/* Top 6-System Selector Pills */}
      <div className="cosmo-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          {BODY_SYSTEMS.map((sys) => {
            const st = getSystemStatus(sys.id);
            const active = sys.id === selectedId;
            return (
              <button
                key={sys.id}
                type="button"
                onClick={() => setSelectedId(sys.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "border-cyan-400 bg-cyan-500/20 text-white shadow-[0_0_15px_-4px_rgba(34,211,238,0.5)]"
                    : "border-sky-400/15 bg-slate-950/60 text-slate-300 hover:border-cyan-400/40"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLOR_HEX[st] }}
                />
                {sys.shortLabel}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onGoToCheckin}
          className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
        >
          Update Vitals
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Futuristic SVG Body */}
        <div className="cosmo-card flex flex-col items-center rounded-2xl p-6 lg:col-span-5">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <BodyIcon className="h-5 w-5 text-cyan-300" />
              <h2 className="text-base font-bold text-white">
                Astronaut Bio-Scan
              </h2>
            </div>
            <span className="text-[11px] font-mono text-cyan-300">
              CLICK A SYSTEM
            </span>
          </div>

          <svg viewBox="0 0 240 430" className="my-4 h-[25rem] w-full max-w-xs">
            {/* Subtle holographic body silhouette */}
            <g fill="rgba(15, 23, 42, 0.75)" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.2">
              <circle cx="120" cy="48" r="30" />
              <rect x="82" y="88" width="76" height="145" rx="22" />
              <rect x="44" y="96" width="26" height="132" rx="13" />
              <rect x="170" y="96" width="26" height="132" rx="13" />
              <rect x="84" y="242" width="28" height="158" rx="14" />
              <rect x="128" y="242" width="28" height="158" rx="14" />
            </g>

            {/* 1. Musculoskeletal (Arms & Legs) */}
            <g {...svgRegionProps("musculoskeletal")}>
              <rect x="47" y="102" width="20" height="118" rx="10" />
              <rect x="173" y="102" width="20" height="118" rx="10" />
              <rect x="88" y="248" width="20" height="144" rx="10" />
              <rect x="132" y="248" width="20" height="144" rx="10" />
            </g>

            {/* 2. Brain & Nervous System */}
            <circle cx="120" cy="48" r="24" {...svgRegionProps("nervous")} />

            {/* 3. Respiratory System (Left & Right Lungs) */}
            <g {...svgRegionProps("respiratory")}>
              <ellipse cx="101" cy="134" rx="13" ry="24" />
              <ellipse cx="139" cy="134" rx="13" ry="24" />
            </g>

            {/* 4. Cardiovascular System (Heart) */}
            <ellipse
              cx="124"
              cy="138"
              rx="13"
              ry="14"
              {...svgRegionProps("cardiovascular")}
            />

            {/* 5. Digestive & Metabolic System (Abdomen) */}
            <rect
              x="92"
              y="170"
              width="56"
              height="48"
              rx="14"
              {...svgRegionProps("digestive")}
            />

            {/* 6. Immune System (Lymphatic / Thymus Nodes) */}
            <g {...svgRegionProps("immune")}>
              <circle cx="120" cy="100" r="8" />
              <circle cx="88" cy="112" r="5" />
              <circle cx="152" cy="112" r="5" />
              <circle cx="105" cy="230" r="5.5" />
              <circle cx="135" cy="230" r="5.5" />
            </g>

            {/* Clean Labels */}
            <g fill="#f8fafc" fontSize="9.5" fontWeight="600" textAnchor="middle" pointerEvents="none">
              <text x="120" y="51">BRAIN</text>
              <text x="120" y="103" fontSize="7.5">IMMUNE</text>
              <text x="95" y="136" fontSize="7.5">LUNG</text>
              <text x="145" y="136" fontSize="7.5">CARDIO</text>
              <text x="120" y="198" fontSize="8">METABOLIC</text>
              <text x="98" y="325" fontSize="7.5">BONE</text>
              <text x="142" y="325" fontSize="7.5">MUSCLE</text>
            </g>
          </svg>

          {/* Status Legend */}
          <div className="flex flex-wrap justify-center gap-5 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              Normal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              Caution
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              Alert
            </span>
          </div>
        </div>

        {/* Right: Detailed Space-Medical System Panel */}
        <div className="cosmo-card space-y-5 rounded-2xl p-6 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-sky-400/15 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-cyan-300 uppercase">
                Selected Physiological System
              </span>
              <h3 className="mt-1 text-2xl font-bold text-white">
                {selectedSystem.name}
              </h3>
            </div>

            <div
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold uppercase ${
                selectedStatus === "green"
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                  : selectedStatus === "yellow"
                  ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                  : "border-rose-500/45 bg-rose-500/15 text-rose-300"
              }`}
            >
              {selectedStatus === "green" ? (
                <CheckCircleIcon className="h-4 w-4" />
              ) : (
                <AlertIcon className="h-4 w-4" />
              )}
              <span>
                {selectedStatus === "green"
                  ? "Normal"
                  : selectedStatus === "yellow"
                  ? "Caution"
                  : "Alert"}
              </span>
            </div>
          </div>

          {/* Live Associated Metrics */}
          <div className="rounded-xl border border-cyan-400/20 bg-slate-950/70 p-4">
            <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
              Latest Live Readings
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              {getLiveReadingsForSystem(selectedSystem.id).map((reading) => (
                <span
                  key={reading}
                  className="rounded-lg border border-sky-400/20 bg-slate-900 px-3 py-1.5 font-mono text-xs text-white"
                >
                  {reading}
                </span>
              ))}
            </div>
          </div>

          {/* Function */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Primary Function
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
              {selectedSystem.functionSummary}
            </p>
          </div>

          {/* Spaceflight Hazards + Warning Signs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-sky-400/15 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-300 uppercase">
                <ShieldIcon className="h-4 w-4" />
                Spaceflight Hazards
              </div>
              <ul className="mt-2.5 space-y-2 text-xs text-slate-300">
                {selectedSystem.spaceflightHazards.map((item) => (
                  <li key={item} className="leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-sky-400/15 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase">
                <AlertIcon className="h-4 w-4" />
                Potential Warning Signs
              </div>
              <ul className="mt-2.5 space-y-2 text-xs text-slate-300">
                {selectedSystem.warningSigns.map((item) => (
                  <li key={item} className="leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Preventive Recommendations */}
          <div className="rounded-xl border border-teal-400/25 bg-teal-500/10 p-4">
            <h4 className="text-xs font-semibold tracking-wider text-teal-200 uppercase">
              Preventive Countermeasures & Guidance
            </h4>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-100">
              {selectedSystem.preventiveRecommendations.map((tip) => (
                <li key={tip} className="leading-relaxed">
                  ✓ {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}