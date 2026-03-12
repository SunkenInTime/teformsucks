import { describe, expect, it } from "vitest";

import { loadMidtermBank } from "@/lib/midterm/load-bank";
import { createMidtermSessionState, getNextMidtermQuestion, recordMidtermResult } from "@/lib/midterm/scheduler";
import { MIDTERM_TOPIC_TAGS } from "@/lib/midterm/types";

describe("midterm scheduler", () => {
  it("covers every topic in the opening cycle", () => {
    const bank = loadMidtermBank();
    let state = createMidtermSessionState(() => 0.25);
    const seen = new Set<string>();

    for (let index = 0; index < MIDTERM_TOPIC_TAGS.length; index += 1) {
      const next = getNextMidtermQuestion(state, bank, () => 0.25);
      seen.add(next.state.currentTopic ?? "");
      state = recordMidtermResult(next.state, next.question, true);
    }

    expect(seen.size).toBe(MIDTERM_TOPIC_TAGS.length);
  });

  it("rerolls recently seen question ids before accepting a duplicate", () => {
    const bank = loadMidtermBank();
    const kuru = bank.find((entry) => entry.kana === "くる");
    expect(kuru).toBeDefined();
    const repeatedQuestionId = `quote-${kuru?.id}-think`;
    const state = {
      ...createMidtermSessionState(() => 0),
      openingQueue: ["quote-think-said"],
      recentQuestionIds: [repeatedQuestionId],
    };
    const rngValues = [0, 0.6, 0, 0.9];
    let index = 0;

    const next = getNextMidtermQuestion(state, bank, () => rngValues[index++] ?? 0.9);

    expect(next.question.id).not.toBe(repeatedQuestionId);
    expect(next.state.recentQuestionIds[0]).toBe(next.question.id);
  });
});
