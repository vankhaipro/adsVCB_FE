import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider, themeNoFlashScript } from "@/components/ThemeProvider";

const roboto = Roboto({
  weight: ["400", "500", "700", "900"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "VCB Ads Manager",
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
      className={`${roboto.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body className="h-full bg-background text-foreground font-sans">
        <ThemeProvider>
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
