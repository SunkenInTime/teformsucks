"use client";

import * as React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { adjectives, type AdjectiveType, verbs, type VerbType, type WordEntry } from "@/lib/data/words";
import {
  getAnswer,
  getTargetLabel,
  getTypeLabel,
  normalizeAnswer,
  type AdjectiveTarget,
  type QuizTarget,
  type VerbTarget,
} from "@/lib/quiz/conjugation";
import { cn } from "@/lib/utils";

type QuestionMode = "multiple-choice" | "fill-blank" | "typing";

type QuizConfig = {
  id: string;
  title: string;
  description: string;
  wordGroups: Array<"verb" | "adjective">;
  verbTypes: VerbType[];
  adjectiveTypes: AdjectiveType[];
  verbTargets: VerbTarget[];
  adjectiveTargets: AdjectiveTarget[];
  modes: QuestionMode[];
};

type Question = {
  word: WordEntry;
  target: QuizTarget;
  mode: QuestionMode;
  answer: string;
  choices?: string[];
};

const verbTargets: VerbTarget[] = [
  "masu",
  "mashita",
  "te",
  "te-imasu",
  "te-imashita",
];
const adjectiveTargets: AdjectiveTarget[] = ["desu", "deshita", "te"];

const allModes: QuestionMode[] = ["multiple-choice", "fill-blank", "typing"];

