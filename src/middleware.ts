import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Các trang PUBLIC (không cần đăng nhập)
const PUBLIC_PATHS = ["/login"];

// Đuôi file tĩnh trong /public được phục vụ không cần đăng nhập.
const STATIC_FILE = /\.(png|jpe?g|gif|svg|webp|avif|ico|txt|xml|webmanifest|woff2?|ttf|otf|css|js|map)$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cho phép static files đi qua. Chỉ nhận đúng các đuôi file tĩnh — trước đây
  // dùng pathname.includes(".") nên mọi URL có dấu chấm đều lọt qua kiểm tra.
  if (pathname.startsWith("/_next") || STATIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  // Nếu đang ở trang public (login) và đã có token → redirect về trang chủ
  if (PUBLIC_PATHS.includes(pathname)) {
    if (token) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  // Nếu chưa có token → redirect về login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
