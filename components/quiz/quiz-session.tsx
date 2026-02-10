"use client";

import * as React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adjectives, type AdjectiveType, verbs, type VerbType, type WordEntry } from "@/lib/data/words";
import {
  getAnswer,
  getTargetLabel,
  getTypeLabel,
  normalizeAnswer,
  type QuizTarget,
} from "@/lib/quiz/conjugation";
import type { QuizConfig } from "@/lib/quiz/config";
import { cn } from "@/lib/utils";

type Question = {
  word: WordEntry;
  target: QuizTarget;
  mode: "multiple-choice" | "fill-blank" | "typing";
  answer: string;
  choices?: string[];
};

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildChoices(correct: string, pool: WordEntry[], target: QuizTarget) {
  const choices = new Set<string>([correct]);
  let attempts = 0;
  while (choices.size < 4 && attempts < 50) {
    attempts += 1;
    const candidate = randomItem(pool);
    const value = getAnswer(candidate, target);
    choices.add(value);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
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

  const target = randomItem(targets);
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

export function QuizSession({ config }: { config: QuizConfig }) {
  const [question, setQuestion] = React.useState<Question | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "correct" | "incorrect">(
    "idle"
  );

  React.useEffect(() => {
    setQuestion(buildQuestion(config));
    setInputValue("");
    setStatus("idle");
  }, [config]);

  const resetQuestion = React.useCallback(() => {
    setQuestion(buildQuestion(config));
    setInputValue("");
    setStatus("idle");
  }, [config]);

  const checkAnswer = React.useCallback(
    (value: string) => {
      if (!question) return;
      const isCorrect =
        normalizeAnswer(value) === normalizeAnswer(question.answer);
      setStatus(isCorrect ? "correct" : "incorrect");
    },
    [question]
  );

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl sm:text-4xl">
          {config.title}
        </CardTitle>
        <CardDescription className="text-base">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {!question && (
          <p className="text-base text-muted-foreground">
            This configuration has no valid questions. Adjust filters.
          </p>
        )}

        {question && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="text-sm" variant="secondary">
                {getTargetLabel(question.target)}
              </Badge>
              <Badge className="text-sm" variant="outline">
                {getTypeLabel(question.word)}
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="text-4xl font-semibold sm:text-5xl">
                {question.word.meaning}
              </h3>
              <p className="text-base text-muted-foreground">
                {question.word.kana}
              </p>
            </div>

            {question.mode === "multiple-choice" && (
              <div className="grid gap-3 md:grid-cols-2">
                {question.choices?.map((choice) => (
                  <Button
                    key={choice}
                    variant="outline"
                    className="h-12 text-base"
                    onClick={() => checkAnswer(choice)}
                  >
                    {choice}
                  </Button>
                ))}
              </div>
            )}

            {question.mode !== "multiple-choice" && (
              <div className="space-y-4">
                {question.mode === "fill-blank" && (
                  <div className="rounded-md border border-dashed border-border px-4 py-4 text-base">
                    <span className="text-muted-foreground">Fill:</span>{" "}
                    <span className="font-medium">
                      {question.word.kana} → ____ ({getTargetLabel(question.target)})
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        checkAnswer(inputValue);
                      }
                    }}
                    className="h-12 text-base"
                    placeholder="Type your answer"
                  />
                  <Button className="h-12 text-base" onClick={() => checkAnswer(inputValue)}>
                    Check
                  </Button>
                </div>
              </div>
            )}

            {status !== "idle" && (
              <div className="space-y-3 rounded-md border border-border bg-muted/40 p-5">
                <p
                  className={cn(
                    "text-base font-medium",
                    status === "correct" && "text-foreground",
                    status === "incorrect" && "text-destructive"
                  )}
                >
                  {status === "correct" ? "Nice." : "Not quite."}
                </p>
                {status === "incorrect" && (
                  <div className="space-y-1 text-base text-muted-foreground">
                    <p>Correct answer: {question.answer}</p>
                    <Link className="underline" href="/cheatsheet">
                      Need the cheat sheet?
                    </Link>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" variant="secondary" onClick={resetQuestion}>
                    Next
                  </Button>
                  <Link className="text-sm underline" href="/">
                    Back to home
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
