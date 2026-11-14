
"use client";

import React from "react";
import { MEDICAL_DISCLAIMER } from "../data/mockData";
import { AstronautProfile, NavTab, Status } from "../types/health";
import { MenuIcon, ShieldIcon } from "./Icons";

interface TopBarProps {
  activeTab: NavTab;
  astronaut: AstronautProfile;
  overallStatus: Status;
  healthScore: number;
  lastMode: "backend" | "demo-simulation" | null;
  onOpenMenu: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Mission Control Dashboard",
    subtitle: "Overall astronaut readiness, alerts, and daily check-in overview",
  },
  monitoring: {
    title: "Daily Health Monitoring",
    subtitle: "Record vitals, review instructions, and run health indicator assessment",
  },
  body: {
    title: "Interactive Human Body Telemetry",
    subtitle: "Explore 6 physiological systems and NASA's 5 spaceflight hazards",
  },
  analytics: {
    title: "Long-Duration Health Analytics",
    subtitle: "Visual trends across heart rate, blood pressure, sleep, weight, and mood",
  },
  wellbeing: {
    title: "Mental & Behavioral Wellbeing",
    subtitle: "Track mood, stress, sleep quality, energy, and isolation resilience",
  },
  assistant: {
    title: "COSMOCARE-AI Health Assistant",
    subtitle: "Interactive guidance companion for spaceflight health questions",
  },
  reports: {
    title: "Mission Health Reports",
    subtitle: "Comprehensive printable medical & wellbeing summary",
  },
};

export function TopBar({
  activeTab,
  astronaut,
  overallStatus,
  healthScore,
  lastMode,
  onOpenMenu,
}: TopBarProps) {
  const info = TAB_TITLES[activeTab];

  const badgeStyle =
    overallStatus === "green"
      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
      : overallStatus === "yellow"
      ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
      : "border-rose-500/40 bg-rose-500/15 text-rose-300";

  const statusText =
    overallStatus === "green"
      ? "Nominal"
      : overallStatus === "yellow"
      ? "Caution"
      : "Alert";

  return (
    <header className="no-print border-b border-sky-400/15 bg-[#061126]/85 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            className="rounded-xl border border-sky-400/20 bg-slate-900/80 p-2 text-slate-200 hover:border-cyan-400/40 lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
              {info.title}
            </h1>
            <p className="text-xs text-slate-400">{info.subtitle}</p>
          </div>
        </div>

        {/* Right Astronaut + Status Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-xl border border-sky-400/15 bg-slate-900/75 px-3 py-1.5 sm:flex">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-bold text-slate-950">
              EV
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-white">{astronaut.name}</p>
              <p className="text-[11px] text-slate-400">{astronaut.habitat}</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold ${badgeStyle}`}
          >
            <span>
              Status: {statusText} ({healthScore}/100)
            </span>
          </div>

          <span className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1.5 text-[11px] font-medium text-cyan-200">
            {lastMode === "backend"
              ? "Live Backend API"
              : lastMode === "demo-simulation"
              ? "Offline Demo Rules"
              : "Baseline Telemetry"}
          </span>
        </div>
      </div>

      {/* Clear Hackathon Medical Disclaimer */}
      <div className="flex items-center gap-2 border-t border-sky-400/10 bg-slate-950/60 px-4 py-1.5 text-[11px] text-slate-400 sm:px-6">
        <ShieldIcon className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
        <span>{MEDICAL_DISCLAIMER}</span>
      </div>
    </header>
  );
}