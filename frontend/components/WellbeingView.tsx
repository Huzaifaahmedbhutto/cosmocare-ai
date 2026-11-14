
"use client";

import React, { useState } from "react";
import { WellbeingEntry } from "../types/health";
import { BrainIcon, CheckCircleIcon } from "./Icons";

interface WellbeingViewProps {
  wellbeingHistory: WellbeingEntry[];
  onAddEntry: (
    entry: Omit<WellbeingEntry, "id" | "missionDay" | "dateLabel" | "timestamp">
  ) => void;
}

export function WellbeingView({
  wellbeingHistory,
  onAddEntry,
}: WellbeingViewProps) {
  const [mood, setMood] = useState(8);
  const [stress, setStress] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(8);
  const [energy, setEnergy] = useState(7);
  const [loneliness, setLoneliness] = useState(3);
  const [note, setNote] = useState("");
  const [savedBanner, setSavedBanner] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onAddEntry({
      mood,
      stress,
      sleepQuality,
      energy,
      loneliness,
      note: note.trim() || "Daily behavioral check-in logged.",
    });
    setNote("");
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  }

  // Generate supportive suggestions based on current ratings
  const suggestions: { title: string; tip: string }[] = [];

  if (stress >= 6) {
    suggestions.push({
      title: "Decompression & Box Breathing",
      tip: "Your stress load is elevated. Try 4-4-4-4 box breathing for 5 minutes and pause non-critical console tasks if possible.",
    });
  }
  if (loneliness >= 6) {
    suggestions.push({
      title: "Connection & Earth Contact",
      tip: "Isolation strain is high. Schedule a crew meal, shared recreation activity, or record an asynchronous video message for family on Earth.",
    });
  }
  if (sleepQuality <= 5) {
    suggestions.push({
      title: "Circadian Rest Hygiene",
      tip: "Use noise-isolating ear protection, keep quarters slightly cool, and dim blue cabin screens 45 minutes before your sleep window.",
    });
  }
  if (energy <= 5 || mood <= 5) {
    suggestions.push({
      title: "Light Activity & Hydration Reset",
      tip: "Complete 15 minutes of light cycling or stretching, hydrate with electrolytes, and step near the cupola/observation port if off-duty.",
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      title: "Positive Resilience Baseline",
      tip: "Your behavioral ratings look steady! Maintain scheduled social time with crewmates and consistent sleep-wake lighting cues.",
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Check-in Sliders */}
        <form
          onSubmit={handleSave}
          className="cosmo-card rounded-2xl p-6 lg:col-span-7"
        >
          <div className="flex items-center gap-2.5 border-b border-sky-400/15 pb-4">
            <BrainIcon className="h-6 w-6 text-violet-300" />
            <div>
              <h2 className="text-lg font-bold text-white">
                Mental & Behavioral Check-in
              </h2>
              <p className="text-xs text-slate-400">
                Evaluate emotional balance during long-duration confinement
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {[
              {
                label: "Daily Mood",
                value: mood,
                setter: setMood,
                low: "Very Low",
                high: "Great",
                color: "accent-cyan-400",
              },
              {
                label: "Stress Level",
                value: stress,
                setter: setStress,
                low: "Calm",
                high: "High Strain",
                color: "accent-amber-400",
              },
              {
                label: "Sleep Quality",
                value: sleepQuality,
                setter: setSleepQuality,
                low: "Restless",
                high: "Deep Rest",
                color: "accent-violet-400",
              },
              {
                label: "Energy Level",
                value: energy,
                setter: setEnergy,
                low: "Fatigued",
                high: "Energized",
                color: "accent-teal-400",
              },
              {
                label: "Isolation / Loneliness",
                value: loneliness,
                setter: setLoneliness,
                low: "Connected",
                high: "Very Isolated",
                color: "accent-rose-400",
              },
            ].map((slider) => (
              <div key={slider.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-white">
                    {slider.label}
                  </span>
                  <span className="font-mono font-bold text-cyan-300">
                    {slider.value}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={slider.value}
                  onChange={(e) => slider.setter(Number(e.target.value))}
                  className={`mt-2 w-full cursor-pointer ${slider.color}`}
                />
                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                  <span>1 • {slider.low}</span>
                  <span>10 • {slider.high}</span>
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-white">
                Private Mission Reflection Note (Optional)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How are crew interactions, sleep quarters, or workload feeling today?"
                className="mt-2 w-full rounded-xl border border-sky-400/20 bg-slate-950/75 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {savedBanner && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-2.5 text-xs font-semibold text-emerald-200">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Mental wellbeing check-in saved to Mission History!</span>
            </div>
          )}

          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-400 to-cyan-400 py-2.5 text-sm font-bold text-slate-950 transition hover:brightness-110"
          >
            Save Wellbeing Assessment
          </button>
        </form>

        {/* Right: Supportive Guidance + History */}
        <div className="space-y-5 lg:col-span-5">
          <div className="cosmo-card rounded-2xl p-5">
            <h3 className="text-base font-bold text-white">
              Supportive Wellbeing Guidance
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Tailored non-clinical recommendations based on your sliders
            </p>
            <div className="mt-4 space-y-3">
              {suggestions.map((s) => (
                <div
                  key={s.title}
                  className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-3.5"
                >
                  <p className="text-xs font-bold text-violet-200">{s.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200">
                    {s.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="cosmo-card rounded-2xl p-5">
            <h3 className="text-base font-bold text-white">
              Recent Wellbeing Logs
            </h3>
            <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
              {[...wellbeingHistory].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-sky-400/15 bg-slate-950/70 p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">
                      {entry.dateLabel}
                    </span>
                    <span className="font-mono text-slate-400">
                      Mood {entry.mood}/10 • Stress {entry.stress}/10
                    </span>
                  </div>
                  <p className="mt-1.5 text-slate-200">{entry.note}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-400">
                    <span>Sleep Quality: {entry.sleepQuality}/10</span>
                    <span>•</span>
                    <span>Energy: {entry.energy}/10</span>
                    <span>•</span>
                    <span>Isolation: {entry.loneliness}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}