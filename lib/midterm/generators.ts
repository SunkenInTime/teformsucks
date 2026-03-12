import {
  getVerbForms,
  getVerbStemForms,
  getWordForms,
  withSentenceEnding,
} from "@/lib/midterm/grammar";
import { uniqueAnswers } from "@/lib/midterm/normalize";
import type {
  MidtermQuestion,
  MidtermQuestionKind,
  MidtermSessionState,
  MidtermTopicTag,
  MidtermWordEntry,
} from "@/lib/midterm/types";

type GeneratorContext = {
  bank: MidtermWordEntry[];
  state: MidtermSessionState;
  rng?: () => number;
};

function randomItem<T>(items: T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)];
}

function shuffle<T>(items: T[], rng: () => number) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function choicesFromAnswers(correct: string, distractors: string[], rng: () => number) {
  return shuffle(uniqueAnswers([correct, ...distractors]).slice(0, 4), rng);
}

function pickFreshEntry(entries: MidtermWordEntry[], recentWordIds: string[], rng: () => number) {
  const fresh = entries.filter((entry) => !recentWordIds.includes(entry.id));
  return randomItem(fresh.length ? fresh : entries, rng);
}

function getEntries(
  bank: MidtermWordEntry[],
  filter: (entry: MidtermWordEntry) => boolean
) {
  return bank.filter(filter);
}

function findByKana(bank: MidtermWordEntry[], kana: string) {
  return bank.find((entry) => entry.kana === kana);
}

function makeQuestion(question: MidtermQuestion) {
  return {
    ...question,
    acceptedAnswers: uniqueAnswers(question.acceptedAnswers),
  };
}

function buildVocabRecognition({ bank, state, rng = Math.random }: GeneratorContext) {
  const entry = pickFreshEntry(
    bank.filter((item) => item.kana && item.meaning),
    state.recentWordIds,
    rng
  );
  const askForJapanese = rng() > 0.5;

  if (askForJapanese) {
    const candidates = bank
      .filter((item) => item.id !== entry.id && item.partOfSpeech === entry.partOfSpeech)
      .map((item) => item.kana);
    return makeQuestion({
      id: `vocab-${entry.id}-jp`,
      kind: "vocab-recognition",
      answerMode: rng() > 0.55 ? "typing" : "multiple-choice",
      prompt: `Write this in Japanese: ${entry.meaning}`,
      clue: `${entry.partOfSpeech} from ${entry.source}`,
      displayAnswer: entry.kana,
      acceptedAnswers: getWordForms(entry),
      choices: choicesFromAnswers(entry.kana, candidates, rng),
      explanation: "Use the core vocab item in kana. Base-library kanji variants also count.",
      topicTags: ["vocab-recognition"],
      referencedWordIds: [entry.id],
    });
  }

  const candidates = bank
    .filter((item) => item.id !== entry.id && item.partOfSpeech === entry.partOfSpeech)
    .map((item) => item.meaning);
  return makeQuestion({
    id: `vocab-${entry.id}-en`,
    kind: "vocab-recognition",
    answerMode: rng() > 0.45 ? "typing" : "multiple-choice",
    prompt: `What does "${entry.kana}" mean?`,
    clue: entry.kanjiVariants[0],
    displayAnswer: entry.meaning,
    acceptedAnswers: [entry.meaning],
    choices: choicesFromAnswers(entry.meaning, candidates, rng),
    explanation: "Keep the English gloss tight. Light punctuation and case differences are ignored.",
    topicTags: ["vocab-recognition"],
    referencedWordIds: [entry.id],
  });
}

function buildVerbTeForm({ bank, state, rng = Math.random }: GeneratorContext) {
  const verbs = getEntries(bank, (entry) => entry.partOfSpeech === "verb");
  const entry = pickFreshEntry(verbs, state.recentWordIds, rng);
  const answers = getVerbForms(entry, "te");
  return makeQuestion({
    id: `te-${entry.id}`,
    kind: "verb-te-form",
    answerMode: "typing",
    prompt: `Change this to the て-form: ${entry.kana}`,
    clue: entry.meaning,
    displayAnswer: answers[0],
    acceptedAnswers: answers,
    explanation: "u-verbs change by ending, ru-verbs drop る, and irregular verbs must be memorized.",
    topicTags: ["verb-te-form"],
    referencedWordIds: [entry.id],
  });
}

