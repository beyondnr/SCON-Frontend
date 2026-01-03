"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, FileText, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "근무표", icon: Calendar },
    { href: "/reports", label: "리포트", icon: FileText },
    { href: "/settings", label: "관리", icon: Settings },
    { href: "/my-page", label: "마이페이지", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background shadow-[0_-1px_3px_rgba(0,0,0,0.05)] md:hidden safe-area-bottom">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-2 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
            )}
          >
            <Icon className={cn("h-6 w-6 mb-1", isActive && "fill-current/10")} />
            <span className={cn("text-[11px] font-medium", isActive && "font-bold")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

