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

// --- Cache GET phía client để giảm gọi lại BE (và egress Supabase) ---
// Mỗi lần điều hướng/đổi lại trang trong cùng phiên, GET giống nhau trong TTL dùng lại
// cache thay vì gọi mạng. Dedup thêm các request "đang bay" (StrictMode double-mount,
// nhiều component gọi trùng). Mọi mutation (POST/PATCH/DELETE) xóa cache để không cũ.
const GET_TTL = 60_000; // 60s — dữ liệu dashboard chỉ đổi khi sync (mỗi 3h)
const getCache = new Map<string, { at: number; data: unknown }>();
const inflight = new Map<string, Promise<unknown>>();
// Endpoint biến động (poll tiến độ đồng bộ) — luôn lấy mới.
const NO_CACHE = /\/sync(\/|$)/;

function invalidateGetCache() {
  getCache.clear();
  inflight.clear();
}

export const apiGet = (path: string, opts?: { cache?: boolean }) => {
  const useCache = opts?.cache !== false && !NO_CACHE.test(path);
  if (useCache) {
    const hit = getCache.get(path);
    if (hit && Date.now() - hit.at < GET_TTL) return Promise.resolve(hit.data);
    const flying = inflight.get(path);
    if (flying) return flying;
  }
  const p = fetch(`${API_URL}${path}`)
    .then(handle)
    .then((data) => {
      if (useCache) getCache.set(path, { at: Date.now(), data });
      inflight.delete(path);
      return data;
    })
    .catch((e) => {
      inflight.delete(path);
      throw e;
    });
  if (useCache) inflight.set(path, p);
  return p;
};

export const apiPost = (path: string, body?: unknown) =>
  fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
    .then(handle)
    .then((r) => {
      invalidateGetCache();
      return r;
    });

export const apiPatch = (path: string, body?: unknown) =>
  fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
    .then(handle)
    .then((r) => {
      invalidateGetCache();
      return r;
    });

export const apiDelete = (path: string) =>
  fetch(`${API_URL}${path}`, { method: "DELETE" })
    .then(handle)
    .then((r) => {
      invalidateGetCache();
      return r;
    });

// Map khoảng thời gian đã chọn (YYYY-MM-DD) -> query ?from=&to= cho API.
// Gửi thẳng ngày dạng YYYY-MM-DD, KHÔNG đổi qua UTC.
// Trước đây dùng new Date(local).toISOString() → ở VN (UTC+7) ngày bắt đầu bị lùi 1 ngày
// (vd 13/07 00:00 local = 12/07 17:00Z), khiến BE lọc dư ngày trước. BE (resolveRange của
// ads dùng 10 ký tự đầu; của sapo dựng mốc giờ VN) đều nhận đúng YMD.
export function datesToQuery(from: string, to: string): string {
  return `from=${from}&to=${to}`;
}

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
