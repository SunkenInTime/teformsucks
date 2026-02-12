import type { WordEntry } from "@/lib/data/words";

export type VerbTarget =
  | "masu"
  | "mashita"
  | "te"
  | "te-imasu"
  | "te-imashita"
  | "type";

export type AdjectiveTarget = "desu" | "deshita" | "te" | "type";

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
  if (verb === "くる" || verb === "来る") {
    const kuruStem = verb === "来る" ? "来" : "き";
    if (target === "masu") return `${kuruStem}ます`;
    if (target === "mashita") return `${kuruStem}ました`;
    if (target === "te") return `${kuruStem}て`;
    if (target === "te-imasu") return `${kuruStem}ています`;
    return `${kuruStem}ていました`;
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

  if (verb === "いく" || verb === "行く") {
    const ikuStem = verb === "行く" ? "行" : "い";
    if (target === "masu") result = `${ikuStem}きます`;
    else if (target === "mashita") result = `${ikuStem}きました`;
    else if (target === "te") result = `${ikuStem}って`;
    else if (target === "te-imasu") result = `${ikuStem}っています`;
    else result = `${ikuStem}っていました`;
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
  if (kana === "頭がいい") return "頭がよ";
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
    case "type":
      return "Type";
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
  if (target === "type") {
    return getTypeLabel(word);
  }
  if (word.group === "verb") {
    return conjugateVerb(word, target as VerbTarget);
  }
  return conjugateAdjective(word, target as AdjectiveTarget);
}

function getAnswerForForm(word: WordEntry, target: QuizTarget, form: string): string {
  const entry = { ...word, kana: form };
  return getAnswer(entry, target);
}

export function getAcceptedAnswers(word: WordEntry, target: QuizTarget): string[] {
  if (target === "type") {
    const answers = new Set<string>([getTypeLabel(word)]);
    if (word.group === "verb") {
      if (word.type === "u") {
        answers.add("u");
        answers.add("u-verb");
      }
      if (word.type === "ru") {
        answers.add("ru");
        answers.add("ru-verb");
      }
      if (word.type === "irregular") answers.add("irregular");
    } else {
      if (word.type === "i") {
        answers.add("i");
        answers.add("i-adj");
      }
      if (word.type === "na") {
        answers.add("na");
        answers.add("na-adj");
      }
    }
    return Array.from(answers);
  }
  const answers = new Set<string>([getAnswer(word, target)]);
  if (word.kanji?.length) {
    word.kanji.forEach((variant: string) => {
      answers.add(getAnswerForForm(word, target, variant));
    });
  }
  return Array.from(answers);
}

export function normalizeAnswer(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, "").trim();
}
