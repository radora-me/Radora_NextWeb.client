"use client";

import { useState } from "react";
import { BrainCircuit, ChevronDown, ChevronUp, RefreshCw, Sparkles } from "lucide-react";
import { useFinanceAiAnalysis } from "../services/finance.service";

function renderAnalysis(text: string) {
  return text.split("\n").map((line, i) => {
    if (/^\*\*(.+)\*\*/.test(line)) {
      const heading = line.replace(/^\*\*(.+)\*\*.*/, "$1");
      const rest = line.replace(/^\*\*(.+)\*\*/, "").trim();
      return (
        <p key={i} className="mt-4 first:mt-0">
          <span className="font-semibold text-foreground">{heading}</span>
          {rest && <span className="text-muted-foreground"> {rest}</span>}
        </p>
      );
    }
    if (/^[-•]/.test(line.trim())) {
      return (
        <li key={i} className="ml-4 mt-1 list-disc text-muted-foreground">
          {line.replace(/^[-•]\s*/, "")}
        </li>
      );
    }
    if (line.trim() === "") return null;
    return <p key={i} className="mt-2 text-muted-foreground">{line}</p>;
  });
}

export function FinanceAiAnalysis() {
  const { data, isLoading, isFetching, refetch } = useFinanceAiAnalysis();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-6 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-slate-50 shadow-sm dark:border-violet-900 dark:from-violet-950/30 dark:to-slate-900/40">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50">
            <BrainCircuit className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Finance Analysis</p>
            {data?.generatedAt && (
              <p className="text-[11px] text-muted-foreground">
                Generated {new Date(data.generatedAt).toLocaleString("en-IN")}
              </p>
            )}
          </div>
          <span className="ml-1 flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
            <Sparkles className="h-3 w-3" /> Radora&apos;s Radium AI
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50 dark:bg-slate-900"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-muted dark:bg-slate-900"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-violet-100 px-5 py-4 dark:border-violet-900/50">
          {isLoading ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin text-violet-500" />
              Groq is analysing your finance department data…
            </div>
          ) : data?.analysis ? (
            <div className="text-sm leading-6">{renderAnalysis(data.analysis)}</div>
          ) : (
            <p className="text-sm text-muted-foreground">No analysis available. Click Refresh to generate one.</p>
          )}
        </div>
      )}
    </div>
  );
}
