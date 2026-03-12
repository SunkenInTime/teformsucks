import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MidtermDictionaryWidget } from "@/components/midterm/midterm-dictionary-widget";
import type { MidtermWordEntry } from "@/lib/midterm/types";

const bank: MidtermWordEntry[] = [
  {
    id: "1",
    source: "base-library",
    kana: "けっこんする",
    kanjiVariants: ["結婚する"],
    meaning: "to get married",
    partOfSpeech: "verb",
    conjugationClass: "irregular",
    notes: [],
    tags: ["verb"],
  },
  {
    id: "2",
    source: "additional-markdown",
    kana: "せがたかい",
    kanjiVariants: ["背が高い"],
    meaning: "tall",
    partOfSpeech: "adjective",
    conjugationClass: "i",
    notes: [],
    tags: ["adjective"],
  },
];

describe("MidtermDictionaryWidget", () => {
  it("finds entries by English and Japanese search terms", () => {
    render(<MidtermDictionaryWidget bank={bank} />);

    fireEvent.change(screen.getByPlaceholderText("Search English, kana, or kanji"), {
      target: { value: "tall" },
    });
    expect(screen.getByText("せがたかい")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search English, kana, or kanji"), {
      target: { value: "結婚" },
    });
    expect(screen.getByText("けっこんする")).toBeInTheDocument();
  });
});
