"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import BalanceCards from "@/components/BalanceCards";
import TransactionList from "@/components/TransactionList";
import ExpenseChart from "@/components/ExpenseChart";
import ChatBot from "@/components/ChatBot";
import { useData } from "@/context/DataContext";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat">("dashboard");
  const { loading } = useData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-text-secondary)] text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "dashboard" ? (
          <div className="space-y-6">
            <BalanceCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseChart />
              <TransactionList />
            </div>
          </div>
        ) : (
          <ChatBot />
        )}
      </main>
    </div>
  );
}
