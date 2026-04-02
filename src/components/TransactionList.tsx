"use client";

import { useData } from "@/context/DataContext";
import { Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TransactionList() {
  const { transactions, allCategories, deleteTransaction } = useData();

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getCategoryInfo = (categoryName: string) => {
    const cat = allCategories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase() || c.id === categoryName
    );
    return cat || { icon: "📦", color: "#636E72", name: categoryName };
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl p-8 bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
        <p className="text-[var(--color-text-secondary)]">
          Nenhuma transação ainda. Use o chat para registrar!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-lg font-semibold">Últimas Transações</h2>
      </div>
      <div className="divide-y divide-[var(--color-border)] max-h-[400px] overflow-y-auto">
        {transactions.slice(0, 20).map((t) => {
          const cat = getCategoryInfo(t.category);
          return (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: cat.color + "20" }}
                >
                  {cat.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{t.description}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {cat.name} • {format(new Date(t.date + "T12:00:00"), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p
                    className={`font-semibold text-sm ${
                      t.type === "income"
                        ? "text-[var(--color-income)]"
                        : "text-[var(--color-expense)]"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
                  </p>
                </div>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-expense)] hover:bg-opacity-20 text-[var(--color-text-secondary)] hover:text-[var(--color-expense)] transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
