import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";

const roboto = Roboto({
  weight: ["400", "500", "700", "900"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Auto Ads Facebook",
  description: "Hệ thống tự động quản lý & tối ưu quảng cáo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${roboto.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full bg-background text-foreground font-sans">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
