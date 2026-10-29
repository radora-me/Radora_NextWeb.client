"use client";

import { useEffect, useRef, useState } from "react";
import { BrainCircuit, ChevronDown, ChevronUp, RefreshCw, Sparkles } from "lucide-react";
import { useFinanceAiAnalysis } from "../services/finance.service";

/**
 * Strip markdown formatting characters (**, ##, *, #) from the AI response
 * while preserving the actual text content.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s*/gm, "")    // remove heading markers (## , ### , etc.)
    .replace(/\*\*(.*?)\*\*/g, "$1") // remove bold markers **text** → text
    .replace(/\*(.*?)\*/g, "$1")     // remove italic markers *text* → text
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1"); // remove inline code markers
}

/**
 * Custom hook for typewriter effect — reveals text character by character.
 */
function useTypewriter(fullText: string, speed = 12) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const prevTextRef = useRef("");

  useEffect(() => {
    // If text hasn't changed, don't restart animation
    if (fullText === prevTextRef.current) return;
    prevTextRef.current = fullText;

    if (!fullText) {
      setDisplayed("");
      setIsDone(true);
      return;
    }

    setDisplayed("");
    setIsDone(false);
    let index = 0;

    const interval = setInterval(() => {
      index++;
      setDisplayed(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(interval);
        setIsDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [fullText, speed]);

  // Allow skipping to full text
  const skipToEnd = () => {
    setDisplayed(fullText);
    setIsDone(true);
  };

  return { displayed, isDone, skipToEnd };
}

/**
 * Render plain text (after markdown stripping) into styled paragraphs.
 * Recognizes numbered items (1. 2. ...) and bullet-like lines (- •).
 */
function renderPlainText(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (trimmed === "") return null;

    // Numbered heading lines like "1. Overall Financial Health"
    if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s*/, "");
      return (
        <p key={i} className="mt-4 first:mt-0">
          <span className="font-semibold text-foreground">{content}</span>
        </p>
      );
    }

    // Bullet lines
    if (/^[-•]\s/.test(trimmed)) {
      return (
        <li key={i} className="ml-4 mt-1 list-disc text-muted-foreground">
          {trimmed.replace(/^[-•]\s*/, "")}
        </li>
      );
    }

    return (
      <p key={i} className="mt-2 text-muted-foreground">
        {trimmed}
      </p>
    );
  });
}

export function FinanceAiAnalysis() {
  const { data, isLoading, isFetching, refetch } = useFinanceAiAnalysis();
  const [expanded, setExpanded] = useState(true);

  // Strip markdown from the analysis text
  const cleanAnalysis = data?.analysis ? stripMarkdown(data.analysis) : "";

  // Typewriter effect on the cleaned text
  const { displayed, isDone, skipToEnd } = useTypewriter(cleanAnalysis, 12);

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
              Radium AI is analysing your finance department data…
            </div>
          ) : data?.analysis ? (
            <div className="relative">
              <div className="text-sm leading-6">{renderPlainText(displayed)}</div>
              {!isDone && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-block h-4 w-0.5 animate-pulse bg-violet-500" />
                  <button
                    onClick={skipToEnd}
                    className="text-[11px] font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
                  >
                    Skip animation
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No analysis available. Click Refresh to generate one.</p>
          )}
        </div>
      )}
    </div>
  );
}
