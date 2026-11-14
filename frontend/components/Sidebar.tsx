
"use client";

import React from "react";
import { AstronautProfile, NavTab, Status } from "../types/health";
import {
  BodyIcon,
  BotIcon,
  BrainIcon,
  ChartIcon,
  CloseIcon,
  DashboardIcon,
  FileTextIcon,
  HeartPulseIcon,
  OrbitIcon,
  RefreshIcon,
} from "./Icons";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  astronaut: AstronautProfile;
  overallStatus: Status;
  isOpen: boolean;
  onClose: () => void;
  onResetDemo: () => void;
}

const NAV_ITEMS: { id: NavTab; label: string; badge?: string }[] = [
  { id: "dashboard", label: "Mission Dashboard" },
  { id: "monitoring", label: "Health Monitoring", badge: "Check-in" },
  { id: "body", label: "Interactive Body", badge: "6 Systems" },
  { id: "analytics", label: "Health Analytics" },
  { id: "wellbeing", label: "Mental Wellbeing" },
  { id: "assistant", label: "AI Health Assistant" },
  { id: "reports", label: "Mission Reports" },
];

function renderNavIcon(id: NavTab) {
  switch (id) {
    case "dashboard":
      return <DashboardIcon className="h-4 w-4" />;
    case "monitoring":
      return <HeartPulseIcon className="h-4 w-4" />;
    case "body":
      return <BodyIcon className="h-4 w-4" />;
    case "analytics":
      return <ChartIcon className="h-4 w-4" />;
    case "wellbeing":
      return <BrainIcon className="h-4 w-4" />;
    case "assistant":
      return <BotIcon className="h-4 w-4" />;
    case "reports":
      return <FileTextIcon className="h-4 w-4" />;
  }
}

export function Sidebar({
  activeTab,
  onSelectTab,
  astronaut,
  overallStatus,
  isOpen,
  onClose,
  onResetDemo,
}: SidebarProps) {
  const missionPercent = Math.round(
    (astronaut.missionDay / astronaut.totalMissionDays) * 100
  );

  const statusDot =
    overallStatus === "green"
      ? "bg-emerald-400"
      : overallStatus === "yellow"
      ? "bg-amber-400"
      : "bg-rose-500";

  return (
    <>
      {/* Dark backdrop on mobile screens when menu is open */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/75 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-sky-400/15 bg-[#050d1d]/95 backdrop-blur-md transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-sky-400/15 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_-4px_rgba(34,211,238,0.45)]">
              <OrbitIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-wider text-white">
                  COSMOCARE-AI
                </span>
                <span className={`h-2 w-2 rounded-full ${statusDot}`} />
              </div>
              <p className="text-[11px] font-medium tracking-wide text-cyan-300/80 uppercase">
                Bio-Telemetry Console
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Mission Progress Card */}
        <div className="mx-4 mt-4 rounded-xl border border-sky-400/15 bg-slate-900/70 p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-cyan-300">
              {astronaut.callsign}
            </span>
            <span className="font-mono text-slate-300">
              Day {astronaut.missionDay}/{astronaut.totalMissionDays}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-400">
            {astronaut.missionName}
          </p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
              style={{ width: `${missionPercent}%` }}
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Mission Systems
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                  isActive
                    ? "border border-cyan-400/35 bg-cyan-500/15 text-cyan-200 shadow-[0_0_18px_-6px_rgba(34,211,238,0.45)]"
                    : "border border-transparent text-slate-300 hover:border-sky-400/15 hover:bg-slate-900/70 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={isActive ? "text-cyan-300" : "text-slate-400"}>
                    {renderNavIcon(item.id)}
                  </span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isActive
                        ? "bg-cyan-400/20 text-cyan-200"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Demo Controls */}
        <div className="border-t border-sky-400/15 p-4">
          <button
            type="button"
            onClick={onResetDemo}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            <RefreshIcon className="h-3.5 w-3.5" />
            Reset Demo Telemetry
          </button>
          <p className="mt-2.5 text-center text-[10px] leading-relaxed text-slate-500">
            Demo Mission Companion • Not a certified medical device
          </p>
        </div>
      </aside>
    </>
  );
}