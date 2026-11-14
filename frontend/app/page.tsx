"use client";

import React, { useState } from "react";
import { AiAssistantView } from "../components/AiAssistantView";
import { AnalyticsView } from "../components/AnalyticsView";
import { DashboardView } from "../components/DashboardView";
import { InteractiveBodyView } from "../components/InteractiveBodyView";
import { MonitoringView } from "../components/MonitoringView";
import { ReportsView } from "../components/ReportsView";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { WellbeingView } from "../components/WellbeingView";
import { useCosmoCareState } from "../hooks/useCosmoCareState";
import { NavTab } from "../types/health";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    astronaut,
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
  } = useCosmoCareState();

  const overallStatus =
    latestResult?.overall_status ?? latestTelemetry.overall_status;
  const healthScore =
    latestResult?.health_score ?? latestTelemetry.health_score;
  const latestWellbeing = wellbeingHistory[wellbeingHistory.length - 1];

  return (
    <div className="flex min-h-screen w-full text-slate-100">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        astronaut={astronaut}
        overallStatus={overallStatus}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onResetDemo={resetDemoData}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          activeTab={activeTab}
          astronaut={astronaut}
          overallStatus={overallStatus}
          healthScore={healthScore}
          lastMode={lastMode}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          {activeTab === "dashboard" && (
            <DashboardView
              astronaut={astronaut}
              latestTelemetry={latestTelemetry}
              latestResult={latestResult}
              hasCompletedTodayCheckin={hasCompletedTodayCheckin}
              latestWellbeing={latestWellbeing}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "monitoring" && (
            <MonitoringView
              latestResult={latestResult}
              lastMode={lastMode}
              lastNotice={lastNotice}
              telemetryHistory={telemetryHistory}
              onCheckinComplete={recordCheckin}
              onJumpToBody={() => setActiveTab("body")}
            />
          )}

          {activeTab === "body" && (
            <InteractiveBodyView
              latestResult={latestResult}
              latestTelemetry={latestTelemetry}
              onGoToCheckin={() => setActiveTab("monitoring")}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsView telemetryHistory={telemetryHistory} />
          )}

          {activeTab === "wellbeing" && (
            <WellbeingView
              wellbeingHistory={wellbeingHistory}
              onAddEntry={addWellbeingEntry}
            />
          )}

          {activeTab === "assistant" && (
            <AiAssistantView
              messages={chatMessages}
              latestTelemetry={latestTelemetry}
              onAppendMessage={appendChatMessage}
            />
          )}

          {activeTab === "reports" && (
            <ReportsView
              astronaut={astronaut}
              telemetryHistory={telemetryHistory}
              latestTelemetry={latestTelemetry}
              latestResult={latestResult}
              wellbeingHistory={wellbeingHistory}
            />
          )}
        </main>
      </div>
    </div>
  );
}