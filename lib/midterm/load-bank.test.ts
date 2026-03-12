import { describe, expect, it } from "vitest";

import { loadMidtermBank } from "@/lib/midterm/load-bank";

describe("loadMidtermBank", () => {
  it("keeps homographs separate when meaning or class differs", () => {
    const bank = loadMidtermBank();
    const iruEntries = bank.filter((entry) => entry.kana === "いる");
    const kiruEntries = bank.filter((entry) => entry.kana === "きる");

    expect(iruEntries).toHaveLength(2);
    expect(iruEntries.map((entry) => entry.meaning).sort()).toEqual([
      "to be (person)",
      "to need (~が)",
    ]);

    expect(kiruEntries).toHaveLength(2);
    expect(kiruEntries.map((entry) => entry.conjugationClass).sort()).toEqual([
      "ru",
      "u",
    ]);
  });
});
