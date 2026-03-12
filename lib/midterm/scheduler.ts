import { buildQuestionForTopic } from "@/lib/midterm/generators";
import { MIDTERM_TOPIC_TAGS } from "@/lib/midterm/types";
import type {
  MidtermQuestion,
  MidtermSessionState,
  MidtermTopicTag,
  MidtermWordEntry,
} from "@/lib/midterm/types";

function shuffle<T>(items: T[], rng: () => number) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function createCoverage() {
  return MIDTERM_TOPIC_TAGS.reduce(
    (accumulator, topic) => ({ ...accumulator, [topic]: 0 }),
    {} as Record<MidtermTopicTag, number>
  );
}

export function createMidtermSessionState(rng = Math.random): MidtermSessionState {
  return {
    openingQueue: shuffle([...MIDTERM_TOPIC_TAGS], rng),
    retryQueue: [],
    recentTopics: [],
    recentWordIds: [],
    coverage: createCoverage(),
    askedCount: 0,
    attempted: 0,
    correct: 0,
    streak: 0,
  };
}

function pickWeightedTopic(state: MidtermSessionState, rng: () => number) {
  const candidates = MIDTERM_TOPIC_TAGS.filter(
    (topic) => !state.recentTopics.slice(0, 2).includes(topic)
  );
  const pool = candidates.length ? candidates : [...MIDTERM_TOPIC_TAGS];
  const minSeen = Math.min(...pool.map((topic) => state.coverage[topic]));
  const weighted = pool.flatMap((topic) =>
    Array.from({ length: minSeen === state.coverage[topic] ? 3 : 1 }, () => topic)
  );
  return weighted[Math.floor(rng() * weighted.length)];
}

function selectNextTopic(state: MidtermSessionState, rng: () => number) {
  const retryIndex = state.retryQueue.findIndex(
    (item) =>
      item.availableAfter <= state.askedCount &&
      !state.recentTopics.slice(0, 2).includes(item.topic)
  );

  if (retryIndex >= 0) {
    return {
      topic: state.retryQueue[retryIndex].topic,
      state: {
        ...state,
        retryQueue: state.retryQueue.filter((_, index) => index !== retryIndex),
      },
    };
  }

  if (state.openingQueue.length > 0) {
    const [topic, ...rest] = state.openingQueue;
    return {
      topic,
      state: {
        ...state,
        openingQueue: rest,
      },
    };
  }

  return {
    topic: pickWeightedTopic(state, rng),
    state,
  };
}

export function getNextMidtermQuestion(
  state: MidtermSessionState,
  bank: MidtermWordEntry[],
  rng = Math.random
) {
  const selection = selectNextTopic(state, rng);
  const question = buildQuestionForTopic(selection.topic, bank, selection.state, rng);
  const nextState: MidtermSessionState = {
    ...selection.state,
    currentTopic: selection.topic,
    askedCount: selection.state.askedCount + 1,
    recentTopics: [selection.topic, ...selection.state.recentTopics].slice(0, 4),
    recentWordIds: [...question.referencedWordIds, ...selection.state.recentWordIds].slice(0, 14),
    coverage: {
      ...selection.state.coverage,
      [selection.topic]: selection.state.coverage[selection.topic] + 1,
    },
  };

  return {
    question,
    state: nextState,
  };
}

export function recordMidtermResult(
  state: MidtermSessionState,
  question: MidtermQuestion,
  wasCorrect: boolean
) {
  return {
    ...state,
    attempted: state.attempted + 1,
    correct: wasCorrect ? state.correct + 1 : state.correct,
    streak: wasCorrect ? state.streak + 1 : 0,
    retryQueue: wasCorrect
      ? state.retryQueue
      : [
          ...state.retryQueue,
          {
            topic: question.topicTags[0],
            wordIds: question.referencedWordIds,
            availableAfter: state.askedCount + 3,
          },
        ],
  };
}
