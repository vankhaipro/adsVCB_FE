// Client API nhỏ gọn quanh backend (NEXT_PUBLIC_API_URL).
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function handle(res: Response) {
  if (!res.ok) {
    let msg = `API ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error || msg;
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

// Format tiền VND
export const fmtVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(n || 0)) + "đ";
