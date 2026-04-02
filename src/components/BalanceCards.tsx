"use client";

import { useData } from "@/context/DataContext";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function BalanceCards() {
  const { getBalance, getMonthIncome, getMonthExpenses } = useData();

  const balance = getBalance();
  const income = getMonthIncome();
  const expenses = getMonthExpenses();

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-2xl p-5 bg-[var(--color-surface)] border border-[var(--color-border)] transition-all hover:border-[var(--color-primary)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[var(--color-primary)] bg-opacity-20">
            <Wallet size={20} className="text-[var(--color-primary)]" />
          </div>
          <span className="text-sm text-[var(--color-text-secondary)]">Saldo Total</span>
        </div>
        <p className={`text-2xl font-bold ${balance >= 0 ? "text-[var(--color-income)]" : "text-[var(--color-expense)]"}`}>
          {formatCurrency(balance)}
        </p>
      </div>

      <div className="rounded-2xl p-5 bg-[var(--color-surface)] border border-[var(--color-border)] transition-all hover:border-[var(--color-income)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[var(--color-income)] bg-opacity-20">
            <TrendingUp size={20} className="text-[var(--color-income)]" />
          </div>
          <span className="text-sm text-[var(--color-text-secondary)]">Entradas do Mês</span>
        </div>
        <p className="text-2xl font-bold text-[var(--color-income)]">
          {formatCurrency(income)}
        </p>
      </div>

      <div className="rounded-2xl p-5 bg-[var(--color-surface)] border border-[var(--color-border)] transition-all hover:border-[var(--color-expense)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[var(--color-expense)] bg-opacity-20">
            <TrendingDown size={20} className="text-[var(--color-expense)]" />
          </div>
          <span className="text-sm text-[var(--color-text-secondary)]">Saídas do Mês</span>
        </div>
        <p className="text-2xl font-bold text-[var(--color-expense)]">
          {formatCurrency(expenses)}
        </p>
      </div>
    </div>
  );
}
