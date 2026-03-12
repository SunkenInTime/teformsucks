export function normalizeJapaneseAnswer(value: string) {
  return value.normalize("NFKC").replace(/[。、,.!?！？\s]/g, "").trim();
}

export function normalizeEnglishAnswer(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[.,!?;:()"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function answerMatches(value: string, acceptedAnswers: string[]) {
  const japaneseValue = normalizeJapaneseAnswer(value);
  const englishValue = normalizeEnglishAnswer(value);
  return acceptedAnswers.some((answer) => {
    return (
      normalizeJapaneseAnswer(answer) === japaneseValue ||
      normalizeEnglishAnswer(answer) === englishValue
    );
  });
}

export function uniqueAnswers(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const key = `${normalizeJapaneseAnswer(value)}|${normalizeEnglishAnswer(value)}`;
    if (!key.replace("|", "")) return;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(value);
  });

  return result;
}
