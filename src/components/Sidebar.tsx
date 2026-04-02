"use client";

import { House, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from "@/lib/app-meta";
import { sidebarItems } from "./sidebar-items";
import {
  Sidebar as AppSidebarShell,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <AppSidebarShell collapsible="icon">
      <SidebarHeader className="gap-0 px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <Wrench className="size-5" />
          </div>
          <div className="grid flex-1 text-left group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">
              {APP_NAME}
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              {APP_DESCRIPTION}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/"}
              tooltip="ダッシュボード"
            >
              <Link href="/">
                <House />
                <span>ダッシュボード</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {sidebarItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3">
        <div className="rounded-lg border border-sidebar-border/70 bg-sidebar-accent/40 px-3 py-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          v{APP_VERSION}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </AppSidebarShell>
  );
}
