"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";

import { QuizHub } from "@/components/quiz/quiz-hub";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [activeSection, setActiveSection] = React.useState<"hero" | "quiz">(
    "hero"
  );
  const isQuiz = activeSection === "quiz";

  return (
    <main className="relative h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-dot-grid transition-transform duration-700"
        style={{
          transform: isQuiz ? "translateX(-50vw)" : "translateX(0)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          {isQuiz && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Back to hero"
              onClick={() => setActiveSection("hero")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <div
        className="flex h-screen w-[200vw] transition-transform duration-700"
        style={{
          transform: isQuiz ? "translateX(-100vw)" : "translateX(0)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <section className="flex h-screen w-screen items-center justify-center px-6 box-border">
          <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
              te form <span className="line-through text-muted-foreground">sucks</span>
            </h1>
            <button
              type="button"
              onClick={() => setActiveSection("quiz")}
              className="cursor-pointer text-sm uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-foreground"
            >
              click to start
            </button>
          </div>
        </section>

        <section className="flex h-screen w-screen items-start overflow-y-auto px-6 pt-24 pb-12 box-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Quizzes</h2>
                <p className="text-sm text-muted-foreground">
                  Pick a focus or build a custom mix. Each question shows the type
                  label and a soft kana hint.
                </p>
              </div>
            </div>
            <QuizHub isQuizVisible={isQuiz} />
          </div>
        </section>
      </div>
    </main>
  );
}