const presets: QuizConfig[] = [
  {
    id: "verb-masu",
    title: "Verbs: ます",
    description: "Present polite",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["masu"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-mashita",
    title: "Verbs: ました",
    description: "Past polite",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["mashita"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-masu-mix",
    title: "Verbs: ます/ました",
    description: "Mixed present + past",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["masu", "mashita"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-te",
    title: "Verbs: て-form",
    description: "Plain て",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["te"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-te-imasu",
    title: "Verbs: ています",
    description: "Present continuous",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["te-imasu"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-te-imashita",
    title: "Verbs: ていました",
    description: "Past continuous",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["te-imashita"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "verb-te-iru-mix",
    title: "Verbs: ている mix",
    description: "Present + past continuous",
    wordGroups: ["verb"],
    verbTypes: ["u", "ru", "irregular"],
    adjectiveTypes: [],
    verbTargets: ["te-imasu", "te-imashita"],
    adjectiveTargets: [],
    modes: allModes,
  },
  {
    id: "adj-i-desu",
    title: "i-adj: です",
    description: "Present polite",
    wordGroups: ["adjective"],
    verbTypes: [],
    adjectiveTypes: ["i"],
    verbTargets: [],
    adjectiveTargets: ["desu"],
    modes: allModes,
  },
  {
    id: "adj-i-deshita",
    title: "i-adj: でした",
    description: "Past polite",
    wordGroups: ["adjective"],
    verbTypes: [],
    adjectiveTypes: ["i"],
    verbTargets: [],
    adjectiveTargets: ["deshita"],
    modes: allModes,
  },
  {
    id: "adj-na-desu",
    title: "na-adj: です",
    description: "Present polite",
    wordGroups: ["adjective"],
    verbTypes: [],
    adjectiveTypes: ["na"],
    verbTargets: [],
    adjectiveTargets: ["desu"],
    modes: allModes,
  },
  {
    id: "adj-na-deshita",
    title: "na-adj: でした",
    description: "Past polite",
    wordGroups: ["adjective"],
    verbTypes: [],
    adjectiveTypes: ["na"],
    verbTargets: [],
    adjectiveTargets: ["deshita"],
    modes: allModes,
  },
  {
    id: "adj-te",
    title: "Adjectives: て-link",
    description: "Connect two adjectives",
    wordGroups: ["adjective"],
    verbTypes: [],
    adjectiveTypes: ["i", "na"],
    verbTargets: [],
    adjectiveTargets: ["te"],
    modes: allModes,
  },
];

const defaultCustomConfig: QuizConfig = {
  id: "custom",
  title: "Custom Quiz",
  description: "Pick what you want to drill",
  wordGroups: ["verb", "adjective"],
  verbTypes: ["u", "ru", "irregular"],
  adjectiveTypes: ["i", "na"],
  verbTargets: [...verbTargets],
  adjectiveTargets: [...adjectiveTargets],
  modes: allModes,
};

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildChoices(
  correct: string,
  pool: WordEntry[],
  target: QuizTarget
): string[] {
  const choices = new Set<string>([correct]);
  let attempts = 0;
  while (choices.size < 4 && attempts < 50) {
    attempts += 1;
    const candidate = randomItem(pool);
    const value = getAnswer(candidate, target);
    choices.add(value);
  }
  const list = Array.from(choices);
  return list.sort(() => Math.random() - 0.5);
}

function buildQuestion(config: QuizConfig): Question | null {
  const includeVerbs =
    config.wordGroups.includes("verb") &&
    config.verbTypes.length > 0 &&
    config.verbTargets.length > 0;
  const includeAdjectives =
    config.wordGroups.includes("adjective") &&
    config.adjectiveTypes.length > 0 &&
    config.adjectiveTargets.length > 0;

  const words = [
    ...(includeVerbs
      ? verbs.filter((word) => config.verbTypes.includes(word.type as VerbType))
      : []),
    ...(includeAdjectives
      ? adjectives.filter((word) =>
          config.adjectiveTypes.includes(word.type as AdjectiveType)
        )
      : []),
  ];

  if (!words.length || !config.modes.length) return null;

  const word = randomItem(words);
  const targets: QuizTarget[] =
    word.group === "verb"
      ? (config.verbTargets as QuizTarget[])
      : (config.adjectiveTargets as QuizTarget[]);
  if (!targets.length) return null;

  const target = randomItem(targets) as QuizTarget;
  const mode = randomItem(config.modes);
  const answer = getAnswer(word, target);

  if (mode === "multiple-choice") {
    const choicePool = words.filter((item) => item.group === word.group);
    return {
      word,
      target,
      mode,
      answer,
      choices: buildChoices(answer, choicePool, target),
    };
  }

  return {
    word,
    target,
    mode,
    answer,
  };
}

function ToggleGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selected.includes(option.id);
          return (
            <Button
              key={option.id}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(!isActive && "text-muted-foreground")}
              onClick={() => onToggle(option.id)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export function QuizHub() {
  const [activeConfig, setActiveConfig] = React.useState<QuizConfig>(presets[0]);
  const [customConfig, setCustomConfig] = React.useState<QuizConfig>(
    defaultCustomConfig
  );
  const [question, setQuestion] = React.useState<Question | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "correct" | "incorrect">(
    "idle"
  );

  React.useEffect(() => {
    setQuestion(buildQuestion(activeConfig));
    setInputValue("");
    setStatus("idle");
  }, [activeConfig]);

  const resetQuestion = React.useCallback(() => {
    setQuestion(buildQuestion(activeConfig));
    setInputValue("");
    setStatus("idle");
  }, [activeConfig]);

  const checkAnswer = React.useCallback(
    (value: string) => {
      if (!question) return;
      const isCorrect =
        normalizeAnswer(value) === normalizeAnswer(question.answer);
      setStatus(isCorrect ? "correct" : "incorrect");
    },
    [question]
  );

  const handleCustomToggle = (
    key: keyof QuizConfig,
    value: string
  ) => {
    setCustomConfig((prev) => {
      const current = prev[key] as string[];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: next } as QuizConfig;
    });
  };

  const customValid =
    customConfig.wordGroups.length > 0 &&
    customConfig.modes.length > 0 &&
    ((customConfig.wordGroups.includes("verb") &&
      customConfig.verbTypes.length > 0 &&
      customConfig.verbTargets.length > 0) ||
      (customConfig.wordGroups.includes("adjective") &&
        customConfig.adjectiveTypes.length > 0 &&
        customConfig.adjectiveTargets.length > 0));

  React.useEffect(() => {
    if (activeConfig.id === "custom") {
      setActiveConfig({ ...customConfig });
    }
  }, [customConfig, activeConfig.id]);

  const startCustom = () => {
    if (!customValid) return;
    setActiveConfig({ ...customConfig });
  };

  return (
    <div className="space-y-10">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {presets.map((preset) => (
          <Card
            key={preset.id}
            className={cn(
              "transition hover:border-foreground/40",
              activeConfig.id === preset.id && "border-foreground"
            )}
          >
            <CardHeader>
              <CardTitle>{preset.title}</CardTitle>
              <CardDescription>{preset.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {[...preset.verbTargets, ...preset.adjectiveTargets].map(
                  (target) => (
                    <Badge key={target} variant="secondary">
                      {getTargetLabel(target)}
                    </Badge>
                  )
                )}
              </div>
              <Button
                size="sm"
                onClick={() => setActiveConfig(preset)}
              >
                Start
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Custom Quiz</CardTitle>
          <CardDescription>
            Turn off what you do not want. Your mix, your pace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ToggleGroup
            label="Parts of speech"
            options={[
              { id: "verb", label: "Verbs" },
              { id: "adjective", label: "Adjectives" },
            ]}
            selected={customConfig.wordGroups}
            onToggle={(value) => handleCustomToggle("wordGroups", value)}
          />

          <ToggleGroup
            label="Verb types"
            options={[
              { id: "u", label: "u-verb" },
              { id: "ru", label: "ru-verb" },
              { id: "irregular", label: "irregular" },
            ]}
            selected={customConfig.verbTypes}
            onToggle={(value) => handleCustomToggle("verbTypes", value)}
          />

          <ToggleGroup
            label="Adjective types"
            options={[
              { id: "i", label: "i-adj" },
              { id: "na", label: "na-adj" },
            ]}
            selected={customConfig.adjectiveTypes}
            onToggle={(value) => handleCustomToggle("adjectiveTypes", value)}
          />

          <Separator />

          <ToggleGroup
            label="Verb targets"
            options={[
              { id: "masu", label: "ます" },
              { id: "mashita", label: "ました" },
              { id: "te", label: "て" },
              { id: "te-imasu", label: "ています" },
              { id: "te-imashita", label: "ていました" },
            ]}
            selected={customConfig.verbTargets}
            onToggle={(value) => handleCustomToggle("verbTargets", value)}
          />

          <ToggleGroup
            label="Adjective targets"
            options={[
              { id: "desu", label: "です" },
              { id: "deshita", label: "でした" },
              { id: "te", label: "て" },
            ]}
            selected={customConfig.adjectiveTargets}
            onToggle={(value) => handleCustomToggle("adjectiveTargets", value)}
          />

          <Separator />

          <ToggleGroup
            label="Question types"
            options={[
              { id: "multiple-choice", label: "Multiple choice" },
              { id: "fill-blank", label: "Fill in blank" },
              { id: "typing", label: "Typing" },
            ]}
            selected={customConfig.modes}
            onToggle={(value) => handleCustomToggle("modes", value)}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={startCustom} disabled={!customValid}>
              Start Custom Quiz
            </Button>
            {!customValid && (
              <p className="text-sm text-muted-foreground">
                Select at least one valid word group, target, and question type.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle>{activeConfig.title}</CardTitle>
          <CardDescription>{activeConfig.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!question && (
            <p className="text-sm text-muted-foreground">
              This configuration has no valid questions. Adjust filters above.
            </p>
          )}

          {question && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{getTargetLabel(question.target)}</Badge>
                <Badge variant="secondary">{getTypeLabel(question.word)}</Badge>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-semibold">{question.word.meaning}</h3>
                <p className="text-sm text-muted-foreground">
                  {question.word.kana}
                </p>
              </div>

              {question.mode === "multiple-choice" && (
                <div className="grid gap-2 md:grid-cols-2">
                  {question.choices?.map((choice) => (
                    <Button
                      key={choice}
                      variant="outline"
                      onClick={() => checkAnswer(choice)}
                    >
                      {choice}
                    </Button>
                  ))}
                </div>
              )}

              {question.mode !== "multiple-choice" && (
                <div className="space-y-3">
                  {question.mode === "fill-blank" && (
                    <div className="rounded-md border border-dashed border-border px-4 py-3 text-sm">
                      <span className="text-muted-foreground">Fill:</span>{" "}
                      <span className="font-medium">
                        {question.word.kana} → ____ ({getTargetLabel(question.target)})
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-3 md:flex-row">
                    <Input
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          checkAnswer(inputValue);
                        }
                      }}
                      placeholder="Type your answer"
                    />
                    <Button onClick={() => checkAnswer(inputValue)}>
                      Check
                    </Button>
                  </div>
                </div>
              )}

              {status !== "idle" && (
                <div className="space-y-2 rounded-md border border-border bg-muted/40 p-4">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      status === "correct" && "text-foreground",
                      status === "incorrect" && "text-destructive"
                    )}
                  >
                    {status === "correct" ? "Nice." : "Not quite."}
                  </p>
                  {status === "incorrect" && (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Correct answer: {question.answer}</p>
                      <Link className="underline" href="/cheatsheet">
                        Need the cheat sheet?
                      </Link>
                    </div>
                  )}
                  <Button size="sm" variant="secondary" onClick={resetQuestion}>
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