function buildTeIruUsage({ bank, state, rng = Math.random }: GeneratorContext) {
  const progressCandidates = ["よむ", "たべる", "べんきょうする", "はたらく", "おどる"]
    .map((kana) => findByKana(bank, kana))
    .filter(Boolean) as MidtermWordEntry[];
  const stateCandidates = ["けっこんする", "しる", "すむ", "きる", "めがねをかける"]
    .map((kana) => findByKana(bank, kana))
    .filter(Boolean) as MidtermWordEntry[];

  const useStateMeaning = rng() > 0.5;
  const entry = pickFreshEntry(
    useStateMeaning ? stateCandidates : progressCandidates,
    state.recentWordIds,
    rng
  );
  const sentence = `${getVerbForms(entry, "te")[0]}いる`;
  const correct = useStateMeaning ? "resulting state" : "action in progress";
  return makeQuestion({
    id: `te-iru-${entry.id}`,
    kind: "te-iru-usage",
    answerMode: "multiple-choice",
    prompt: `What does "${sentence}" emphasize here?`,
    clue: entry.meaning,
    displayAnswer: correct,
    acceptedAnswers: [correct],
    choices: shuffle(
      ["action in progress", "resulting state", "simple past", "polite request"],
      rng
    ),
    explanation:
      "〜ている can show an ongoing action or the current result of a change in state, depending on the verb.",
    topicTags: ["te-iru-usage"],
    referencedWordIds: [entry.id],
  });
}

function buildGaDescription({ bank, rng = Math.random }: GeneratorContext) {
  const name = randomItem(["さくらさん", "けんさん", "メアリーさん", "たけしさん"], rng);
  const options = [
    {
      entry: findByKana(bank, "せがたかい"),
      english: "is tall",
      correct: `${name}は せがたかいです。`,
      wrong: `${name}は せはたかいです。`,
    },
    {
      entry: findByKana(bank, "あたまがいい"),
      english: "is smart",
      correct: `${name}は あたまがいいです。`,
      wrong: `${name}は あたまはいいです。`,
    },
    {
      entry: findByKana(bank, "じょうず"),
      english: "is good at Japanese",
      correct: `${name}は にほんごが じょうずです。`,
      wrong: `${name}は にほんごは じょうずです。`,
    },
  ];
  const picked = randomItem(options.filter((item) => item.entry), rng);
  return makeQuestion({
    id: `ga-description-${picked.entry?.id ?? "fallback"}`,
    kind: "ga-description",
    answerMode: "multiple-choice",
    prompt: `Choose the natural sentence for "${name} ${picked.english}."`,
    displayAnswer: picked.correct,
    acceptedAnswers: [picked.correct],
    choices: shuffle(
      [
        picked.correct,
        picked.wrong,
        `${name}が ${picked.correct.split("は ")[1]}`,
        `${name}は ${picked.correct.split("は ")[1].replace("が", "を")}`,
      ],
      rng
    ),
    explanation: "Use が inside the description when the adjective pattern itself calls for it, like せがたかい or にほんごがじょうず.",
    topicTags: ["ga-description", "subject-ga"],
    referencedWordIds: picked.entry ? [picked.entry.id] : [],
  });
}

function buildTeLinking({ bank, rng = Math.random }: GeneratorContext) {
  const variants = [
    {
      id: "verb",
      prompt: 'Join these: "I go to the library, and I study."',
      answer: "としょかんにいって、べんきょうします。",
      choices: [
        "としょかんにいって、べんきょうします。",
        "としょかんにいきて、べんきょうします。",
        "としょかんにいきで、べんきょうします。",
        "としょかんにいくて、べんきょうします。",
      ],
      ids: [findByKana(bank, "べんきょうする")?.id].filter(Boolean) as string[],
    },
    {
      id: "i-adjective",
      prompt: 'Join these: "This book is interesting, and it is easy."',
      answer: "このほんは おもしろくて、やさしいです。",
      choices: [
        "このほんは おもしろくて、やさしいです。",
        "このほんは おもしろいで、やさしいです。",
        "このほんは おもしろいくて、やさしいです。",
        "このほんは おもしろくで、やさしいです。",
      ],
      ids: [findByKana(bank, "おもしろい")?.id].filter(Boolean) as string[],
    },
    {
      id: "noun-na",
      prompt: 'Join these: "Mary is an office worker, and she is kind."',
      answer: "メアリーさんは かいしゃいんで、しんせつです。",
      choices: [
        "メアリーさんは かいしゃいんで、しんせつです。",
        "メアリーさんは かいしゃいんて、しんせつです。",
        "メアリーさんは かいしゃいんくて、しんせつです。",
        "メアリーさんは かいしゃいんが、しんせつです。",
      ],
      ids: [findByKana(bank, "かいしゃいん")?.id, findByKana(bank, "しんせつ")?.id].filter(Boolean) as string[],
    },
  ];
  const picked = randomItem(variants, rng);
  return makeQuestion({
    id: `te-linking-${picked.id}`,
    kind: "te-linking",
    answerMode: "multiple-choice",
    prompt: picked.prompt,
    displayAnswer: picked.answer,
    acceptedAnswers: [picked.answer],
    choices: shuffle(picked.choices, rng),
    explanation: "Verb clauses use て-form, i-adjectives use くて, and nouns or な-adjectives link with で.",
    topicTags: ["te-linking"],
    referencedWordIds: picked.ids,
  });
}

