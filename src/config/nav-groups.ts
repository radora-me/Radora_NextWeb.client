import type { PortalNavItem } from "@/types";

/**
 * Sidebar sections. Routes, labels, icons and badges keep living in
 * `nav-items.ts` / `student-nav-items.ts` (and the per-portal arrays) —
 * this file only says which section each existing route belongs to.
 */
export type NavGroupId =
  | "overview"
  | "people"
  | "academics"
  | "circulation"
  | "catalogue"
  | "finance"
  | "resources"
  | "communication"
  | "payments"
  | "more";

export const navGroupOrder: NavGroupId[] = [
  "overview",
  "people",
  "academics",
  "circulation",
  "catalogue",
  "finance",
  "resources",
  "communication",
  "payments",
  "more",
];

export const navGroupLabels: Record<NavGroupId, string> = {
  overview: "Overview",
  people: "People",
  academics: "Academics",
  circulation: "Circulation",
  catalogue: "Catalogue",
  finance: "Finance",
  resources: "Resources",
  communication: "Communication",
  payments: "Payments",
  more: "More",
};

const navGroupByHref: Record<string, NavGroupId> = {
  // Overview
  "/dashboard": "overview",
  "/teacher-dashboard": "overview",
  "/student-dashboard": "overview",
  "/librarian-dashboard": "overview",

  // People
  "/students": "people",
  "/teachers": "people",
  "/admin-student-management": "people",
  "/teacher-students": "people",

  // Academics
  "/attendance": "academics",
  "/timetable": "academics",
  "/exams": "academics",
  "/leaderboard": "academics",
  "/teacher-attendance": "academics",
  "/teacher-homework": "academics",
  "/teacher-tests": "academics",
  "/teacher-leaderboard": "academics",
  "/student-attendance": "academics",
  "/student-homework": "academics",
  "/student-timetable": "academics",
  "/student-tests": "academics",
  "/student-leaderboard": "academics",

  // Library
  "/librarian-issues": "circulation",
  "/librarian-books": "catalogue",

  // Finance
  "/finance": "finance",
  "/fees": "finance",

  // Resources
  "/library": "resources",
  "/events": "resources",
  "/teacher-events": "resources",
  "/student-library": "resources",
  "/student-events": "resources",

  // Communication
  "/notifications": "communication",
  "/teacher-chat": "communication",
  "/teacher-notifications": "communication",
  "/student-ai-chat": "communication",
  "/student-classroom-chat": "communication",
  "/student-notifications": "communication",

  // Payments (student)
  "/student-fees": "payments",
};

export type NavGroup = {
  id: NavGroupId;
  label: string;
  items: PortalNavItem[];
};

/**
 * Buckets the existing nav items into sections without reordering them inside a
 * section and without dropping anything: an unmapped route falls into "More".
 */
export function groupNavItems(items: PortalNavItem[]): NavGroup[] {
  const buckets = new Map<NavGroupId, PortalNavItem[]>();

  for (const item of items) {
    const groupId = navGroupByHref[item.href] ?? "more";
    const bucket = buckets.get(groupId);

    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(groupId, [item]);
    }
  }

  return navGroupOrder
    .filter((groupId) => buckets.has(groupId))
    .map((groupId) => ({
      id: groupId,
      label: navGroupLabels[groupId],
      items: buckets.get(groupId) as PortalNavItem[],
    }));
}

/** `/students` is active on `/students` and `/students/12`, never on `/student-dashboard`. */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}
