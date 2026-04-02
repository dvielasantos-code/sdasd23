"use client";

import { useState } from "react";
import { Settings, Sun, Moon, X, Plus, Trash2 } from "lucide-react";
import { useTheme, COLOR_PRESETS } from "@/context/ThemeContext";
import { useData } from "@/context/DataContext";

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6C5CE7");
  const [newCatType, setNewCatType] = useState<"income" | "expense" | "both">("expense");

  const { mode, primaryColor, toggleMode, setPrimaryColor } = useTheme();
  const { categories, addCategory, deleteCategory } = useData();

  const colorOptions = Object.keys(COLOR_PRESETS);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await addCategory({
      name: newCatName,
      icon: newCatIcon || "📦",
      color: newCatColor,
      type: newCatType,
    });
    setNewCatName("");
    setNewCatIcon("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-xl hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
      >
        <Settings size={22} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Configurações</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl hover:bg-[var(--color-surface-hover)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tema */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">
            Tema
          </h3>
          <button
            onClick={toggleMode}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            {mode === "dark" ? <Moon size={20} /> : <Sun size={20} />}
            <span>{mode === "dark" ? "Modo Escuro" : "Modo Claro"}</span>
          </button>
        </div>

        {/* Cor primária */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">
            Cor Principal
          </h3>
          <div className="flex gap-3 flex-wrap">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => setPrimaryColor(color)}
                className={`w-10 h-10 rounded-xl transition-transform ${
                  primaryColor === color ? "scale-110 ring-2 ring-white" : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Categorias custom */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">
            Categorias Personalizadas
          </h3>

          {categories.length > 0 && (
            <div className="space-y-2 mb-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-background)]"
                >
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-sm">{cat.name}</span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-expense)] hover:bg-opacity-20 text-[var(--color-text-secondary)] hover:text-[var(--color-expense)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 p-3 rounded-xl bg-[var(--color-background)]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] rounded-lg px-3 py-2 text-sm outline-none border border-[var(--color-border)]"
              />
              <input
                type="text"
                placeholder="Emoji"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                className="w-16 bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] rounded-lg px-3 py-2 text-sm outline-none border border-[var(--color-border)] text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value as any)}
                className="flex-1 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 text-sm outline-none border border-[var(--color-border)]"
              >
                <option value="expense">Saída</option>
                <option value="income">Entrada</option>
                <option value="both">Ambos</option>
              </select>
              <button
                onClick={handleAddCategory}
                className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
