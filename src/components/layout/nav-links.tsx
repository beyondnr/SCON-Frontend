"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "스케줄 대시보드" },
  { href: "/reports", label: "급여 리포트" },
  { href: "/settings", label: "매장 설정" },
  { href: "/availability", label: "가용시간 제출" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === href ? "text-primary" : "text-muted-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
