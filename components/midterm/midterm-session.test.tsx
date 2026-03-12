import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MidtermSession } from "@/components/midterm/midterm-session";
import type { MidtermQuestion, MidtermSessionState, MidtermWordEntry } from "@/lib/midterm/types";

const mockQuestions: MidtermQuestion[] = [
  {
    id: "q1",
    kind: "people-counter",
    answerMode: "typing",
    prompt: "How do you count one person?",
    displayAnswer: "ひとり",
    acceptedAnswers: ["ひとり"],
    explanation: "People use ひとり and ふたり as the exceptions.",
    topicTags: ["people-counter"],
    referencedWordIds: ["supplemental-people-counter-001"],
  },
  {
    id: "q2",
    kind: "wa-vs-ga",
    answerMode: "multiple-choice",
    prompt: "Choose the correct particle: わたし___ にほんごを べんきょうしています。",
    displayAnswer: "は",
    acceptedAnswers: ["は"],
    choices: ["は", "が"],
    explanation: "Use は to mark the topic here.",
    topicTags: ["wa-vs-ga"],
    referencedWordIds: ["base-verb-056"],
  },
];

function makeState(overrides?: Partial<MidtermSessionState>): MidtermSessionState {
  const coverage = {
    "vocab-recognition": 0,
    "verb-te-form": 0,
    "te-iru-usage": 0,
    "ga-description": 0,
    "te-linking": 0,
    "movement-purpose": 0,
    "people-counter": 0,
    "short-form-conjugation": 0,
    "informal-sentence": 0,
    "quote-think-said": 0,
    "naide-kudasai": 0,
    "subject-ga": 0,
    "wa-vs-ga": 0,
    "noga-preference": 0,
    "nanika-nanimo": 0,
    "noun-qualification": 0,
    "mou-mada": 0,
    "kara-reason": 0,
  };

  return {
    openingQueue: [],
    retryQueue: [],
    recentTopics: [],
    recentQuestionIds: [],
    recentWordIds: [],
    coverage,
    askedCount: 0,
    attempted: 0,
    correct: 0,
    streak: 0,
    ...overrides,
  };
}

let questionIndex = 0;
let latestState = makeState();

vi.mock("@/lib/midterm/scheduler", () => ({
  createMidtermSessionState: vi.fn(() => {
    latestState = makeState();
    questionIndex = 0;
    return latestState;
  }),
  getNextMidtermQuestion: vi.fn((state: MidtermSessionState) => {
    latestState = {
      ...state,
      askedCount: state.askedCount + 1,
    };
    return {
      state: latestState,
      question: mockQuestions[Math.min(questionIndex++, mockQuestions.length - 1)],
    };
  }),
  recordMidtermResult: vi.fn(
    (state: MidtermSessionState, _question: MidtermQuestion, wasCorrect: boolean) => {
      latestState = {
        ...state,
        attempted: state.attempted + 1,
        correct: wasCorrect ? state.correct + 1 : state.correct,
        streak: wasCorrect ? state.streak + 1 : 0,
      };
      return latestState;
    }
  ),
}));

describe("MidtermSession", () => {
  beforeEach(() => {
    cleanup();
    questionIndex = 0;
    latestState = makeState();
    window.localStorage.clear();
  });

  it("handles wrong and correct answers while updating visible stats", () => {
    render(<MidtermSession bank={[] as MidtermWordEntry[]} />);

    expect(screen.getByText("How do you count one person?")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Type your answer"), {
      target: { value: "さんにん" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));

    expect(screen.getByText("Not quite.")).toBeInTheDocument();
    expect(screen.getByText("Answer: ひとり")).toBeInTheDocument();
    expect(screen.getByText("0/1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(
      screen.getByText("Choose the correct particle: わたし___ にほんごを べんきょうしています。")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "は" }));

    expect(screen.getByText("Correct.")).toBeInTheDocument();
    expect(screen.getByText("1/2")).toBeInTheDocument();
    expect(screen.getByText(/Streak 1/)).toBeInTheDocument();
  });

  it("restores persisted midterm progress from local storage", () => {
    window.localStorage.setItem(
      "teform-midterm-session",
      JSON.stringify({
        version: 1,
        sessionState: makeState({
          askedCount: 9,
          attempted: 8,
          correct: 6,
          streak: 3,
        }),
        question: mockQuestions[1],
        inputValue: "",
        selectedChoice: null,
        status: "idle",
      })
    );

    render(<MidtermSession bank={[] as MidtermWordEntry[]} />);

    expect(screen.getByText(mockQuestions[1].prompt)).toBeInTheDocument();
    expect(screen.getByText(/Question 9/)).toBeInTheDocument();
    expect(screen.getByText("6/8")).toBeInTheDocument();
    expect(screen.getByText(/Streak 3/)).toBeInTheDocument();
  });
});
