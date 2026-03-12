import type {
  MidtermConjugationClass,
  MidtermPartOfSpeech,
  MidtermWordEntry,
} from "@/lib/midterm/types";

type SectionShape = {
  partOfSpeech: MidtermPartOfSpeech;
  conjugationClass: MidtermConjugationClass;
  tags: string[];
};

const SECTION_MAP: Record<string, SectionShape> = {
  Nouns: { partOfSpeech: "noun", conjugationClass: null, tags: ["noun"] },
  "U-verbs": { partOfSpeech: "verb", conjugationClass: "u", tags: ["verb", "u-verb"] },
  "Ru-verbs": { partOfSpeech: "verb", conjugationClass: "ru", tags: ["verb", "ru-verb"] },
  "Irregular Verbs": {
    partOfSpeech: "verb",
    conjugationClass: "irregular",
    tags: ["verb", "irregular-verb"],
  },
  "い-adjectives": {
    partOfSpeech: "adjective",
    conjugationClass: "i",
    tags: ["adjective", "i-adjective"],
  },
  "な-adjectives": {
    partOfSpeech: "adjective",
    conjugationClass: "na",
    tags: ["adjective", "na-adjective"],
  },
  "Adverbs and Other Expressions": {
    partOfSpeech: "expression",
    conjugationClass: null,
    tags: ["expression"],
  },
  "Numbers (used to count small items)": {
    partOfSpeech: "counter",
    conjugationClass: null,
    tags: ["counter", "small-things-counter"],
  },
};

function normalizeTerm(term: string) {
  return term.replace(/\(な\)|（な）/g, "").trim();
}

function toStableId(section: string, index: number) {
  const slug = section
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `additional-${slug}-${String(index).padStart(3, "0")}`;
}

function extractNotes(term: string, meaning: string) {
  const notes: string[] = [];
  if (term.includes("(な)") || term.includes("（な）")) {
    notes.push("takes な before a noun");
  }
  const particleNotes = meaning.match(/\(~([^)]*)\)/g) ?? [];
  particleNotes.forEach((note) => {
    notes.push(note.replace(/[()~]/g, "").trim());
  });
  return notes;
}

export function parseAdditionalWords(markdown: string): MidtermWordEntry[] {
  const lines = markdown.split(/\r?\n/);
  const results: MidtermWordEntry[] = [];
  let currentSection = "";
  let currentIndex = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("### ")) {
      currentSection = trimmed.slice(4).trim();
      currentIndex = 0;
      return;
    }

    if (!trimmed.startsWith("*")) return;
    const firstBold = trimmed.indexOf("**");
    const secondBold = trimmed.indexOf("**", firstBold + 2);
    if (firstBold === -1 || secondBold === -1 || !currentSection) return;

    const sectionShape = SECTION_MAP[currentSection];
    if (!sectionShape) return;

    const rawTerm = trimmed.slice(firstBold + 2, secondBold).trim();
    const meaning = trimmed
      .slice(secondBold + 2)
      .trim()
      .replace(/^[-–]\s*/, "")
      .trim();

    currentIndex += 1;
    results.push({
      id: toStableId(currentSection, currentIndex),
      source: "additional-markdown",
      kana: normalizeTerm(rawTerm),
      kanjiVariants: [],
      meaning,
      partOfSpeech: sectionShape.partOfSpeech,
      conjugationClass: sectionShape.conjugationClass,
      notes: extractNotes(rawTerm, meaning),
      tags: [...sectionShape.tags],
    });
  });

  return results;
}