function buildMovementPurpose({ bank, state, rng = Math.random }: GeneratorContext) {
  const places = getEntries(bank, (entry) => entry.tags.includes("place"));
  const verbs = ["べんきょうする", "たべる", "うたう", "かう", "みる"]
    .map((kana) => findByKana(bank, kana))
    .filter(Boolean) as MidtermWordEntry[];
  const place = pickFreshEntry(places, state.recentWordIds, rng);
  const verb = pickFreshEntry(verbs, state.recentWordIds, rng);
  const stems = getVerbStemForms(verb);
  const movementVerb = randomItem(["いきます", "きます", "かえります"], rng);
  const acceptedAnswers = withSentenceEnding(
    stems.map((stem) => `${place.kana}に ${stem}に ${movementVerb}`),
    "。"
  );
  return makeQuestion({
    id: `movement-purpose-${place.id}-${verb.id}`,
    kind: "movement-purpose",
    answerMode: "typing",
    prompt: `Say: "I ${movementVerb === "いきます" ? "go" : movementVerb === "きます" ? "come" : "return"} to ${place.meaning} to ${verb.meaning}."`,
    clue: "Use に twice: destination + purpose.",
    displayAnswer: acceptedAnswers[0],
    acceptedAnswers,
    explanation: "For purpose of movement, use destination に verb-stem に 行く / 来る / 帰る.",
    topicTags: ["movement-purpose"],
    referencedWordIds: [place.id, verb.id],
  });
}

function buildPeopleCounter({ bank, state, rng = Math.random }: GeneratorContext) {
  const counters = getEntries(bank, (entry) => entry.tags.includes("people-counter"));
  const entry = pickFreshEntry(counters, state.recentWordIds, rng);
  return makeQuestion({
    id: `people-counter-${entry.id}`,
    kind: "people-counter",
    answerMode: rng() > 0.4 ? "typing" : "multiple-choice",
    prompt: `How do you count "${entry.meaning}" in Japanese?`,
    displayAnswer: entry.kana,
    acceptedAnswers: [entry.kana],
    choices: choicesFromAnswers(
      entry.kana,
      counters.filter((item) => item.id !== entry.id).map((item) => item.kana),
      rng
    ),
    explanation: "People use the にん counter, except the special forms ひとり and ふたり.",
    topicTags: ["people-counter"],
    referencedWordIds: [entry.id],
  });
}

function buildShortFormConjugation({ bank, state, rng = Math.random }: GeneratorContext) {
  const entry = pickFreshEntry(
    getEntries(bank, (item) => item.partOfSpeech === "verb"),
    state.recentWordIds,
    rng
  );
  const targets = [
    { label: "short present affirmative", form: "dictionary" as const },
    { label: "short present negative", form: "nai" as const },
    { label: "short past affirmative", form: "ta" as const },
    { label: "short past negative", form: "nakatta" as const },
  ];
  const target = randomItem(targets, rng);
  const answers = getVerbForms(entry, target.form);
  return makeQuestion({
    id: `short-form-${entry.id}-${target.form}`,
    kind: "short-form-conjugation",
    answerMode: "typing",
    prompt: `Give the ${target.label} for ${entry.kana}.`,
    clue: entry.meaning,
    displayAnswer: answers[0],
    acceptedAnswers: answers,
    explanation: "Short forms use dictionary / ない / た / なかった patterns.",
    topicTags: ["short-form-conjugation"],
    referencedWordIds: [entry.id],
  });
}

