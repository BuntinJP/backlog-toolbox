"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarItems } from "./sidebar-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[var(--sidebar-width)] h-screen fixed top-0 left-0 flex flex-col bg-sidebar-bg border-r border-border z-100">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <span className="text-2xl">🧰</span>
        <span className="text-base font-bold text-foreground tracking-tight">
          Backlog Toolbox
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
        <Link
          href="/"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
            pathname === "/"
              ? "bg-active-bg text-accent"
              : "text-muted hover:bg-hover-bg hover:text-foreground"
          }`}
        >
          <span className="text-lg shrink-0">🏠</span>
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            ダッシュボード
          </span>
        </Link>

        {sidebarItems.length > 0 && (
          <div className="h-px bg-border mx-3 my-2" />
        )}

        {sidebarItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
              pathname === item.href
                ? "bg-active-bg text-accent"
                : "text-muted hover:bg-hover-bg hover:text-foreground"
            }`}
            title={item.description}
          >
            <span className="text-lg shrink-0">{item.icon}</span>
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        <span className="text-xs text-muted">v0.1.0</span>
      </div>
    </aside>
  );
}
