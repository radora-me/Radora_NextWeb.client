"use client";

import { BookMarked, BookOpen, LayoutDashboard, User } from "lucide-react";

import { PortalSidebar } from "@/components/layout/portal-sidebar";
import type { PortalNavItem } from "@/types";

/**
 * Librarian portal. `My Profile` moved from the nav list into the account
 * footer; every href and label is unchanged.
 */
const navigation: PortalNavItem[] = [
  { title: "Dashboard", href: "/librarian-dashboard", icon: LayoutDashboard },
  { title: "Issue / Return", href: "/librarian-issues", icon: BookOpen },
  { title: "Book Registry", href: "/librarian-books", icon: BookMarked },
];

export function LibrarianSidebar() {
  return (
    <PortalSidebar
      portalLabel="Library"
      homeHref="/librarian-dashboard"
      items={navigation}
      accountHref="/librarian-profile"
      accountLabel="My Profile"
      accountIcon={User}
    />
  );
}