function buildInformalSentence({ bank, state, rng = Math.random }: GeneratorContext) {
  const entry = pickFreshEntry(
    getEntries(bank, (item) => item.partOfSpeech === "verb"),
    state.recentWordIds,
    rng
  );
  const polite = getVerbForms(entry, "masu")[0];
  const casual = getVerbForms(entry, "dictionary");
  return makeQuestion({
    id: `informal-${entry.id}`,
    kind: "informal-sentence",
    answerMode: "typing",
    prompt: `Make this informal: わたしは ${polite}。`,
    displayAnswer: `わたしは ${casual[0]}。`,
    acceptedAnswers: withSentenceEnding(casual.map((value) => `わたしは ${value}`), "。"),
    explanation: "Informal verb sentences use short forms instead of ます.",
    topicTags: ["informal-sentence"],
    referencedWordIds: [entry.id],
  });
}

function buildQuoteThinkSaid({ bank, rng = Math.random }: GeneratorContext) {
  const useThink = rng() > 0.5;
  const scenarios = [
    {
      verb: findByKana(bank, "くる"),
      clauseKana: "せんせいが くる",
      english: "the teacher is coming",
    },
    {
      verb: findByKana(bank, "かえる"),
      clauseKana: "メアリーさんが かえる",
      english: "Mary is going home",
    },
    {
      verb: findByKana(bank, "べんきょうする"),
      clauseKana: "あした べんきょうする",
      english: "I will study tomorrow",
    },
    {
      verb: findByKana(bank, "おわる"),
      clauseKana: "パーティーが おわる",
      english: "the party ends",
    },
  ].filter((scenario) => scenario.verb) as Array<{
    verb: MidtermWordEntry;
    clauseKana: string;
    english: string;
  }>;
  const selectedScenario = randomItem(scenarios, rng);
  const suffix = useThink ? "と おもいます。" : "と いっていました。";
  const acceptedAnswers = withSentenceEnding(
    [`${selectedScenario.clauseKana}${suffix.slice(0, -1)}`],
    "。"
  );
  return makeQuestion({
    id: `quote-${selectedScenario.verb.id}-${useThink ? "think" : "said"}`,
    kind: "quote-think-said",
    answerMode: "typing",
    prompt: useThink
      ? `Write the Japanese sentence: "I think ${selectedScenario.english}."`
      : `Write the Japanese sentence: 'They said, "${selectedScenario.english}."'`,
    clue: "Use the short form before と.",
    displayAnswer: acceptedAnswers[0],
    acceptedAnswers,
    explanation: "Quoted speech with と思います and と言っていました takes the short form before と.",
    topicTags: ["quote-think-said"],
    referencedWordIds: [selectedScenario.verb.id],
  });
}

function buildNaideKudasai({ bank, state, rng = Math.random }: GeneratorContext) {
  const entry = pickFreshEntry(
    ["たばこをすう", "わすれる", "けす", "おそくなる"]
      .map((kana) => findByKana(bank, kana))
      .filter(Boolean) as MidtermWordEntry[],
    state.recentWordIds,
    rng
  );
  const answers = withSentenceEnding(
    getVerbForms(entry, "nai").map((value) => `${value}でください`),
    "。"
  );
  return makeQuestion({
    id: `naide-${entry.id}`,
    kind: "naide-kudasai",
    answerMode: "typing",
    prompt: `Say: "Please don't ${entry.meaning}."`,
    displayAnswer: answers[0],
    acceptedAnswers: answers,
    explanation: "To ask someone not to do something, use short negative + でください.",
    topicTags: ["naide-kudasai"],
    referencedWordIds: [entry.id],
  });
}

