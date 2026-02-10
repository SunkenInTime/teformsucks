"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { QuizSession } from "@/components/quiz/quiz-session";
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

export default function QuizPage() {
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
    <main className="min-h-screen bg-background px-6 py-10">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link className="text-sm underline" href="/">
          Home
        </Link>
        <div className="flex items-center gap-3">
          <Link className="text-sm underline" href="/cheatsheet">
            Cheat sheet
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto mt-10 w-full max-w-5xl">
        <QuizSession config={config} />
      </section>
    </main>
  );
}
