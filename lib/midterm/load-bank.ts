import fs from "node:fs";
import path from "node:path";

import { adjectives, verbs } from "@/lib/data/words";
import { parseAdditionalWords } from "@/lib/midterm/parse-additional";
import type { MidtermWordEntry } from "@/lib/midterm/types";

function createBaseEntries() {
  const baseVerbs: MidtermWordEntry[] = verbs.map((word, index) => ({
    id: `base-verb-${String(index + 1).padStart(3, "0")}`,
    source: "base-library",
    kana: word.kana,
    kanjiVariants: word.kanji ?? [],
    meaning: word.meaning,
    partOfSpeech: "verb",
    conjugationClass: word.type,
    notes: [],
    tags: ["verb", `${word.type}-verb`],
  }));

  const baseAdjectives: MidtermWordEntry[] = adjectives.map((word, index) => ({
    id: `base-adjective-${String(index + 1).padStart(3, "0")}`,
    source: "base-library",
    kana: word.kana,
    kanjiVariants: word.kanji ?? [],
    meaning: word.meaning,
    partOfSpeech: "adjective",
    conjugationClass: word.type,
    notes: [],
    tags: ["adjective", `${word.type}-adjective`],
  }));

  return [...baseVerbs, ...baseAdjectives];
}

function createSupplementalEntries(): MidtermWordEntry[] {
  const peopleCounters = [
    ["ひとり", "one person"],
    ["ふたり", "two people"],
    ["さんにん", "three people"],
    ["よにん", "four people"],
    ["ごにん", "five people"],
    ["ろくにん", "six people"],
    ["しちにん", "seven people"],
    ["はちにん", "eight people"],
    ["きゅうにん", "nine people"],
    ["じゅうにん", "ten people"],
  ] as const;

  const places = [
    ["としょかん", "library"],
    ["がっこう", "school"],
    ["うち", "home"],
    ["カフェ", "cafe"],
  ] as const;

  return [
    ...peopleCounters.map(([kana, meaning], index) => ({
      id: `supplemental-people-counter-${String(index + 1).padStart(3, "0")}`,
      source: "supplemental" as const,
      kana,
      kanjiVariants: [],
      meaning,
      partOfSpeech: "counter" as const,
      conjugationClass: null,
      notes: ["people counter"],
      tags: ["counter", "people-counter"],
    })),
    ...places.map(([kana, meaning], index) => ({
      id: `supplemental-place-${String(index + 1).padStart(3, "0")}`,
      source: "supplemental" as const,
      kana,
      kanjiVariants: [],
      meaning,
      partOfSpeech: "noun" as const,
      conjugationClass: null,
      notes: ["location noun"],
      tags: ["noun", "place"],
    })),
  ];
}

export function loadMidtermBank() {
  const additionalPath = path.join(process.cwd(), "additional_words.md");
  const additionalMarkdown = fs.readFileSync(additionalPath, "utf8");
  return [
    ...createBaseEntries(),
    ...parseAdditionalWords(additionalMarkdown),
    ...createSupplementalEntries(),
  ];
}
