"use client";

import { useEffect, useRef, useState } from "react";
import { BrainCircuit, ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useFinanceAiAnalysis } from "../services/finance.service";

/**
 * Strip markdown formatting characters from the AI response while preserving
 * the text content.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1");
}

/** Reveals the analysis character by character. */
function useTypewriter(fullText: string, speed = 12) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const previousText = useRef("");

  useEffect(() => {
    if (fullText === previousText.current) return;
    previousText.current = fullText;

    let index = 0;

    const interval = setInterval(() => {
      index += 1;
      setDisplayed(fullText.slice(0, index));
      setIsDone(index >= fullText.length);
      if (index >= fullText.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [fullText, speed]);

  const skipToEnd = () => {
    setDisplayed(fullText);
    setIsDone(true);
  };

  return { displayed, isDone, skipToEnd };
}

function renderPlainText(text: string) {
  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (trimmed === "") return null;

    if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s*/, "");
      return (
        <p key={index} className="mt-3 first:mt-0">
          <span className="font-medium text-foreground">{content}</span>
        </p>
      );
    }

    if (/^[-•]\s/.test(trimmed)) {
      return (
        <li key={index} className="mt-1 ml-4 list-disc text-muted-foreground">
          {trimmed.replace(/^[-•]\s*/, "")}
        </li>
      );
    }

    return (
      <p key={index} className="mt-2 text-muted-foreground">
        {trimmed}
      </p>
    );
  });
}

type FinanceAiAnalysisProps = {
  className?: string;
  defaultExpanded?: boolean;
};

/**
 * Compact, collapsed-by-default insight strip. Expanding reveals the generated
 * analysis; the strip itself never interprets or writes accounting records.
 */
export function FinanceAiAnalysis({
  className,
  defaultExpanded = false,
}: FinanceAiAnalysisProps) {
  const { data, isLoading, isFetching, refetch } = useFinanceAiAnalysis();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const cleanAnalysis = data?.analysis ? stripMarkdown(data.analysis) : "";
  const summary =
    cleanAnalysis
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? "";

  const { displayed, isDone, skipToEnd } = useTypewriter(cleanAnalysis, 12);

  return (
    <Card size="sm" className={cn("gap-0 py-0", className)}>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 px-3 py-2.5">
        <BrainCircuit className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">Finance analysis</span>

        {isLoading ? (
          <span className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            Analysing finance records…
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {summary || "No analysis returned."}
          </span>
        )}

        {data?.generatedAt ? (
          <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">
            Generated {formatDateTime(data.generatedAt)}
          </span>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh analysis"
            title="Refresh analysis"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
            {expanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t px-4 py-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Analysing finance records…</p>
          ) : data?.analysis ? (
            <>
              <div className="text-sm leading-6">{renderPlainText(displayed)}</div>
              {!isDone ? (
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-block h-4 w-0.5 animate-pulse bg-primary" aria-hidden="true" />
                  <Button variant="ghost" size="xs" onClick={skipToEnd}>
                    Skip animation
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No analysis returned.</p>
          )}
        </div>
      ) : null}
    </Card>
  );
}
