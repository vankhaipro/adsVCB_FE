"use client";

import { useSyncExternalStore } from "react";
import { getAuthUser, type AuthUser } from "./api";

// localStorage là một external store, nên đọc nó bằng useSyncExternalStore thay vì
// useEffect + setState (gây cascading render). getServerSnapshot trả null để lần render
// trên server và lần hydrate đầu tiên khớp nhau — không có localStorage ở server.

// getSnapshot phải trả về CÙNG một tham chiếu khi dữ liệu không đổi, nếu không React
// sẽ render lại vô hạn. Vì vậy cache theo chuỗi JSON thô của hồ sơ người dùng.
const USER_KEY = "authUser";
let cachedRaw: string | null = null;
let cachedUser: AuthUser | null = null;

function readRaw(): string | null {
  try {
    return localStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): AuthUser | null {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = getAuthUser();
  }
  return cachedUser;
}

function getServerSnapshot(): AuthUser | null {
  return null;
}

// "storage" chỉ bắn ở tab KHÁC. Đủ cho nhu cầu ở đây: trong cùng tab, đăng nhập và
// đăng xuất đều điều hướng cứng nên component được dựng lại từ đầu.
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function useAuthUser(): AuthUser | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useAuthRole(): string | null {
  return useAuthUser()?.role ?? null;
}
