"use client";

import { useState } from "react";
import { LayoutDashboard, MessageCircle, RefreshCw } from "lucide-react";
import SettingsPanel from "./SettingsPanel";

interface NavbarProps {
  activeTab: "dashboard" | "chat";
  onTabChange: (tab: "dashboard" | "chat") => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-surface)] border-b border-[var(--color-border)] backdrop-blur-lg bg-opacity-90">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] bg-clip-text text-transparent">
          IA Responde
        </h1>

        <div className="flex items-center gap-1 bg-[var(--color-background)] rounded-xl p-1">
          <button
            onClick={() => onTabChange("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <button
            onClick={() => onTabChange("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "chat"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <MessageCircle size={16} />
            <span className="hidden sm:inline">Chat</span>
          </button>
        </div>

        <SettingsPanel />
      </div>
    </header>
  );
}
