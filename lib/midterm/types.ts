export const MIDTERM_TOPIC_TAGS = [
  "vocab-recognition",
  "verb-te-form",
  "te-iru-usage",
  "ga-description",
  "te-linking",
  "movement-purpose",
  "people-counter",
  "short-form-conjugation",
  "informal-sentence",
  "quote-think-said",
  "naide-kudasai",
  "subject-ga",
  "wa-vs-ga",
  "noga-preference",
  "nanika-nanimo",
  "noun-qualification",
  "mou-mada",
  "kara-reason",
] as const;

export type MidtermTopicTag = (typeof MIDTERM_TOPIC_TAGS)[number];

export const MIDTERM_QUESTION_KINDS = [
  "vocab-recognition",
  "verb-te-form",
  "te-iru-usage",
  "ga-description",
  "te-linking",
  "movement-purpose",
  "people-counter",
  "short-form-conjugation",
  "informal-sentence",
  "quote-think-said",
  "naide-kudasai",
  "wa-vs-ga",
  "noga-preference",
  "nanika-nanimo",
  "noun-qualification",
  "mou-mada",
  "kara-reason",
] as const;

export type MidtermQuestionKind = (typeof MIDTERM_QUESTION_KINDS)[number];

export type MidtermAnswerMode = "multiple-choice" | "typing";

export type MidtermSource = "base-library" | "additional-markdown" | "supplemental";

export type MidtermPartOfSpeech =
  | "verb"
  | "adjective"
  | "noun"
  | "expression"
  | "counter";

export type MidtermConjugationClass = "u" | "ru" | "irregular" | "i" | "na" | null;

export type MidtermWordEntry = {
  id: string;
  source: MidtermSource;
  kana: string;
  kanjiVariants: string[];
  meaning: string;
  partOfSpeech: MidtermPartOfSpeech;
  conjugationClass: MidtermConjugationClass;
  notes: string[];
  tags: string[];
};

export type MidtermQuestion = {
  id: string;
  kind: MidtermQuestionKind;
  answerMode: MidtermAnswerMode;
  prompt: string;
  clue?: string;
  displayAnswer: string;
  acceptedAnswers: string[];
  choices?: string[];
  explanation: string;
  topicTags: MidtermTopicTag[];
  referencedWordIds: string[];
};

export type MidtermRetryItem = {
  topic: MidtermTopicTag;
  wordIds: string[];
  availableAfter: number;
};

export type MidtermSessionState = {
  currentTopic?: MidtermTopicTag;
  openingQueue: MidtermTopicTag[];
  retryQueue: MidtermRetryItem[];
  recentTopics: MidtermTopicTag[];
  recentWordIds: string[];
  coverage: Record<MidtermTopicTag, number>;
  askedCount: number;
  attempted: number;
  correct: number;
  streak: number;
};
