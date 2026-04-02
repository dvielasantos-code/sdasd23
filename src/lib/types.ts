export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense" | "both";
}

export interface Recurrence {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  frequency: "weekly" | "monthly" | "yearly";
  dayOfMonth?: number;
  nextDate: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  transactionRegistered?: boolean;
}

export interface ThemeSettings {
  mode: "light" | "dark";
  primaryColor: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "alimentacao", name: "Alimentação", icon: "🍔", color: "#FF6B6B", type: "expense" },
  { id: "transporte", name: "Transporte", icon: "🚗", color: "#4ECDC4", type: "expense" },
  { id: "moradia", name: "Moradia", icon: "🏠", color: "#45B7D1", type: "expense" },
  { id: "lazer", name: "Lazer", icon: "🎮", color: "#96CEB4", type: "expense" },
  { id: "saude", name: "Saúde", icon: "💊", color: "#FFEAA7", type: "expense" },
  { id: "educacao", name: "Educação", icon: "📚", color: "#DDA0DD", type: "expense" },
  { id: "vestuario", name: "Vestuário", icon: "👕", color: "#98D8C8", type: "expense" },
  { id: "tecnologia", name: "Tecnologia", icon: "💻", color: "#7C73E6", type: "expense" },
  { id: "assinatura", name: "Assinatura", icon: "📱", color: "#F093FB", type: "expense" },
  { id: "salario", name: "Salário", icon: "💰", color: "#00B894", type: "income" },
  { id: "freelance", name: "Freelance", icon: "💼", color: "#6C5CE7", type: "income" },
  { id: "investimento", name: "Investimento", icon: "📈", color: "#FDCB6E", type: "both" },
  { id: "outros", name: "Outros", icon: "📦", color: "#636E72", type: "both" },
];
