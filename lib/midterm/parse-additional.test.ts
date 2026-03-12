import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseAdditionalWords } from "@/lib/midterm/parse-additional";

describe("parseAdditionalWords", () => {
  it("parses the markdown sections into stable entries", () => {
    const markdown = fs.readFileSync(
      path.join(process.cwd(), "additional_words.md"),
      "utf8"
    );

    const entries = parseAdditionalWords(markdown);
    const nounEntries = entries.filter((entry) => entry.partOfSpeech === "noun");
    const expressionEntries = entries.filter(
      (entry) => entry.partOfSpeech === "expression"
    );

    expect(entries).toHaveLength(111);
    expect(nounEntries).toHaveLength(46);
    expect(expressionEntries).toHaveLength(18);
    expect(entries[0]?.id).toBe("additional-nouns-001");
    expect(entries.at(-1)?.id).toBe(
      "additional-numbers-used-to-count-small-items-010"
    );
  });
});
