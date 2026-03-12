import { describe, expect, it } from "vitest";

import { conjugateVerbVariant } from "@/lib/midterm/grammar";

describe("midterm grammar helpers", () => {
  it("conjugates key short and te forms correctly", () => {
    expect(conjugateVerbVariant("いく", "u", "te")).toBe("いって");
    expect(conjugateVerbVariant("よむ", "u", "ta")).toBe("よんだ");
    expect(conjugateVerbVariant("はなす", "u", "nai")).toBe("はなさない");
    expect(conjugateVerbVariant("おきる", "ru", "nakatta")).toBe("おきなかった");
    expect(conjugateVerbVariant("べんきょうする", "irregular", "te")).toBe(
      "べんきょうして"
    );
  });
});
