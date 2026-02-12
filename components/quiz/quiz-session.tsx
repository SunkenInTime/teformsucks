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
  getAcceptedAnswers,
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
  acceptedAnswers: string[];
  choices?: string[];
};

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildChoices(correct: string, pool: WordEntry[], target: QuizTarget) {
  if (target === "type") {
    const options =
      pool.length && pool[0]?.group === "verb"
        ? ["u-verb", "ru-verb", "irregular"]
        : ["i-adj", "na-adj"];
    return options.sort(() => Math.random() - 0.5);
  }

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
  let mode = randomItem(config.modes);
  const answer = getAnswer(word, target);
  const acceptedAnswers = getAcceptedAnswers(word, target);
  const answerLabel = target === "type" ? getTypeLabel(word) : answer;

  if (target === "type") {
    mode = "multiple-choice";
  }

  if (mode === "multiple-choice") {
    const choicePool = words.filter((item) => item.group === word.group);
    return {
      word,
      target,
      mode,
      answer: answerLabel,
      acceptedAnswers,
      choices: buildChoices(answerLabel, choicePool, target),
    };
  }

  return {
    word,
    target,
    mode,
    answer: answerLabel,
    acceptedAnswers,
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
  const [inputFeedback, setInputFeedback] = React.useState<
    "idle" | "success" | "error"
  >("idle");
  const [selectedChoice, setSelectedChoice] = React.useState<string | null>(
    null
  );
  const [requireCorrection, setRequireCorrection] = React.useState(false);
  const [correctionAccepted, setCorrectionAccepted] = React.useState(false);
  const answerInputRef = React.useRef<HTMLInputElement | null>(null);
  const isIncorrect = status === "incorrect";
  const mustCorrect = requireCorrection && isIncorrect && !correctionAccepted;
  const canAdvance =
    status === "correct" || (isIncorrect && !requireCorrection) || correctionAccepted;
  const isSuccess = status === "correct" || correctionAccepted;
  const inputFeedbackClass =
    inputFeedback === "success"
      ? "quiz-input-success"
      : inputFeedback === "error"
        ? "quiz-input-error"
        : "";
  const actionLabel = isSuccess ? "Next" : mustCorrect ? "Confirm" : "Check";

  React.useEffect(() => {
    setQuestion(buildQuestion(config));
    setInputValue("");
    setStatus("idle");
    setInputFeedback("idle");
    setSelectedChoice(null);
    setCorrectionAccepted(false);
  }, [config]);

  const resetQuestion = React.useCallback(() => {
    setQuestion(buildQuestion(config));
    setInputValue("");
    setStatus("idle");
    setInputFeedback("idle");
    setSelectedChoice(null);
    setCorrectionAccepted(false);
  }, [config]);

  const answerMatches = React.useCallback(
    (value: string) => {
      if (!question) return false;
      const normalizedValue = normalizeAnswer(value);
      return question.acceptedAnswers.some(
        (answer) => normalizeAnswer(answer) === normalizedValue
      );
    },
    [question]
  );

  const triggerInputFeedback = React.useCallback(
    (next: "success" | "error") => {
      setInputFeedback("idle");
      requestAnimationFrame(() => setInputFeedback(next));
    },
    []
  );

  const checkAnswer = React.useCallback(
    (value: string) => {
      if (!question) return;
      const isCorrect = answerMatches(value);
      setStatus(isCorrect ? "correct" : "incorrect");
      setCorrectionAccepted(false);
      triggerInputFeedback(isCorrect ? "success" : "error");
      if (question.mode !== "multiple-choice") {
        requestAnimationFrame(() => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        });
      }
    },
    [answerMatches, question, triggerInputFeedback]
  );

  const confirmCorrection = React.useCallback(() => {
    if (!question) return;
    const isCorrect = answerMatches(inputValue);
    if (isCorrect) {
      setCorrectionAccepted(true);
      triggerInputFeedback("success");
      requestAnimationFrame(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
    } else {
      triggerInputFeedback("error");
    }
  }, [answerMatches, inputValue, question, triggerInputFeedback]);

  React.useEffect(() => {
    if (inputFeedback === "idle") return;
    const timeout = window.setTimeout(() => {
      setInputFeedback("idle");
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [inputFeedback]);

  React.useEffect(() => {
    if (status === "idle" || !question || !canAdvance) return;

    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || target.isContentEditable) {
          return;
        }
      }
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
  }, [status, question, canAdvance, resetQuestion]);

  React.useEffect(() => {
    if (!mustCorrect) return;
    const frame = requestAnimationFrame(() => {
      answerInputRef.current?.focus();
      answerInputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [mustCorrect]);

  React.useEffect(() => {
    if (status === "idle" || !question || !canAdvance) return;
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
  }, [status, question, canAdvance, resetQuestion]);

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
                      const isSelected = selectedChoice === choice;
                      const isCorrectAnswer = question.acceptedAnswers.some(
                        (answer) => normalizeAnswer(answer) === normalizedChoice
                      );
                      const showCorrectHighlight =
                        status === "incorrect" && isCorrectAnswer;
                      const showSelectedCorrect =
                        status === "correct" && isSelected && isCorrectAnswer;
                    const showSelectedWrong =
                      status === "incorrect" && isSelected && !isCorrectAnswer;
                    return (
                      <Button
                        key={choice}
                        variant={showSelectedWrong ? "secondary" : "outline"}
                        className={cn(
                          "h-12 text-base",
                          (showCorrectHighlight || showSelectedCorrect) &&
                            "bg-emerald-500 text-white hover:bg-emerald-500",
                          showSelectedWrong &&
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
                  {mustCorrect && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Type the correct answer to continue.
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                          ref={answerInputRef}
                          value={inputValue}
                          onChange={(event) => setInputValue(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              confirmCorrection();
                            }
                          }}
                          className={cn("h-10 text-sm", inputFeedbackClass)}
                          placeholder="Correct answer"
                        />
                        <Button variant="secondary" onClick={confirmCorrection}>
                          Confirm
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <Button variant="outline" onClick={resetQuestion}>
                      Skip
                    </Button>
                    <label className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-foreground"
                      checked={requireCorrection}
                      onChange={(event) =>
                        setRequireCorrection(event.target.checked)
                      }
                    />
                    Correct before continue
                  </label>
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
                    ref={answerInputRef}
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        if (isSuccess) {
                          resetQuestion();
                          return;
                        }
                        if (mustCorrect) {
                          confirmCorrection();
                          return;
                        }
                        checkAnswer(inputValue);
                      }
                    }}
                    className={cn("h-12 text-base", inputFeedbackClass)}
                    placeholder="Type your answer"
                    disabled={isSuccess}
                  />
                  <Button
                    className={cn(
                      "h-12 text-base",
                      isSuccess &&
                        "bg-emerald-500 text-white hover:bg-emerald-500"
                    )}
                    onClick={() => {
                      if (isSuccess) {
                        resetQuestion();
                        return;
                      }
                      if (mustCorrect) {
                        confirmCorrection();
                        return;
                      }
                      checkAnswer(inputValue);
                    }}
                  >
                    {actionLabel}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Button variant="outline" onClick={resetQuestion}>
                    Skip
                  </Button>
                  <label className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-foreground"
                      checked={requireCorrection}
                      onChange={(event) =>
                        setRequireCorrection(event.target.checked)
                      }
                    />
                    Correct before continue
                  </label>
                </div>
              </div>
            )}

            {status !== "idle" && (
              <div className="space-y-3 rounded-md border border-border bg-muted/40 p-5">
                <p
                  className={cn(
                    "text-base font-medium",
                    (status === "correct" || correctionAccepted) &&
                      "text-emerald-600 dark:text-emerald-400",
                    status === "incorrect" && !correctionAccepted && "text-destructive"
                  )}
                >
                  {status === "correct" || correctionAccepted
                    ? "Good."
                    : "Not quite."}
                </p>
                {status === "incorrect" && (
                  <div className="space-y-1 text-base text-muted-foreground">
                    <p>Correct answer: {question.answer}</p>
                    <Link className="underline" href="/cheatsheet">
                      Need the cheat sheet?
                    </Link>
                  </div>
                )}
                {canAdvance && !mustCorrect && (
                  <p className="text-sm text-muted-foreground">
                    Press any key to continue.
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
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
