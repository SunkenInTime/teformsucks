import type { MidtermWordEntry } from "@/lib/midterm/types";
import { uniqueAnswers } from "@/lib/midterm/normalize";

const iStemMap: Record<string, string> = {
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

const aStemMap: Record<string, string> = {
  う: "わ",
  く: "か",
  ぐ: "が",
  す: "さ",
  つ: "た",
  ぬ: "な",
  ぶ: "ば",
  む: "ま",
  る: "ら",
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

function isIrregularSuru(value: string) {
  return value === "する" || value.endsWith("する");
}

function isIrregularKuru(value: string) {
  return value === "くる" || value === "来る" || value.endsWith("くる") || value.endsWith("来る");
}

function conjugateIrregularVerb(
  value: string,
  target: "masu" | "te" | "ta" | "nai" | "nakatta"
) {
  if (isIrregularSuru(value)) {
    const stem = value.slice(0, -2);
    switch (target) {
      case "masu":
        return `${stem}します`;
      case "te":
        return `${stem}して`;
      case "ta":
        return `${stem}した`;
      case "nai":
        return `${stem}しない`;
      case "nakatta":
        return `${stem}しなかった`;
      default:
        return value;
    }
  }

  const stem = value.slice(0, -2);
  switch (target) {
    case "masu":
      return `${stem}${value.endsWith("来る") ? "来ます" : "きます"}`;
    case "te":
      return `${stem}${value.endsWith("来る") ? "来て" : "きて"}`;
    case "ta":
      return `${stem}${value.endsWith("来る") ? "来た" : "きた"}`;
    case "nai":
      return `${stem}${value.endsWith("来る") ? "来ない" : "こない"}`;
    case "nakatta":
      return `${stem}${value.endsWith("来る") ? "来なかった" : "こなかった"}`;
    default:
      return value;
  }
}

function conjugateRuVerb(
  value: string,
  target: "masu" | "te" | "ta" | "nai" | "nakatta"
) {
  const stem = value.slice(0, -1);
  switch (target) {
    case "masu":
      return `${stem}ます`;
    case "te":
      return `${stem}て`;
    case "ta":
      return `${stem}た`;
    case "nai":
      return `${stem}ない`;
    case "nakatta":
      return `${stem}なかった`;
    default:
      return value;
  }
}

function conjugateUVerb(
  value: string,
  target: "masu" | "te" | "ta" | "nai" | "nakatta"
) {
  const last = value.slice(-1);
  const stem = value.slice(0, -1);

  if ((value === "いく" || value === "行く") && (target === "te" || target === "ta")) {
    return `${stem}${target === "te" ? "って" : "った"}`;
  }

  switch (target) {
    case "masu":
      return `${stem}${iStemMap[last]}ます`;
    case "te":
      return `${stem}${teMap[last]}`;
    case "ta":
      return `${stem}${teMap[last].replace(/て$/, "た").replace(/で$/, "だ")}`;
    case "nai":
      return `${stem}${aStemMap[last]}ない`;
    case "nakatta":
      return `${stem}${aStemMap[last]}なかった`;
    default:
      return value;
  }
}

export function conjugateVerbVariant(
  value: string,
  conjugationClass: MidtermWordEntry["conjugationClass"],
  target: "dictionary" | "masu" | "te" | "ta" | "nai" | "nakatta"
) {
  if (target === "dictionary") return value;
  if (conjugationClass === "irregular") return conjugateIrregularVerb(value, target);
  if (conjugationClass === "ru") return conjugateRuVerb(value, target);
  return conjugateUVerb(value, target);
}

export function getWordForms(entry: MidtermWordEntry) {
  return uniqueAnswers([entry.kana, ...entry.kanjiVariants]);
}

export function getVerbForms(
  entry: MidtermWordEntry,
  target: "dictionary" | "masu" | "te" | "ta" | "nai" | "nakatta"
) {
  return uniqueAnswers(
    getWordForms(entry).map((variant) =>
      conjugateVerbVariant(variant, entry.conjugationClass, target)
    )
  );
}

export function getVerbStemForms(entry: MidtermWordEntry) {
  return uniqueAnswers(
    getWordForms(entry).map((variant) => {
      if (entry.conjugationClass === "irregular") {
        if (isIrregularSuru(variant)) return `${variant.slice(0, -2)}し`;
        if (isIrregularKuru(variant)) {
          return `${variant.slice(0, -2)}${variant.endsWith("来る") ? "来" : "き"}`;
        }
      }

      if (entry.conjugationClass === "ru") return variant.slice(0, -1);

      const last = variant.slice(-1);
      return `${variant.slice(0, -1)}${iStemMap[last]}`;
    })
  );
}

function iAdjectiveBase(value: string) {
  if (value === "いい") return "よ";
  if (value === "良い") return "良";
  if (value === "かっこいい") return "かっこよ";
  if (value === "あたまがいい") return "あたまがよ";
  if (value === "頭がいい") return "頭がよ";
  return value.slice(0, -1);
}

export function getAdjectiveTeForms(entry: MidtermWordEntry) {
  if (entry.conjugationClass === "na") {
    return uniqueAnswers(getWordForms(entry).map((variant) => `${variant}で`));
  }
  return uniqueAnswers(getWordForms(entry).map((variant) => `${iAdjectiveBase(variant)}くて`));
}

export function getAdjectiveShortForms(entry: MidtermWordEntry) {
  if (entry.conjugationClass === "na") {
    return uniqueAnswers([
      ...getWordForms(entry),
      ...getWordForms(entry).map((variant) => `${variant}だ`),
    ]);
  }
  return getWordForms(entry);
}

export function withSentenceEnding(values: string[], suffix: string) {
  return uniqueAnswers(values.map((value) => `${value}${suffix}`));
}
