import type { WordEntry } from "@/lib/data/words";

export type VerbTarget =
  | "masu"
  | "mashita"
  | "te"
  | "te-imasu"
  | "te-imashita";

export type AdjectiveTarget = "desu" | "deshita" | "te";

export type QuizTarget = VerbTarget | AdjectiveTarget;

const vowelMap: Record<string, string> = {
  う: "い",
  く: "き",
  ぐ: "ぎ",
  す: "し",
  つ: "ち",
  ぬ: "に",
  ぶ: "び",
  む: "み",
  る: "り",
};

const teMap: Record<string, string> = {
  う: "って",
  つ: "って",
  る: "って",
  む: "んで",
  ぶ: "んで",
  ぬ: "んで",
  く: "いて",
  ぐ: "いで",
  す: "して",
};


function splitFinalVerb(kana: string) {
  const parts = kana.trim().split(" ");
  const last = parts.pop() || "";
  return {
    prefix: parts.join(" "),
    verb: last,
  };
}

function joinWithPrefix(prefix: string, value: string) {
  if (!prefix) return value;
  return `${prefix} ${value}`;
}

function uVerbMasu(verb: string) {
  const last = verb.slice(-1);
  const stem = verb.slice(0, -1);
  return `${stem}${vowelMap[last]}ます`;
}

function ruVerbMasu(verb: string) {
  return `${verb.slice(0, -1)}ます`;
}

function uVerbTe(verb: string) {
  const last = verb.slice(-1);
  const stem = verb.slice(0, -1);
  return `${stem}${teMap[last]}`;
}


function ruVerbTe(verb: string) {
  return `${verb.slice(0, -1)}て`;
}


function irregularVerb(verb: string, target: VerbTarget) {
  if (verb === "する") {
    if (target === "masu") return "します";
    if (target === "mashita") return "しました";
    if (target === "te") return "して";
    if (target === "te-imasu") return "しています";
    return "していました";
  }
  if (verb === "くる") {
    if (target === "masu") return "きます";
    if (target === "mashita") return "きました";
    if (target === "te") return "きて";
    if (target === "te-imasu") return "きています";
    return "きていました";
  }
  if (verb.endsWith("する")) {
    const stem = verb.slice(0, -2);
    if (target === "masu") return `${stem}します`;
    if (target === "mashita") return `${stem}しました`;
    if (target === "te") return `${stem}して`;
    if (target === "te-imasu") return `${stem}しています`;
    return `${stem}していました`;
  }
  if (verb.endsWith("くる")) {
    const stem = verb.slice(0, -2);
    if (target === "masu") return `${stem}きます`;
    if (target === "mashita") return `${stem}きました`;
    if (target === "te") return `${stem}きて`;
    if (target === "te-imasu") return `${stem}きています`;
    return `${stem}きていました`;
  }
  return verb;
}

export function conjugateVerb(
  word: WordEntry,
  target: VerbTarget
): string {
  const { prefix, verb } = splitFinalVerb(word.kana);
  let result = "";

  if (verb === "いく") {
    if (target === "masu") result = "いきます";
    else if (target === "mashita") result = "いきました";
    else if (target === "te") result = "いって";
    else if (target === "te-imasu") result = "いっています";
    else result = "いっていました";
  } else if (word.type === "irregular") {
    result = irregularVerb(verb, target);
  } else if (word.type === "ru") {
    if (target === "masu") result = ruVerbMasu(verb);
    else if (target === "mashita") result = `${ruVerbMasu(verb).slice(0, -2)}ました`;
    else if (target === "te") result = ruVerbTe(verb);
    else if (target === "te-imasu") result = `${ruVerbTe(verb)}います`;
    else result = `${ruVerbTe(verb)}いました`;
  } else {
    if (target === "masu") result = uVerbMasu(verb);
    else if (target === "mashita") result = `${uVerbMasu(verb).slice(0, -2)}ました`;
    else if (target === "te") result = uVerbTe(verb);
    else if (target === "te-imasu") result = `${uVerbTe(verb)}います`;
    else result = `${uVerbTe(verb)}いました`;
  }

  return joinWithPrefix(prefix, result);
}

function iAdjectiveBase(kana: string) {
  if (kana === "いい") return "よ";
  if (kana === "かっこいい") return "かっこよ";
  if (kana === "あたまがいい") return "あたまがよ";
  return kana.slice(0, -1);
}

export function conjugateAdjective(
  word: WordEntry,
  target: AdjectiveTarget
): string {
  if (word.type === "na") {
    if (target === "desu") return `${word.kana}です`;
    if (target === "deshita") return `${word.kana}でした`;
    return `${word.kana}で`;
  }
  const base = iAdjectiveBase(word.kana);
  if (target === "desu") return `${word.kana}です`;
  if (target === "deshita") return `${base}かったです`;
  return `${base}くて`;
}

export function getTypeLabel(word: WordEntry): string {
  if (word.group === "verb") {
    if (word.type === "u") return "u-verb";
    if (word.type === "ru") return "ru-verb";
    return "irregular";
  }
  return word.type === "i" ? "i-adj" : "na-adj";
}

export function getTargetLabel(target: QuizTarget): string {
  switch (target) {
    case "masu":
      return "ます";
    case "mashita":
      return "ました";
    case "te":
      return "て";
    case "te-imasu":
      return "ています";
    case "te-imashita":
      return "ていました";
    case "desu":
      return "です";
    case "deshita":
      return "でした";
    case "te":
      return "て";
    default:
      return "";
  }
}

export function getAnswer(word: WordEntry, target: QuizTarget): string {
  if (word.group === "verb") {
    return conjugateVerb(word, target as VerbTarget);
  }
  return conjugateAdjective(word, target as AdjectiveTarget);
}

export function normalizeAnswer(value: string) {
  return value.replace(/\s+/g, "").trim();
}
