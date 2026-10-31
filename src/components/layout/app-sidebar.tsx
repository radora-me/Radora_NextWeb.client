"use client";

import { Settings } from "lucide-react";

import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { navItems } from "@/config/nav-items";

/**
 * Admin portal (`(dashboard)` route group).
 * Nav data still comes from `src/config/nav-items.ts`; grouping lives in
 * `src/config/nav-groups.ts`.
 */
export function AppSidebar() {
  return (
    <PortalSidebar
      portalLabel="Administration"
      homeHref="/dashboard"
      items={navItems}
      accountHref="/settings"
      accountLabel="Settings"
      accountIcon={Settings}
    />
  );
}
