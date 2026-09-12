import type { NextConfig } from "next";

// Server-side proxy: trình duyệt gọi /api/* trên domain FE → Vercel forward sang Railway.
// Cookie SameSite=Lax chỉ ổn khi same-origin; không cần đổi domain BE.
// Vercel: API_PROXY_TARGET=https://adsvcb-be-production.up.railway.app
//         NEXT_PUBLIC_API_URL=/api
// Railway (khi dùng proxy): COOKIE_REFRESH_PATH=/api/auth
const proxyTarget = (process.env.API_PROXY_TARGET ?? "http://localhost:3001").replace(
  /\/+$/,
  "",
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${proxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;