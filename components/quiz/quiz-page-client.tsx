"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { QuizSession } from "@/components/quiz/quiz-session";
import { Button } from "@/components/ui/button";
import {
  CUSTOM_QUIZ_STORAGE_KEY,
  defaultCustomConfig,
  getPresetById,
  type QuizConfig,
} from "@/lib/quiz/config";

function loadCustomConfig(): QuizConfig {
  if (typeof window === "undefined") return defaultCustomConfig;
  const raw = window.localStorage.getItem(CUSTOM_QUIZ_STORAGE_KEY);
  if (!raw) return defaultCustomConfig;
  try {
    const parsed = JSON.parse(raw) as QuizConfig;
    return { ...defaultCustomConfig, ...parsed, id: "custom" };
  } catch {
    return defaultCustomConfig;
  }
}

export function QuizPageClient() {
  const params = useSearchParams();
  const presetId = params.get("preset");
  const useCustom = params.get("custom") === "1";

  const [config, setConfig] = React.useState<QuizConfig>(() => {
    if (useCustom) return defaultCustomConfig;
    return getPresetById(presetId) ?? defaultCustomConfig;
  });

  React.useEffect(() => {
    if (useCustom) {
      setConfig(loadCustomConfig());
      return;
    }
    setConfig(getPresetById(presetId) ?? defaultCustomConfig);
  }, [presetId, useCustom]);

  return (
    <main className="relative min-h-screen bg-background px-6 py-10 flex flex-col">
      <div className="pointer-events-none absolute inset-0 bg-dot-grid" />
      <header className="relative z-10 flex w-full items-center justify-between px-0">
        <Button variant="ghost" size="sm" asChild aria-label="Home">
          <Link href="/">
            <Home className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cheatsheet">Cheat sheet</Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <section className="relative z-10 flex w-full flex-1 items-center justify-center">
        <div className="mx-auto w-full max-w-6xl lg:w-[80vw]">
          <QuizSession
            config={config}
            className="rounded-2xl border border-border/60 bg-card/90 p-8 shadow-lg backdrop-blur"
          />
        </div>
      </section>
    </main>
  );
}
