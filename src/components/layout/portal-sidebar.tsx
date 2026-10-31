"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, LogOut, PanelLeft, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  groupNavItems,
  isNavItemActive,
  type NavGroupId,
} from "@/config/nav-groups";
import { useAuth } from "@/features/auth/context/auth-context";
import { cn } from "@/lib/utils";
import type { PortalNavItem, UserRole } from "@/types";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
  librarian: "Librarian",
};

export type PortalSidebarProps = {
  /** Portal name shown under the product name, e.g. "Administration". */
  portalLabel: string;
  /** Portal landing route; the brand block links here. */
  homeHref: string;
  /** The existing per-role nav array, untouched. */
  items: PortalNavItem[];
  /** Footer destination route, e.g. "/settings" or "/teacher-profile". */
  accountHref: string;
  accountLabel: string;
  accountIcon: PortalNavItem["icon"];
};

/**
 * One sidebar for every portal. Section membership lives in `nav-groups.ts`;
 * routes, labels, icons, badges, roles and sign-out wiring are unchanged.
 */
export function PortalSidebar({
  portalLabel,
  homeHref,
  items,
  accountHref,
  accountLabel,
  accountIcon: AccountIcon,
}: PortalSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();

  const [query, setQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<
    Partial<Record<NavGroupId, boolean>>
  >({});

  const groups = useMemo(() => groupNavItems(items), [items]);
  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0;

  const visibleGroups = useMemo(() => {
    if (!isFiltering) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.title.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, isFiltering, normalizedQuery]);

  const toggleGroup = (id: NavGroupId) => {
    setCollapsedGroups((current) => ({ ...current, [id]: !current[id] }));
  };

  const userName = user?.name || "Radora user";
  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "RN";

  const accountSubtitle = user
    ? user.role === "student" && user.rollNumber
      ? `Roll no. ${user.rollNumber}`
      : user.role === "teacher" && user.isSubjectTeacher
        ? "Subject teacher"
        : roleLabels[user.role]
    : "";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="gap-0 p-3 pb-2 group-data-[collapsible=icon]:p-2">
        <div className="flex h-10 items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            href={homeHref}
            className="flex min-w-0 flex-1 items-center gap-2.5 group-data-[collapsible=icon]:flex-none"
          >
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-sidebar-accent ring-1 ring-sidebar-border group-data-[collapsible=icon]:size-8">
              <Image
                src="/logo/Next1.png"
                alt="Radora Next"
                width={36}
                height={36}
                className="size-9 object-cover"
                priority
              />
            </span>
            <span className="min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="block truncate text-[13px] font-semibold leading-4 text-sidebar-foreground">
                Radora Next
              </span>
              <span className="mt-[3px] block truncate text-[11px] leading-3 text-sidebar-foreground/55">
                {portalLabel}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="hidden size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground md:flex group-data-[collapsible=icon]:md:hidden"
          >
            <PanelLeft className="size-4" />
          </button>
        </div>
      </SidebarHeader>

      <div className="px-3 pb-2 group-data-[collapsible=icon]:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-sidebar-foreground/40" />
          <Input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter navigation"
            aria-label={`Filter ${portalLabel} navigation`}
            className="h-9 rounded-md border-sidebar-border/70 bg-sidebar-accent/50 pr-2 pl-8 text-[12.5px] text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus-visible:border-sidebar-primary focus-visible:ring-0 in-data-[mobile=true]:h-10 in-data-[mobile=true]:text-[13px]"
          />
        </div>
      </div>

      <SidebarContent
        role="navigation"
        aria-label={`${portalLabel} navigation`}
        className="gap-1.5 px-2 pb-3"
      >
        {visibleGroups.length === 0 ? (
          <p className="px-3 py-6 text-[12px] text-sidebar-foreground/50">
            No matches
          </p>
        ) : (
          visibleGroups.map((group) => {
            const expanded = isFiltering || !collapsedGroups[group.id];

            return (
              <SidebarGroup key={group.id} className="p-0">
                <SidebarSeparator className="mx-2 mb-1.5 hidden group-data-[collapsible=icon]:block" />
                <SidebarGroupLabel
                  render={
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      aria-expanded={expanded}
                    />
                  }
                  className="h-6 cursor-pointer gap-1.5 rounded-md px-3 text-[11px] font-medium tracking-normal text-sidebar-foreground/45 hover:bg-transparent hover:text-sidebar-foreground/80 in-data-[mobile=true]:h-9"
                >
                  <span className="flex-1 truncate text-left">{group.label}</span>
                  {group.items.length > 1 ? (
                    <span className="text-[10.5px] font-normal tabular-nums text-sidebar-foreground/25">
                      {group.items.length}
                    </span>
                  ) : null}
                  {expanded ? (
                    <ChevronDown className="size-3 shrink-0 text-sidebar-foreground/30" />
                  ) : (
                    <ChevronRight className="size-3 shrink-0 text-sidebar-foreground/30" />
                  )}
                </SidebarGroupLabel>

                {expanded ? (
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => {
                        const active = isNavItemActive(pathname, item.href);

                        return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                              render={
                                <Link
                                  href={item.href}
                                  aria-current={active ? "page" : undefined}
                                />
                              }
                              isActive={active}
                              tooltip={item.title}
                              className={cn(
                                "h-8 gap-2.5 px-2.5 text-[13px] text-sidebar-foreground/80 in-data-[mobile=true]:h-10",
                                active &&
                                  "bg-sidebar-accent font-medium text-sidebar-foreground"
                              )}
                            >
                              <item.icon
                                className={cn(
                                  "size-4 shrink-0",
                                  active
                                    ? "text-sidebar-primary"
                                    : "text-sidebar-foreground/55"
                                )}
                              />
                              <span>{item.title}</span>
                            </SidebarMenuButton>
                            {item.badge ? (
                              <SidebarMenuBadge className="bg-primary text-[10px] font-medium text-primary-foreground">
                                {item.badge}
                              </SidebarMenuBadge>
                            ) : null}
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                ) : null}
              </SidebarGroup>
            );
          })
        )}
      </SidebarContent>

      <SidebarFooter className="gap-1 border-t border-sidebar-border/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href={accountHref} />}
              isActive={isNavItemActive(pathname, accountHref)}
              tooltip={accountLabel}
              className="h-8 gap-2.5 px-2.5 text-[12.5px] text-sidebar-foreground/70"
            >
              <AccountIcon className="size-4 shrink-0 text-sidebar-foreground/55" />
              <span>{accountLabel}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex h-11 items-center gap-2.5 rounded-lg bg-sidebar-accent/60 px-2 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0">
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={user?.image || ""} alt={userName} />
            <AvatarFallback className="bg-primary text-[10px] font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-[12.5px] leading-4 font-medium text-sidebar-foreground">
              {userName}
            </p>
            {accountSubtitle ? (
              <p className="mt-[2px] truncate text-[10.5px] leading-3 text-sidebar-foreground/55">
                {accountSubtitle}
              </p>
            ) : null}
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Sign out"
              className="h-8 gap-2.5 px-2.5 text-[12.5px] text-sidebar-foreground/70"
            >
              <LogOut className="size-4 shrink-0 text-sidebar-foreground/55" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