function buildWaVsGa({ bank, rng = Math.random }: GeneratorContext) {
  const templates = [
    {
      prompt: "Choose the correct particle: メアリーさん___ せがたかいです。",
      answer: "は",
      explanation: "Use は for the topic, then が inside the fixed description せがたかい.",
      tags: ["wa-vs-ga", "subject-ga"] as MidtermTopicTag[],
      ids: [findByKana(bank, "せがたかい")?.id].filter(Boolean) as string[],
    },
    {
      prompt: "Choose the correct particle: さくらさんは ピザ___ すきです。",
      answer: "が",
      explanation: "With すき, the liked item is marked by が in the pattern covered in class.",
      tags: ["wa-vs-ga"] as MidtermTopicTag[],
      ids: [findByKana(bank, "すき")?.id].filter(Boolean) as string[],
    },
    {
      prompt: "Choose the correct particle: わたし___ にほんごを べんきょうしています。",
      answer: "は",
      explanation: "Use は to set the topic in a neutral statement about yourself.",
      tags: ["wa-vs-ga"] as MidtermTopicTag[],
      ids: [findByKana(bank, "べんきょうする")?.id].filter(Boolean) as string[],
    },
  ];
  const picked = randomItem(templates, rng);
  return makeQuestion({
    id: `wa-ga-${picked.answer}-${picked.ids[0] ?? "none"}`,
    kind: "wa-vs-ga",
    answerMode: "multiple-choice",
    prompt: picked.prompt,
    displayAnswer: picked.answer,
    acceptedAnswers: [picked.answer],
    choices: shuffle(["は", "が"], rng),
    explanation: picked.explanation,
    topicTags: picked.tags,
    referencedWordIds: picked.ids,
  });
}

function buildNogaPreference({ bank, state, rng = Math.random }: GeneratorContext) {
  const verb = pickFreshEntry(
    ["よむ", "うたう", "おどる", "べんきょうする"]
      .map((kana) => findByKana(bank, kana))
      .filter(Boolean) as MidtermWordEntry[],
    state.recentWordIds,
    rng
  );
  const objectPrefix = verb.kana === "よむ" ? "ほんを " : "";
  const answers = withSentenceEnding(
    getVerbForms(verb, "dictionary").map((value) => `${objectPrefix}${value}のが すきです`),
    "。"
  );
  return makeQuestion({
    id: `noga-${verb.id}`,
    kind: "noga-preference",
    answerMode: "typing",
    prompt: `Say: "I like ${verb.meaning}."`,
    clue: "Use のが すきです.",
    displayAnswer: answers[0],
    acceptedAnswers: answers,
    explanation: "To say you like an activity, use the short form + のが すきです.",
    topicTags: ["noga-preference"],
    referencedWordIds: [verb.id, findByKana(bank, "すき")?.id ?? ""].filter(Boolean),
  });
}

function buildNanikaNanimo({ rng = Math.random }: GeneratorContext) {
  const positive = rng() > 0.5;
  const answer = positive ? "なにか" : "なにも";
  return makeQuestion({
    id: `nanika-nanimo-${positive ? "positive" : "negative"}`,
    kind: "nanika-nanimo",
    answerMode: "multiple-choice",
    prompt: positive
      ? "Fill the blank: きのう ___ たべました。"
      : "Fill the blank: きのう ___ たべませんでした。",
    displayAnswer: answer,
    acceptedAnswers: [answer],
    choices: shuffle(["なにか", "なにも", "だれか", "だれも"], rng),
    explanation: "Use 何か in positive statements for 'something', but 何も with a negative verb for 'nothing'.",
    topicTags: ["nanika-nanimo"],
    referencedWordIds: [],
  });
}

function buildNounQualification({ bank, rng = Math.random }: GeneratorContext) {
  const variants = [
    {
      id: "adj",
      prompt: 'Choose the correct phrase for "interesting book."',
      answer: "おもしろい ほん",
      choices: ["おもしろい ほん", "おもしろくて ほん", "おもしろいな ほん", "おもしろいです ほん"],
      ids: [findByKana(bank, "おもしろい")?.id].filter(Boolean) as string[],
    },
    {
      id: "verb",
      prompt: 'Choose the correct phrase for "the place where Mary lives."',
      answer: "メアリーさんが すむ ところ",
      choices: [
        "メアリーさんが すむ ところ",
        "メアリーさんが すみます ところ",
        "メアリーさんは すんで ところ",
        "メアリーさんの すむで ところ",
      ],
      ids: [findByKana(bank, "すむ")?.id, findByKana(bank, "ところ")?.id].filter(Boolean) as string[],
    },
  ];
  const picked = randomItem(variants, rng);
  return makeQuestion({
    id: `noun-qualification-${picked.id}`,
    kind: "noun-qualification",
    answerMode: "multiple-choice",
    prompt: picked.prompt,
    displayAnswer: picked.answer,
    acceptedAnswers: [picked.answer],
    choices: shuffle(picked.choices, rng),
    explanation: "Plain verbs and adjectives can directly modify a noun in Japanese.",
    topicTags: ["noun-qualification"],
    referencedWordIds: picked.ids,
  });
}

