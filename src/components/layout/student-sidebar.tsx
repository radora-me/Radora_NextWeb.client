"use client";

import { User } from "lucide-react";

import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { studentNavItems } from "@/config/student-nav-items";

/**
 * Student portal. `studentNavItems` stays the single source of truth for
 * routes, labels, icons and badges.
 */
export function StudentSidebar() {
  return (
    <PortalSidebar
      portalLabel="Student"
      homeHref="/student-dashboard"
      items={studentNavItems}
      accountHref="/student-profile"
      accountLabel="My Profile"
      accountIcon={User}
    />
  );
}
