"use client";

import Link from "next/link";
import { Home } from "lucide-react";

import { MidtermDictionaryWidget } from "@/components/midterm/midterm-dictionary-widget";
import { MidtermSession } from "@/components/midterm/midterm-session";
import { SoundToggle } from "@/components/sound-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import type { MidtermWordEntry } from "@/lib/midterm/types";

export function MidtermPageClient({ bank }: { bank: MidtermWordEntry[] }) {
  return (
    <main className="relative min-h-screen bg-background px-6 py-10 text-foreground flex flex-col">
      <div className="pointer-events-none absolute inset-0 bg-dot-grid" />
      <header className="relative z-10 flex w-full items-center justify-between px-0">
        <Button variant="ghost" size="sm" asChild aria-label="Home">
          <Link href="/">
            <Home className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <SoundToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cheatsheet">Cheat sheet</Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <section className="relative z-10 flex w-full flex-1 items-center justify-center">
        <div className="mx-auto w-full max-w-6xl lg:w-[80vw]">
          <MidtermSession
            bank={bank}
            className="rounded-2xl border border-border/60 bg-card/90 p-8 shadow-lg backdrop-blur"
          />
        </div>
      </section>

      <MidtermDictionaryWidget bank={bank} />
    </main>
  );
}
