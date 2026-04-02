"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { saveThemeSettings, getThemeSettings } from "@/lib/firestore";

interface ThemeContextType {
  mode: "light" | "dark";
  primaryColor: string;
  toggleMode: () => void;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  primaryColor: "#6C5CE7",
  toggleMode: () => {},
  setPrimaryColor: () => {},
});

const COLOR_PRESETS: Record<string, { light: string; dark: string }> = {
  "#6C5CE7": { light: "#8B7CF0", dark: "#5A4BD1" },
  "#00B894": { light: "#00D4AA", dark: "#009B7D" },
  "#E17055": { light: "#F0836A", dark: "#C45D42" },
  "#0984E3": { light: "#3D9FEB", dark: "#0770C2" },
  "#E84393": { light: "#F06AAD", dark: "#C9327A" },
  "#FDCB6E": { light: "#FED886", dark: "#E5B455" },
};

function getCSSVariables(mode: "light" | "dark", primaryColor: string) {
  const preset = COLOR_PRESETS[primaryColor] || { light: primaryColor, dark: primaryColor };

  if (mode === "dark") {
    return {
      "--color-primary": primaryColor,
      "--color-primary-light": preset.light,
      "--color-primary-dark": preset.dark,
      "--color-surface": "#1E1E2E",
      "--color-surface-hover": "#2A2A3E",
      "--color-background": "#121218",
      "--color-text-primary": "#FFFFFF",
      "--color-text-secondary": "#A0A0B8",
      "--color-border": "#2E2E42",
      "--color-income": "#00B894",
      "--color-expense": "#FF6B6B",
    };
  }

  return {
    "--color-primary": primaryColor,
    "--color-primary-light": preset.light,
    "--color-primary-dark": preset.dark,
    "--color-surface": "#FFFFFF",
    "--color-surface-hover": "#F5F5FA",
    "--color-background": "#F0F0F8",
    "--color-text-primary": "#1A1A2E",
    "--color-text-secondary": "#6B6B80",
    "--color-border": "#E0E0EA",
    "--color-income": "#00B894",
    "--color-expense": "#FF6B6B",
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [primaryColor, setPrimaryColorState] = useState("#6C5CE7");

  useEffect(() => {
    getThemeSettings().then((settings) => {
      if (settings) {
        setMode(settings.mode as "light" | "dark");
        setPrimaryColorState(settings.primaryColor);
      }
    });
  }, []);

  useEffect(() => {
    const vars = getCSSVariables(mode, primaryColor);
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode, primaryColor]);

  const toggleMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    saveThemeSettings({ mode: newMode, primaryColor });
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    saveThemeSettings({ mode, primaryColor: color });
  };

  return (
    <ThemeContext.Provider value={{ mode, primaryColor, toggleMode, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export { COLOR_PRESETS };
