"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  getTransactions,
  addTransaction as addTransactionDB,
  deleteTransaction as deleteTransactionDB,
  updateTransaction as updateTransactionDB,
  getCategories,
  addCategory as addCategoryDB,
  deleteCategory as deleteCategoryDB,
  getRecurrences,
  addRecurrence as addRecurrenceDB,
  deleteRecurrence as deleteRecurrenceDB,
  updateRecurrence as updateRecurrenceDB,
} from "@/lib/firestore";
import { Transaction, Category, Recurrence, DEFAULT_CATEGORIES } from "@/lib/types";

interface DataContextType {
  transactions: Transaction[];
  categories: Category[];
  recurrences: Recurrence[];
  loading: boolean;
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  addCategory: (c: Omit<Category, "id">) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addRecurrence: (r: Omit<Recurrence, "id">) => Promise<void>;
  deleteRecurrence: (id: string) => Promise<void>;
  updateRecurrence: (id: string, data: Partial<Recurrence>) => Promise<void>;
  refreshData: () => Promise<void>;
  allCategories: Category[];
  getBalance: () => number;
  getMonthExpenses: () => number;
  getMonthIncome: () => number;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [txns, cats, recs] = await Promise.all([
        getTransactions(),
        getCategories(),
        getRecurrences(),
      ]);
      setTransactions(txns);
      setCategories(cats);
      setRecurrences(recs);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const allCategories = [...DEFAULT_CATEGORIES, ...categories];

  const addTransaction = async (t: Omit<Transaction, "id" | "createdAt">) => {
    const id = await addTransactionDB({ ...t, createdAt: Date.now() });
    setTransactions((prev) => [{ ...t, id, createdAt: Date.now() }, ...prev]);
  };

  const deleteTransaction = async (id: string) => {
    await deleteTransactionDB(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    await updateTransactionDB(id, data);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  };

  const addCategory = async (c: Omit<Category, "id">) => {
    const id = await addCategoryDB(c);
    setCategories((prev) => [...prev, { ...c, id }]);
  };

  const deleteCategory = async (id: string) => {
    await deleteCategoryDB(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addRecurrence = async (r: Omit<Recurrence, "id">) => {
    const id = await addRecurrenceDB(r);
    setRecurrences((prev) => [...prev, { ...r, id }]);
  };

  const deleteRecurrence = async (id: string) => {
    await deleteRecurrenceDB(id);
    setRecurrences((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRecurrence = async (id: string, data: Partial<Recurrence>) => {
    await updateRecurrenceDB(id, data);
    setRecurrences((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const getBalance = () => {
    return transactions.reduce((acc, t) => {
      return t.type === "income" ? acc + t.amount : acc - t.amount;
    }, 0);
  };

  const getMonthExpenses = () => {
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === "expense" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getMonthIncome = () => {
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === "income" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        categories,
        recurrences,
        loading,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addCategory,
        deleteCategory,
        addRecurrence,
        deleteRecurrence,
        updateRecurrence,
        refreshData,
        allCategories,
        getBalance,
        getMonthExpenses,
        getMonthIncome,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
