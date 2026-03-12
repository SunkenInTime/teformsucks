import { describe, expect, it } from "vitest";

import { buildQuestionForTopic } from "@/lib/midterm/generators";
import { loadMidtermBank } from "@/lib/midterm/load-bank";
import { createMidtermSessionState } from "@/lib/midterm/scheduler";
import { MIDTERM_TOPIC_TAGS } from "@/lib/midterm/types";

describe("midterm generators", () => {
  it("builds a valid question for every topic bucket", () => {
    const bank = loadMidtermBank();
    const state = createMidtermSessionState(() => 0.4);

    MIDTERM_TOPIC_TAGS.forEach((topic) => {
      const question = buildQuestionForTopic(topic, bank, state, () => 0.4);

      expect(question.prompt.length).toBeGreaterThan(0);
      expect(question.displayAnswer.length).toBeGreaterThan(0);
      expect(question.acceptedAnswers.length).toBeGreaterThan(0);
      expect(question.topicTags.length).toBeGreaterThan(0);
      if (question.answerMode === "multiple-choice") {
        expect(question.choices?.length).toBeGreaterThan(1);
      }
    });
  });
});
