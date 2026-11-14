
"use client";

import React, { useState } from "react";
import { TelemetryLogEntry } from "../types/health";
import { ChartIcon } from "./Icons";

interface AnalyticsViewProps {
  telemetryHistory: TelemetryLogEntry[];
}

type TimeRange = "daily" | "weekly" | "monthly";

interface ChartSeriesPoint {
  label: string;
  primary: number;
  secondary?: number;
}

interface TrendChartProps {
  title: string;
  unit: string;
  color: string;
  secondaryColor?: string;
  primaryLabel: string;
  secondaryLabel?: string;
  points: ChartSeriesPoint[];
  minDomain?: number;
  maxDomain?: number;
}

function TrendChart({
  title,
  unit,
  color,
  secondaryColor,
  primaryLabel,
  secondaryLabel,
  points,
  minDomain,
  maxDomain,
}: TrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 520;
  const height = 190;
  const padLeft = 40;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 30;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const allValues = points.flatMap((p) =>
    p.secondary !== undefined ? [p.primary, p.secondary] : [p.primary]
  );

  const rawMin = minDomain ?? Math.min(...allValues);
  const rawMax = maxDomain ?? Math.max(...allValues);
  const span = rawMax - rawMin || 1;
  const yMin = rawMin - span * 0.12;
  const yMax = rawMax + span * 0.12;

  function xFor(i: number) {
    if (points.length <= 1) return padLeft + innerW / 2;
    return padLeft + (i / (points.length - 1)) * innerW;
  }

  function yFor(val: number) {
    return padTop + innerH - ((val - yMin) / (yMax - yMin || 1)) * innerH;
  }

  const primaryLine = points
    .map((p, i) => `${xFor(i)},${yFor(p.primary)}`)
    .join(" ");

  const areaPath =
    points.length > 0
      ? `M ${xFor(0)},${padTop + innerH} ` +
        points.map((p, i) => `L ${xFor(i)},${yFor(p.primary)}`).join(" ") +
        ` L ${xFor(points.length - 1)},${padTop + innerH} Z`
      : "";

  const secondaryLine =
    secondaryColor && points.every((p) => p.secondary !== undefined)
      ? points.map((p, i) => `${xFor(i)},${yFor(p.secondary as number)}`).join(" ")
      : "";

  const activePoint =
    hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  const gradId = `grad-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="cosmo-card rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {primaryLabel}
            </span>
            {secondaryLabel && secondaryColor && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: secondaryColor }}
                />
                {secondaryLabel}
              </span>
            )}
          </div>
        </div>

        {activePoint && (
          <div className="rounded-xl border border-sky-400/20 bg-slate-950/75 px-3 py-1.5 text-right">
            <p className="text-[10px] font-semibold text-cyan-300 uppercase">
              {activePoint.label}
            </p>
            <p className="font-mono text-sm font-bold text-white">
              {activePoint.primary}
              {activePoint.secondary !== undefined
                ? ` / ${activePoint.secondary}`
                : ""}{" "}
              <span className="text-[11px] font-normal text-slate-400">
                {unit}
              </span>
            </p>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 h-48 w-full overflow-visible"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal dashed grid lines + Y labels */}
        {[0, 0.5, 1].map((ratio) => {
          const val = yMin + ratio * (yMax - yMin);
          const y = yFor(val);
          return (
            <g key={ratio}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="rgba(148, 163, 184, 0.16)"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="#94a3b8"
              >
                {Number.isInteger(val) ? val : val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Area Fill */}
        {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}

        {/* Primary Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={primaryLine}
        />

        {/* Secondary Line (e.g., Diastolic BP) */}
        {secondaryLine && secondaryColor && (
          <polyline
            fill="none"
            stroke={secondaryColor}
            strokeWidth="2.4"
            strokeDasharray="5 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={secondaryLine}
          />
        )}

        {/* Interactive Nodes + X-axis Labels */}
        {points.map((p, i) => {
          const cx = xFor(i);
          const cy = yFor(p.primary);
          const isHovered = hoveredIdx === i;
          return (
            <g
              key={`${p.label}-${i}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onClick={() => setHoveredIdx(i)}
              style={{ cursor: "pointer" }}
            >
              {/* Invisible wide touch/hover column */}
              <rect
                x={cx - 18}
                y={padTop}
                width={36}
                height={innerH + padBottom}
                fill="transparent"
              />
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill={color}
                stroke="#040b18"
                strokeWidth="2"
              />
              {p.secondary !== undefined && secondaryColor && (
                <circle
                  cx={cx}
                  cy={yFor(p.secondary)}
                  r={isHovered ? 5.5 : 3.5}
                  fill={secondaryColor}
                  stroke="#040b18"
                  strokeWidth="2"
                />
              )}
              <text
                x={cx}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill={isHovered ? "#22d3ee" : "#94a3b8"}
                fontWeight={isHovered ? "700" : "400"}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function AnalyticsView({ telemetryHistory }: AnalyticsViewProps) {
  const [range, setRange] = useState<TimeRange>("weekly");

  const filteredData =
    range === "daily"
      ? telemetryHistory.slice(-4)
      : range === "weekly"
      ? telemetryHistory.slice(-7)
      : telemetryHistory;

  const avgScore = Math.round(
    filteredData.reduce((acc, item) => acc + item.health_score, 0) /
      Math.max(1, filteredData.length)
  );
  const avgSleep = (
    filteredData.reduce((acc, item) => acc + item.sleep_hours, 0) /
    Math.max(1, filteredData.length)
  ).toFixed(1);
  const avgHr = Math.round(
    filteredData.reduce((acc, item) => acc + item.heart_rate, 0) /
      Math.max(1, filteredData.length)
  );

  return (
    <div className="space-y-6">
      {/* Header + Time Filter Bar */}
      <div className="cosmo-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <ChartIcon className="h-6 w-6 text-cyan-300" />
          <div>
            <h2 className="text-lg font-bold text-white">
              Biometric Trend Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              Hover or tap any chart node to inspect readings across mission days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-sky-400/20 bg-slate-950/75 p-1">
          {(["daily", "weekly", "monthly"] as TimeRange[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                range === option
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="cosmo-card rounded-2xl p-4">
          <p className="text-xs text-slate-400">Window Average Score</p>
          <p className="mt-1 text-2xl font-bold text-cyan-300">
            {avgScore}/100
          </p>
        </div>
        <div className="cosmo-card rounded-2xl p-4">
          <p className="text-xs text-slate-400">Average Resting HR</p>
          <p className="mt-1 text-2xl font-bold text-emerald-300">
            {avgHr} bpm
          </p>
        </div>
        <div className="cosmo-card rounded-2xl p-4">
          <p className="text-xs text-slate-400">Average Sleep Duration</p>
          <p className="mt-1 text-2xl font-bold text-violet-300">
            {avgSleep} hrs
          </p>
        </div>
      </div>

      {/* 5 Interactive Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <TrendChart
          title="Heart Rate History"
          unit="bpm"
          color="#22d3ee"
          primaryLabel="Resting HR"
          points={filteredData.map((d) => ({
            label: d.dateLabel,
            primary: d.heart_rate,
          }))}
        />

        <TrendChart
          title="Blood Pressure Trends"
          unit="mmHg"
          color="#14b8a6"
          secondaryColor="#a78bfa"
          primaryLabel="Systolic"
          secondaryLabel="Diastolic"
          points={filteredData.map((d) => ({
            label: d.dateLabel,
            primary: d.systolic,
            secondary: d.diastolic,
          }))}
        />

        <TrendChart
          title="Sleep Patterns"
          unit="hrs"
          color="#8b5cf6"
          primaryLabel="Sleep Duration"
          minDomain={3}
          maxDomain={9}
          points={filteredData.map((d) => ({
            label: d.dateLabel,
            primary: d.sleep_hours,
          }))}
        />

        <TrendChart
          title="Body Weight Changes"
          unit="kg"
          color="#38bdf8"
          primaryLabel="Body Mass"
          points={filteredData.map((d) => ({
            label: d.dateLabel,
            primary: d.weight,
          }))}
        />

        <div className="lg:col-span-2">
          <TrendChart
            title="Mood & Behavioral Resilience History"
            unit="/10"
            color="#f59e0b"
            primaryLabel="Daily Mood Rating"
            minDomain={1}
            maxDomain={10}
            points={filteredData.map((d) => ({
              label: d.dateLabel,
              primary: d.mood,
            }))}
          />
        </div>
      </div>
    </div>
  );
}