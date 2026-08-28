"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DEFAULT_THEME: Theme = "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

// Chủ đề sống ở ngoài React: script no-flash đặt class trên <html> trước khi React
// chạy, nên <html> mới là nguồn sự thật. Đọc nó bằng useSyncExternalStore giống
// useAuthUser — getServerSnapshot trả DEFAULT_THEME để lần render trên server và lần
// hydrate đầu tiên khớp nhau, rồi React tự render lại với giá trị thật sau khi hydrate.
// (Đọc localStorage ngay trong useState sẽ lệch với HTML server → hydration mismatch.)
let listeners: Array<() => void> = [];
// getSnapshot phải trả cùng giá trị khi không có gì đổi, nên cache lại.
let snapshot: Theme | null = null;

function getSnapshot(): Theme {
  if (snapshot === null) {
    snapshot = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  }
  return snapshot;
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME;
}

function subscribe(onChange: () => void) {
  listeners.push(onChange);
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
  };
}

function setThemeGlobal(next: Theme) {
  if (snapshot === next) return;
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* localStorage unavailable */
  }
  applyTheme(next);
  for (const l of listeners) l();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => setThemeGlobal(next), []);
  const toggleTheme = useCallback(
    () => setThemeGlobal(getSnapshot() === "dark" ? "light" : "dark"),
    []
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

/**
 * Inline script that runs synchronously during HTML parsing (before first paint)
 * to apply the persisted theme and avoid a flash. Mirrors DEFAULT_THEME above.
 */
export const themeNoFlashScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var d=(t==="light")?"light":"dark";var e=document.documentElement;if(d==="dark")e.classList.add("dark");else e.classList.remove("dark");e.style.colorScheme=d;}catch(e){}})();`;
