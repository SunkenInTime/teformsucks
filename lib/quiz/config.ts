import type { AdjectiveType, VerbType } from "@/lib/data/words";
import type { AdjectiveTarget, VerbTarget } from "@/lib/quiz/conjugation";

export type QuestionMode = "multiple-choice" | "fill-blank" | "typing";

export type QuizConfig = {
  id: string;
  title: string;
  description: string;
  wordGroups: Array<"verb" | "adjective">;
  verbTypes: VerbType[];
  adjectiveTypes: AdjectiveType[];
  verbTargets: VerbTarget[];
  adjectiveTargets: AdjectiveTarget[];
  modes: QuestionMode[];
};

export const CUSTOM_QUIZ_STORAGE_KEY = "teform-custom-quiz";

export const verbTargets: VerbTarget[] = [
  "masu",
  "mashita",
  "te",
  "te-imasu",
  "te-imashita",
];
export const adjectiveTargets: AdjectiveTarget[] = ["desu", "deshita", "te"];

export const allModes: QuestionMode[] = [
  "multiple-choice",
  "fill-blank",
  "typing",
];

export const presets: QuizConfig[] = [
  {
    id: "verb-masu",
    title: "Verbs: ます",
    description: "Present polite",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["masu"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-mashita",
    title: "Verbs: ました",
    description: "Past polite",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["mashita"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-masu-mix",
    title: "Verbs: ます/ました",
    description: "Mixed present + past",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["masu", "mashita"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-te",
    title: "Verbs: て-form",
    description: "Plain て",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["te"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-te-imasu",
    title: "Verbs: ています",
    description: "Present continuous",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["te-imasu"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-te-imashita",
    title: "Verbs: ていました",
    description: "Past continuous",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["te-imashita"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-te-iru-mix",
    title: "Verbs: ている mix",
    description: "Present + past continuous",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["te-imasu", "te-imashita"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "adj-i-desu",
    title: "i-adj: です",
    description: "Present polite",
    wordGroups: ["adjective"],
    verbTypes: [],
    adjectiveTypes: ["i"],
    verbTargets: [],
    adjectiveTargets: ["desu"],
    modes: allModes,
  },
  {
    id: "adj-i-deshita",
    title: "i-adj: でした",
    description: "Past polite",
    wordGroups: ["adjective"],
    verbTypes: [],
    adjectiveTypes: ["i"],
    verbTargets: [],
    adjectiveTargets: ["deshita"],
    modes: allModes,
  },
  {
    id: "adj-na-desu",
    title: "na-adj: です",
    description: "Present polite",
    wordGroups: ["adjective"],
    verbTypes: [],
    adjectiveTypes: ["na"],
    verbTargets: [],
    adjectiveTargets: ["desu"],
    modes: allModes,
  },
  {
    id: "adj-na-deshita",
    title: "na-adj: でした",
    description: "Past polite",
    wordGroups: ["adjective"],
    verbTypes: [],
    adjectiveTypes: ["na"],
    verbTargets: [],
    adjectiveTargets: ["deshita"],
    modes: allModes,
  },
  {
    id: "adj-te",
    title: "Adjectives: て-link",
    description: "Connect two adjectives",
    wordGroups: ["adjective"],
    verbTypes: [],
    adjectiveTypes: ["i", "na"],
    verbTargets: [],
    adjectiveTargets: ["te"],
    modes: allModes,
  },
];

export const defaultCustomConfig: QuizConfig = {
  id: "custom",
  title: "Custom Quiz",
  description: "Pick what you want to drill",
  wordGroups: ["verb", "adjective"],
  verbTypes: ["u", "ru", "irregular"],
  adjectiveTypes: ["i", "na"],
  verbTargets: [...verbTargets],
  adjectiveTargets: [...adjectiveTargets],
  modes: allModes,
};

export function getPresetById(id: string | null) {
  if (!id) return null;
  return presets.find((preset) => preset.id === id) ?? null;
}
