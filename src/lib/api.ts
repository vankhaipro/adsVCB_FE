function cleanApiUrl(url: string): string {
  if (!url) return "http://localhost:3001";
  let cleaned = url.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(cleaned) && !/^\/\//.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

export const API_URL = cleanApiUrl(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

async function handle(res: Response) {
  if (!res.ok) {
    let msg = `API ${res.status}`;
    try {
      const j = await res.json();
      // NestJS trả { statusCode, message, error }. Ưu tiên message (câu mô tả rõ),
      // message có thể là mảng (lỗi validation) → nối lại.
      const m = j.message ?? j.error;
      msg = Array.isArray(m) ? m.join(", ") : (m || msg);
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

export const apiGet = (path: string) => fetch(`${API_URL}${path}`).then(handle);

export const apiPost = (path: string, body?: unknown) =>
  fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).then(handle);

export const apiPatch = (path: string, body?: unknown) =>
  fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).then(handle);

export const apiDelete = (path: string) =>
  fetch(`${API_URL}${path}`, { method: "DELETE" }).then(handle);

// Format tiền VND
export const fmtVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(n || 0)) + "đ";

export type AuthUser = { sub?: string; email?: string; name?: string; role?: string };

// Giải mã payload JWT trong localStorage (client-side), UTF-8 đúng cho tên tiếng Việt.
export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    let b = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    b += "=".repeat((4 - (b.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(b), (ch) => ch.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

// Vai trò (role) từ JWT.
export function getAuthRole(): string | null {
  return getAuthUser()?.role ?? null;
}
