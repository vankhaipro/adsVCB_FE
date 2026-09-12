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
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || STATIC_FILE.test(pathname)) {
    return NextResponse.next();
  }
  // Cờ do chính frontend đặt sau khi đăng nhập (xem setSessionHint trong lib/api.ts), KHÔNG phải
  // cookie của backend. Cookie backend nằm trên domain khác nên middleware chỉ thấy chúng khi
  // biến COOKIE_DOMAIN được cấu hình đúng — quên biến đó là người dùng kẹt trong vòng lặp
  // chuyển hướng dù đăng nhập thành công.
  //
  // Đây chỉ là chặn điều hướng cho đỡ chớp màn hình, không phải lớp bảo mật. Lớp chặn thật nằm
  // ở backend, nơi kiểm chữ ký token trong cookie HttpOnly và tra lại tài khoản trong cơ sở
  // dữ liệu ở mỗi request.
  const session = request.cookies.get("vcbi_session")?.value;

  // Nếu đang ở trang public (login) và đã có phiên → redirect về trang chủ
  if (PUBLIC_PATHS.includes(pathname)) {
    if (session) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  // Nếu chưa có phiên → redirect về login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
