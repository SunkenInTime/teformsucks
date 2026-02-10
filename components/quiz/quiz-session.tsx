"use client";

import * as React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

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

export function QuizSession({
  config,
  className,
}: {
  config: QuizConfig;
  className?: string;
}) {
  const [question, setQuestion] = React.useState<Question | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "correct" | "incorrect">(
    "idle"
  );
  const [selectedChoice, setSelectedChoice] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    setQuestion(buildQuestion(config));
    setInputValue("");
    setStatus("idle");
    setSelectedChoice(null);
  }, [config]);

  const resetQuestion = React.useCallback(() => {
    setQuestion(buildQuestion(config));
    setInputValue("");
    setStatus("idle");
    setSelectedChoice(null);
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

  React.useEffect(() => {
    if (status === "idle" || !question) return;
    if (question.mode !== "multiple-choice") return;

    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (event.repeat) return;
      const ignored = new Set([
        "Shift",
        "Control",
        "Alt",
        "Meta",
        "Tab",
        "CapsLock",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End",
      ]);
      if (ignored.has(event.key)) return;
      resetQuestion();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [status, question, resetQuestion]);

  return (
    <Card className={cn("border-0 shadow-none", className)}>
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
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {question.choices?.map((choice) => {
                    const normalizedChoice = normalizeAnswer(choice);
                    const normalizedAnswer = normalizeAnswer(question.answer);
                    const isSelected = selectedChoice === choice;
                    const showResult = status !== "idle" && isSelected;
                    const isCorrect =
                      showResult && normalizedChoice === normalizedAnswer;
                    return (
                      <Button
                        key={choice}
                        variant={
                          showResult
                            ? isCorrect
                              ? "default"
                              : "secondary"
                            : "outline"
                        }
                        className={cn(
                          "h-12 text-base",
                          showResult &&
                            isCorrect &&
                            "bg-emerald-500 text-white hover:bg-emerald-500",
                          showResult &&
                            !isCorrect &&
                            "bg-rose-500 text-white hover:bg-rose-500"
                        )}
                        onClick={() => {
                          setSelectedChoice(choice);
                          checkAnswer(choice);
                        }}
                      >
                        {choice}
                      </Button>
                    );
                  })}
                </div>
                <div>
                  <Button variant="outline" onClick={resetQuestion}>
                    Skip
                  </Button>
                </div>
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
                <div>
                  <Button variant="outline" onClick={resetQuestion}>
                    Skip
                  </Button>
                </div>
              </div>
            )}

            {status !== "idle" && (
              <div className="space-y-3 rounded-md border border-border bg-muted/40 p-5">
                <p
                  className={cn(
                    "text-base font-medium",
                    status === "correct" && "text-emerald-600 dark:text-emerald-400",
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
                {question.mode === "multiple-choice" && (
                  <p className="text-sm text-muted-foreground">
                    Press any key to continue.
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" onClick={resetQuestion}>
                    Next
                  </Button>
                  <Button variant="ghost" size="sm" asChild aria-label="Home">
                    <Link href="/">
                      <Home className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
