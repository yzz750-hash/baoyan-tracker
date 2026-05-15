"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, FileText, Calendar } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/universities", label: "院校库", icon: Building2 },
  { href: "/documents", label: "文书管理", icon: FileText },
  { href: "/calendar", label: "日历", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen border-r border-gray-100 bg-white p-6 flex flex-col">
      <div className="text-lg font-bold text-[#1A1A1A] mb-8">保研进度通</div>
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[#FF6B35]/10 text-[#FF6B35] font-medium"
                  : "text-[#6B7280] hover:bg-gray-50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
