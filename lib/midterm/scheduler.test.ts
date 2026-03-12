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
});
