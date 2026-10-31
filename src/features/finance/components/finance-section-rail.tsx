"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, WalletCards } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  groupFinanceSections,
  type FinanceSection,
} from "../lib/finance-utils";

type FinanceSectionRailProps = {
  sections: FinanceSection[];
  active: string;
  onSelect: (id: string) => void;
  /** Records already loaded per section, so counts never fabricate a number. */
  counts?: Record<string, number>;
  className?: string;
};

export function FinanceSectionRail({
  sections,
  active,
  onSelect,
  counts,
  className,
}: FinanceSectionRailProps) {
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Overview: true,
    "Fee Management": true,
    Accounting: false,
    Operations: false,
    Controls: false,
    Intelligence: false,
  });

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0;

  const groups = useMemo(() => {
    if (!isFiltering) return groupFinanceSections(sections);

    return groupFinanceSections(
      sections.filter((section) =>
        section.label.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [sections, isFiltering, normalizedQuery]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl bg-card p-3 text-sm ring-1 ring-foreground/10",
        className
      )}
    >
      <div className="rounded-lg bg-foreground px-3 py-2.5 text-background">
        <div className="flex items-center gap-2">
          <WalletCards className="size-4 shrink-0" aria-hidden="true" />
          <p className="truncate text-sm font-semibold">Finance &amp; Accounts</p>
        </div>
        <p className="mt-1 text-[11px] text-background/60">
          {sections.length} sections
        </p>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter sections"
          aria-label="Filter finance sections"
          className="h-8 pl-8 text-[13px]"
        />
      </div>

      <div className="max-h-[calc(100dvh-16rem)] space-y-2 overflow-y-auto pr-0.5">
        {groups.length === 0 ? (
          <p className="px-2 py-6 text-xs text-muted-foreground">
            No sections match.
          </p>
        ) : (
          groups.map(({ group, sections: groupSections }) => {
            const expanded = isFiltering || Boolean(openGroups[group]);

            return (
              <div key={group}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() =>
                    setOpenGroups((current) => ({
                      ...current,
                      [group]: !current[group],
                    }))
                  }
                  className="flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="flex-1 truncate text-left">{group}</span>
                  <span className="text-[10.5px] font-normal tabular-nums text-muted-foreground/70">
                    {groupSections.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3 shrink-0 transition-transform",
                      expanded ? "" : "-rotate-90"
                    )}
                    aria-hidden="true"
                  />
                </button>

                {expanded ? (
                  <div className="mt-0.5 space-y-px">
                    {groupSections.map((section) => {
                      const isActive = section.id === active;
                      const count = counts?.[section.id];

                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => onSelect(section.id)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                            isActive
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <span className="flex-1 truncate">{section.label}</span>
                          {count !== undefined ? (
                            <span className="text-[10.5px] tabular-nums text-muted-foreground/70">
                              {count}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
