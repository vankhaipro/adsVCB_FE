function cleanApiUrl(url: string): string {
  if (!url) return "http://localhost:3001";
  // Gỡ dấu nháy bao quanh trước khi làm gì khác: Railway và Vercel đôi khi lưu giá trị biến môi
  // trường kèm nháy nguyên văn ("https://a.com"). Không gỡ thì chuỗi không khớp /^https?:\/\//
  // và bị nối thêm tiền tố thành https://"https://... — mọi lời gọi chết ngay ở trình duyệt.
  let cleaned = url.trim().replace(/^["']+|["']+$/g, "").replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(cleaned) && !/^\/\//.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

export const API_URL = cleanApiUrl(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

// --- Phiên đăng nhập ---
// Access token và refresh token nằm trong cookie HttpOnly do BE đặt, JavaScript KHÔNG đọc được
// chúng. Ở đây chỉ giữ hồ sơ người dùng (tên, email, vai trò) để hiển thị giao diện. Mọi quyết
// định phân quyền thật đều do BE thực hiện dựa trên cookie.
const USER_KEY = "authUser";
const CSRF_COOKIE = "vcbi_csrf";
const CSRF_HEADER = "x-csrf-token";

// Cờ báo "đang có phiên", do CHÍNH frontend đặt trên domain của frontend. middleware.ts đọc nó
// để quyết định có đá về trang đăng nhập hay không.
//
// Vì sao không đọc thẳng cookie của BE: cookie do api.vienchibao.com đặt chỉ hiện ra ở
// ads.vienchibao.com khi biến COOKIE_DOMAIN được cấu hình đúng. Quên biến đó thì middleware
// không thấy gì, đá về /login, trang login lại đẩy sang "/" — người dùng kẹt trong vòng lặp
// chuyển hướng dù đăng nhập đã thành công. Cờ này cắt hẳn sự phụ thuộc đó.
//
// Nó KHÔNG phải lớp bảo mật: sửa tay trong devtools chỉ đổi được điều hướng, mọi request vẫn
// bị BE kiểm bằng cookie HttpOnly.
const SESSION_HINT = "vcbi_session";
const SESSION_HINT_MAX_AGE = 30 * 24 * 3600;

export type AuthUser = { id?: string; email?: string; name?: string; role?: string };

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* chế độ riêng tư chặn localStorage — giao diện mất tên hiển thị, phiên vẫn chạy bằng cookie */
  }
}

export function getAuthRole(): string | null {
  return getAuthUser()?.role ?? null;
}

function setSessionHint() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_HINT}=1; path=/; max-age=${SESSION_HINT_MAX_AGE}; SameSite=Lax${secure}`;
}

/** Dọn dấu vết phía trình duyệt. Không gọi mạng — phần thu hồi ở server do clearSession() lo. */
function clearLocalSession() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
  document.cookie = `${SESSION_HINT}=; path=/; max-age=0`;
  invalidateGetCache();
}

/**
 * Đăng xuất thật: BE xoá refreshTokenHash và xoá ba cookie, sau đó mới dọn phía client.
 * Bản cũ chỉ dọn localStorage nên phiên vẫn sống nguyên ở server.
 */
export async function clearSession(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: csrfHeader(),
    });
  } catch {
    /* mất mạng — vẫn dọn phía client để người dùng không kẹt ở trạng thái nửa vời */
  }
  clearLocalSession();
}

function csrfHeader(): Record<string, string> {
  const token = readCookie(CSRF_COOKIE);
  return token ? { [CSRF_HEADER]: token } : {};
}

// --- Gia hạn phiên ---
// Access token chỉ sống 15 phút. Khi nó hết hạn, request đầu tiên nhận 401 và ta lặng lẽ gọi
// /auth/refresh rồi thử lại — người dùng không thấy gì.
//
// Một promise dùng chung cho mọi request cùng lúc: trang dashboard bắn mười lời gọi song song,
// không có chốt này thì cả mười cùng gọi refresh, mười lần xoay vòng token, chín lần cuối dùng
// refresh token vừa bị chính nó vô hiệu hoá → đăng xuất oan.
let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: csrfHeader(),
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

function forceLogout() {
  clearLocalSession();
  // Điều hướng cứng (không dùng router) để xoá sạch state React trong bộ nhớ của phiên cũ.
  window.location.assign(new URL("/login", window.location.origin));
}

type RequestInit_ = { method?: string; body?: unknown };

/**
 * Một cửa duy nhất cho mọi lời gọi API. Tự đính cookie, tự gắn header CSRF cho lệnh ghi, và tự
 * gia hạn phiên đúng một lần khi gặp 401.
 *
 * Header được dựng lại ở lần thử thứ hai chứ không tái dùng: /auth/refresh cấp cookie CSRF MỚI,
 * gửi lại token cũ sẽ ăn 403 dù phiên đã được gia hạn thành công.
 */
async function request(path: string, init: RequestInit_ = {}, isRetry = false): Promise<Response> {
  const method = init.method ?? "GET";
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET" && method !== "HEAD") Object.assign(headers, csrfHeader());

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  if (res.status !== 401 || isRetry || typeof window === "undefined") return res;

  // Ở trang đăng nhập, 401 nghĩa là sai mật khẩu — phải hiện lỗi chứ không phải nạp lại trang.
  // Các endpoint /auth/* tự xử lý phiên của chúng, gia hạn ở đây sẽ thành đệ quy.
  if (window.location.pathname === "/login" || path.startsWith("/auth/")) return res;

  if (await refreshSession()) return request(path, init, true);

  forceLogout();
  return res;
}

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

/** Đăng nhập. Token đi vào cookie HttpOnly, ở đây chỉ nhận lại hồ sơ người dùng. */
export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await request("/auth/login", { method: "POST", body: { email, password } });
  const data = await handle(res);
  setAuthUser(data.user);
  setSessionHint();
  return data.user as AuthUser;
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
  const p = request(path)
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
  request(path, { method: "POST", body })
    .then(handle)
    .then((r) => {
      invalidateGetCache();
      return r;
    });

export const apiPatch = (path: string, body?: unknown) =>
  request(path, { method: "PATCH", body })
    .then(handle)
    .then((r) => {
      invalidateGetCache();
      return r;
    });

export const apiDelete = (path: string) =>
  request(path, { method: "DELETE" })
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