function buildMouMada({ bank, rng = Math.random }: GeneratorContext) {
  const noun = findByKana(bank, "さくぶん");
  const done = rng() > 0.5;
  const answer = done ? "もう" : "まだ";
  return makeQuestion({
    id: `mou-mada-${done ? "done" : "not-yet"}`,
    kind: "mou-mada",
    answerMode: "multiple-choice",
    prompt: done
      ? `Fill the blank: ${noun?.kana ?? "さくぶん"}を ___ かきました。`
      : `Fill the blank: ${noun?.kana ?? "さくぶん"}は ___ かいていません。`,
    displayAnswer: answer,
    acceptedAnswers: [answer],
    choices: shuffle(["もう", "まだ"], rng),
    explanation: "Use もう for already-done actions and まだ with a negative verb for not yet.",
    topicTags: ["mou-mada"],
    referencedWordIds: [noun?.id, findByKana(bank, "かく")?.id].filter(Boolean) as string[],
  });
}

function buildKaraReason({ bank, rng = Math.random }: GeneratorContext) {
  return makeQuestion({
    id: "kara-reason-cold-home",
    kind: "kara-reason",
    answerMode: "multiple-choice",
    prompt: 'Choose the natural sentence for "Because it is cold, I will stay home."',
    displayAnswer: "さむいから、うちにいます。",
    acceptedAnswers: ["さむいから、うちにいます。"],
    choices: shuffle(
      [
        "さむいから、うちにいます。",
        "さむいで、うちにいます。",
        "うちにいますから、さむいです。",
        "さむいので、うちにいます。",
      ],
      rng
    ),
    explanation: "Use plain form + から to attach a reason or explanation.",
    topicTags: ["kara-reason"],
    referencedWordIds: [findByKana(bank, "さむい")?.id, findByKana(bank, "いる")?.id].filter(Boolean) as string[],
  });
}

const questionBuilders: Record<MidtermQuestionKind, (context: GeneratorContext) => MidtermQuestion> = {
  "vocab-recognition": buildVocabRecognition,
  "verb-te-form": buildVerbTeForm,
  "te-iru-usage": buildTeIruUsage,
  "ga-description": buildGaDescription,
  "te-linking": buildTeLinking,
  "movement-purpose": buildMovementPurpose,
  "people-counter": buildPeopleCounter,
  "short-form-conjugation": buildShortFormConjugation,
  "informal-sentence": buildInformalSentence,
  "quote-think-said": buildQuoteThinkSaid,
  "naide-kudasai": buildNaideKudasai,
  "wa-vs-ga": buildWaVsGa,
  "noga-preference": buildNogaPreference,
  "nanika-nanimo": buildNanikaNanimo,
  "noun-qualification": buildNounQualification,
  "mou-mada": buildMouMada,
  "kara-reason": buildKaraReason,
};

const TOPIC_TO_KIND: Record<MidtermTopicTag, MidtermQuestionKind> = {
  "vocab-recognition": "vocab-recognition",
  "verb-te-form": "verb-te-form",
  "te-iru-usage": "te-iru-usage",
  "ga-description": "ga-description",
  "te-linking": "te-linking",
  "movement-purpose": "movement-purpose",
  "people-counter": "people-counter",
  "short-form-conjugation": "short-form-conjugation",
  "informal-sentence": "informal-sentence",
  "quote-think-said": "quote-think-said",
  "naide-kudasai": "naide-kudasai",
  "subject-ga": "ga-description",
  "wa-vs-ga": "wa-vs-ga",
  "noga-preference": "noga-preference",
  "nanika-nanimo": "nanika-nanimo",
  "noun-qualification": "noun-qualification",
  "mou-mada": "mou-mada",
  "kara-reason": "kara-reason",
};

export function buildMidtermQuestion(
  state: MidtermSessionState,
  bank: MidtermWordEntry[],
  rng = Math.random
) {
  const topic = state.currentTopic ?? "vocab-recognition";
  return questionBuilders[TOPIC_TO_KIND[topic]]({ bank, state, rng });
}

export function buildQuestionForTopic(
  topic: MidtermTopicTag,
  bank: MidtermWordEntry[],
  state: MidtermSessionState,
  rng = Math.random
) {
  return buildMidtermQuestion({ ...state, currentTopic: topic }, bank, rng);
}
