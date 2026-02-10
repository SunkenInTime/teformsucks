"use client";

import Link from "next/link";

import { QuizHub } from "@/components/quiz/quiz-hub";

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      <section className="flex min-h-screen items-center justify-center bg-dot-grid px-6">
        <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            te form <span className="line-through text-muted-foreground">sucks</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
            scroll to start
          </p>
        </div>
      </section>

      <section id="quizzes" className="px-6 py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Quizzes</h2>
              <p className="text-sm text-muted-foreground">
                Pick a focus or build a custom mix. Each question shows the type
                label and a soft kana hint.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link className="text-sm underline" href="/cheatsheet">
                Cheat sheet
              </Link>
              <Link className="text-sm underline" href="/quiz?preset=verb-masu">
                Jump to quiz
              </Link>
            </div>
          </div>
          <QuizHub />
        </div>
      </section>
    </main>
  );
}
