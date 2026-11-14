
"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_ASTRONAUT,
  INITIAL_CHAT_MESSAGES,
  SAMPLE_TELEMETRY_HISTORY,
  SAMPLE_WELLBEING_HISTORY,
} from "../data/mockData";
import { CheckinSubmissionOutcome } from "../services/healthApi";
import {
  BackendCheckinResult,
  ChatMessage,
  CheckinFormValues,
  TelemetryLogEntry,
  WellbeingEntry,
} from "../types/health";

const STORAGE_KEYS = {
  telemetry: "cosmocare_telemetry_v1",
  latestResult: "cosmocare_latest_result_v1",
  wellbeing: "cosmocare_wellbeing_v1",
  chat: "cosmocare_chat_v1",
};

export function useCosmoCareState() {
  const [hydrated, setHydrated] = useState(false);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryLogEntry[]>(
    SAMPLE_TELEMETRY_HISTORY
  );
  const [latestResult, setLatestResult] = useState<BackendCheckinResult | null>(
    null
  );
  const [lastMode, setLastMode] = useState<"backend" | "demo-simulation" | null>(
    null
  );
  const [lastNotice, setLastNotice] = useState<string>("");
  const [wellbeingHistory, setWellbeingHistory] = useState<WellbeingEntry[]>(
    SAMPLE_WELLBEING_HISTORY
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    INITIAL_CHAT_MESSAGES
  );

  // Load saved browser data once when the page opens
  useEffect(() => {
    try {
      const savedTelemetry = localStorage.getItem(STORAGE_KEYS.telemetry);
      if (savedTelemetry) {
        const parsed = JSON.parse(savedTelemetry);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTelemetryHistory(parsed);
        }
      }

      const savedResult = localStorage.getItem(STORAGE_KEYS.latestResult);
      if (savedResult) {
        setLatestResult(JSON.parse(savedResult));
      }

      const savedWellbeing = localStorage.getItem(STORAGE_KEYS.wellbeing);
      if (savedWellbeing) {
        const parsed = JSON.parse(savedWellbeing);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWellbeingHistory(parsed);
        }
      }

      const savedChat = localStorage.getItem(STORAGE_KEYS.chat);
      if (savedChat) {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatMessages(parsed);
        }
      }
    } catch {
      // Ignore corrupt storage and continue with clean sample defaults
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save updates back to browser storage whenever data changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEYS.telemetry,
        JSON.stringify(telemetryHistory)
      );
      if (latestResult) {
        localStorage.setItem(
          STORAGE_KEYS.latestResult,
          JSON.stringify(latestResult)
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.latestResult);
      }
      localStorage.setItem(
        STORAGE_KEYS.wellbeing,
        JSON.stringify(wellbeingHistory)
      );
      localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(chatMessages));
    } catch {
      // Ignore storage quota errors
    }
  }, [hydrated, telemetryHistory, latestResult, wellbeingHistory, chatMessages]);

  function recordCheckin(
    values: CheckinFormValues,
    outcome: CheckinSubmissionOutcome
  ) {
    setLatestResult(outcome.result);
    setLastMode(outcome.mode);
    setLastNotice(outcome.notice || "");

    const newEntry: TelemetryLogEntry = {
      id: `checkin-${Date.now()}`,
      missionDay: DEFAULT_ASTRONAUT.missionDay,
      dateLabel: `Day ${DEFAULT_ASTRONAUT.missionDay}`,
      timestamp: new Date().toISOString(),
      heart_rate: Number(values.heart_rate),
      systolic: Number(values.systolic),
      diastolic: Number(values.diastolic),
      glucose: Number(values.glucose),
      temp: Number(values.temp),
      sleep_hours: Number(values.sleep_hours),
      mood: Number(values.mood),
      spo2: Number(values.spo2),
      weight: Number(values.weight),
      overall_status: outcome.result.overall_status,
      health_score: outcome.result.health_score,
      source: outcome.mode,
    };

    setTelemetryHistory((prev) => {
      // Keep sample history plus up to 20 recent submissions
      const withoutTodayOld = prev.filter(
        (item) => item.missionDay !== DEFAULT_ASTRONAUT.missionDay
      );
      return [...withoutTodayOld, newEntry];
    });
  }

  function addWellbeingEntry(
    entry: Omit<WellbeingEntry, "id" | "missionDay" | "dateLabel" | "timestamp">
  ) {
    const newItem: WellbeingEntry = {
      id: `wb-${Date.now()}`,
      missionDay: DEFAULT_ASTRONAUT.missionDay,
      dateLabel: `Day ${DEFAULT_ASTRONAUT.missionDay}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    setWellbeingHistory((prev) => [...prev, newItem]);
  }

  function appendChatMessage(message: ChatMessage) {
    setChatMessages((prev) => [...prev, message]);
  }

  function resetDemoData() {
    setTelemetryHistory(SAMPLE_TELEMETRY_HISTORY);
    setLatestResult(null);
    setLastMode(null);
    setLastNotice("");
    setWellbeingHistory(SAMPLE_WELLBEING_HISTORY);
    setChatMessages(INITIAL_CHAT_MESSAGES);

    try {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    } catch {
      // Ignore
    }
  }

  const latestTelemetry =
    telemetryHistory[telemetryHistory.length - 1] ??
    SAMPLE_TELEMETRY_HISTORY[SAMPLE_TELEMETRY_HISTORY.length - 1];

  const hasCompletedTodayCheckin = Boolean(
    latestResult ||
      telemetryHistory.some(
        (item) => item.missionDay === DEFAULT_ASTRONAUT.missionDay
      )
  );

  return {
    astronaut: DEFAULT_ASTRONAUT,
    hydrated,
    telemetryHistory,
    latestTelemetry,
    latestResult,
    lastMode,
    lastNotice,
    hasCompletedTodayCheckin,
    wellbeingHistory,
    chatMessages,
    recordCheckin,
    addWellbeingEntry,
    appendChatMessage,
    resetDemoData,
  };
}