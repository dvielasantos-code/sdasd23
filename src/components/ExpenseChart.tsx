"use client";

import { useData } from "@/context/DataContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function ExpenseChart() {
  const { transactions, allCategories } = useData();

  const now = new Date();
  const monthExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      t.type === "expense" &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  const categoryTotals = monthExpenses.reduce((acc, t) => {
    const key = t.category;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals)
    .map(([name, value]) => {
      const cat = allCategories.find(
        (c) => c.name.toLowerCase() === name.toLowerCase() || c.id === name
      );
      return {
        name: cat?.name || name,
        value,
        color: cat?.color || "#636E72",
        icon: cat?.icon || "📦",
      };
    })
    .sort((a, b) => b.value - a.value);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (data.length === 0) {
    return (
      <div className="rounded-2xl p-8 bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
        <p className="text-[var(--color-text-secondary)]">Sem gastos este mês</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 bg-[var(--color-surface)] border border-[var(--color-border)]">
      <h2 className="text-lg font-semibold mb-4">Gastos por Categoria</h2>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  color: "var(--color-text-primary)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2 w-full">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">
                  {item.icon} {item.name}
                </span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
