"use client";

import * as React from "react";
import { ArrowLeft, Github } from "lucide-react";

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

      {!isQuiz && (
        <div className="fixed bottom-6 right-6 z-20 flex flex-col items-end gap-2 text-right">
          <a
            href="https://github.com/sunkenintime"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-3 w-3" aria-hidden="true" />
            github
          </a>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-muted-foreground">
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.028C.533 9.045-.319 13.579.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.04.078.078 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.105 13.107 13.107 0 0 1-1.872-.9.077.077 0 0 1-.008-.127c.126-.094.252-.192.371-.291a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.099.246.198.372.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.9.076.076 0 0 0-.04.106c.36.698.772 1.363 1.225 1.993a.077.077 0 0 0 .084.028 19.876 19.876 0 0 0 6.002-3.04.077.077 0 0 0 .03-.056c.5-5.177-.838-9.673-3.548-13.66a.061.061 0 0 0-.031-.029ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.419-2.157 2.419Z" />
            </svg>
            sunkenintime
          </div>
        </div>
      )}

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
