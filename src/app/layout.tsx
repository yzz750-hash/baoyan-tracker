import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "保研进度通",
  description: "保研通知与进度管理系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
