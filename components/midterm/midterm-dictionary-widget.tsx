"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MidtermWordEntry } from "@/lib/midterm/types";

function normalizeEnglish(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[.,!?;:()"']/g, "")
    .trim();
}

function normalizeJapanese(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, "").trim();
}

function matchesEntry(entry: MidtermWordEntry, query: string) {
  const normalizedEnglishQuery = normalizeEnglish(query);
  const normalizedJapaneseQuery = normalizeJapanese(query);

  const englishFields = [
    entry.meaning,
    entry.partOfSpeech,
    entry.source,
    ...entry.notes,
    ...entry.tags,
  ].map(normalizeEnglish);

  const japaneseFields = [entry.kana, ...entry.kanjiVariants].map(normalizeJapanese);

  return (
    englishFields.some((field) => field.includes(normalizedEnglishQuery)) ||
    japaneseFields.some((field) => field.includes(normalizedJapaneseQuery))
  );
}

export function MidtermDictionaryWidget({ bank }: { bank: MidtermWordEntry[] }) {
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState(true);

  const filtered = React.useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    return bank
      .filter((entry) => matchesEntry(entry, trimmed))
      .sort((left, right) => {
        const leftStarts =
          normalizeEnglish(left.meaning).startsWith(normalizeEnglish(trimmed)) ||
          normalizeJapanese(left.kana).startsWith(normalizeJapanese(trimmed));
        const rightStarts =
          normalizeEnglish(right.meaning).startsWith(normalizeEnglish(trimmed)) ||
          normalizeJapanese(right.kana).startsWith(normalizeJapanese(trimmed));

        if (leftStarts && !rightStarts) return -1;
        if (!leftStarts && rightStarts) return 1;
        return left.meaning.localeCompare(right.meaning);
      })
      .slice(0, 8);
  }, [bank, query]);

  return (
    <aside className="fixed bottom-4 right-4 z-30 w-[min(24rem,calc(100vw-2rem))]">
      <div className="rounded-2xl border border-border/80 bg-card/95 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Cheat Widget
            </p>
            <p className="text-sm font-medium">Mini dictionary</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label={expanded ? "Minimize dictionary" : "Expand dictionary"}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="space-y-3 p-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search English, kana, or kanji"
              className="h-10 text-sm"
            />

            {!query.trim() && (
              <p className="text-sm text-muted-foreground">
                Try `tall`, `married`, `結婚`, or `べんきょう`.
              </p>
            )}

            {query.trim() && filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">No matches.</p>
            )}

            {filtered.length > 0 && (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {filtered.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "rounded-xl border border-border/70 bg-background/70 px-3 py-2",
                      "transition-colors hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{entry.kana}</p>
                        {entry.kanjiVariants.length > 0 && (
                          <p className="truncate text-xs text-muted-foreground">
                            {entry.kanjiVariants.join(" / ")}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {entry.partOfSpeech}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/90">{entry.meaning}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
