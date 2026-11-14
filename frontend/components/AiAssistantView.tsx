"use client";

import React, { useState } from "react";
import { AI_SUGGESTED_QUESTIONS } from "../data/mockData";
import { askCosmoCareAssistant } from "../services/healthApi";
import { ChatMessage, TelemetryLogEntry } from "../types/health";
import { BotIcon, SendIcon } from "./Icons";

interface AiAssistantViewProps {
  messages: ChatMessage[];
  latestTelemetry: TelemetryLogEntry;
  onAppendMessage: (msg: ChatMessage) => void;
}

export function AiAssistantView({
  messages,
  latestTelemetry,
  onAppendMessage,
}: AiAssistantViewProps) {
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  async function sendQuestion(textToSend: string) {
    const trimmed = textToSend.trim();
    if (!trimmed || thinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: `Day ${latestTelemetry.missionDay} • Just now`,
    };

    onAppendMessage(userMsg);
    setInput("");
    setThinking(true);

    try {
      const response = await askCosmoCareAssistant(trimmed, latestTelemetry);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now() + 1}`,
        role: "assistant",
        text: response.reply,
        timestamp: `Day ${latestTelemetry.missionDay} • COSMOCARE-AI`,
        isDemoMode: response.isDemoMode,
      };
      onAppendMessage(botMsg);
    } finally {
      setThinking(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendQuestion(input);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left: Suggested Questions & Integration Notice */}
      <div className="space-y-4 lg:col-span-4">
        <div className="cosmo-card rounded-2xl p-5">
          <div className="flex items-center gap-2.5">
            <BotIcon className="h-6 w-6 text-cyan-300" />
            <div>
              <h2 className="text-base font-bold text-white">
                COSMOCARE-AI Companion
              </h2>
              <span className="inline-block rounded-full border border-amber-400/35 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                Demo Mode • Ready for Backend API
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-300">
            Ask quick questions about your latest vitals, spaceflight hazards, or sleep/stress countermeasures. Responses are clearly labeled simulated demo replies until connected to your team&apos;s backend AI route.
          </p>
        </div>

        <div className="cosmo-card rounded-2xl p-5">
          <h3 className="text-xs font-semibold tracking-wider text-cyan-300 uppercase">
            Suggested Astronaut Prompts
          </h3>
          <div className="mt-3 space-y-2">
            {AI_SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={thinking}
                onClick={() => sendQuestion(q)}
                className="w-full rounded-xl border border-sky-400/20 bg-slate-950/70 p-3 text-left text-xs text-slate-200 transition hover:border-cyan-400/45 hover:bg-slate-900 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Chat Conversation Area */}
      <div className="cosmo-card flex h-[36rem] flex-col rounded-2xl p-5 lg:col-span-8">
        <div className="flex items-center justify-between border-b border-sky-400/15 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Mission Health Guidance Thread
            </h3>
            <p className="text-[11px] text-slate-400">
              Latest context: Day {latestTelemetry.missionDay} • HR{" "}
              {latestTelemetry.heart_rate} bpm • Sleep{" "}
              {latestTelemetry.sleep_hours}h
            </p>
          </div>
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
        </div>

        {/* Messages */}
        <div className="my-4 flex-1 space-y-3 overflow-y-auto pr-2">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-gradient-to-r from-cyan-500 to-teal-500 font-medium text-slate-950"
                      : "border border-sky-400/20 bg-slate-950/80 text-slate-100"
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`mt-1.5 flex items-center gap-2 text-[10px] ${
                      isUser ? "text-slate-900/80" : "text-slate-400"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.isDemoMode && (
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-cyan-300">
                        Demo Reply
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {thinking && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-xs text-cyan-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                <span>COSMOCARE-AI is analyzing mission telemetry...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2.5 pt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about vitals, microgravity risks, sleep, or stress..."
            className="flex-1 rounded-xl border border-sky-400/25 bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={thinking || !input.trim()}
            className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            <SendIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}