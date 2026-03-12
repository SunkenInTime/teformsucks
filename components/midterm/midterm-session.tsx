"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { answerMatches } from "@/lib/midterm/normalize";
import { createMidtermSessionState, getNextMidtermQuestion, recordMidtermResult } from "@/lib/midterm/scheduler";
import { MIDTERM_TOPIC_TAGS } from "@/lib/midterm/types";
import type { MidtermQuestion, MidtermSessionState, MidtermTopicTag, MidtermWordEntry } from "@/lib/midterm/types";
import { getSoundMuted, SOUND_MUTED_EVENT } from "@/lib/sound";

const topicLabels: Record<MidtermTopicTag, string> = {
  "vocab-recognition": "Vocab",
  "verb-te-form": "Verb て-Form",
  "te-iru-usage": "〜ている",
  "ga-description": "が in Descriptions",
  "te-linking": "Linking",
  "movement-purpose": "Purpose に",
  "people-counter": "People Counter",
  "short-form-conjugation": "Short Form",
  "informal-sentence": "Informal",
  "quote-think-said": "Quotes",
  "naide-kudasai": "ないでください",
  "subject-ga": "Subject が",
  "wa-vs-ga": "は vs が",
  "noga-preference": "のが",
  "nanika-nanimo": "何か / 何も",
  "noun-qualification": "Noun Qualifier",
  "mou-mada": "もう / まだ",
  "kara-reason": "から",
};

const kindLabels: Record<MidtermQuestion["kind"], string> = {
  "vocab-recognition": "Recognition",
  "verb-te-form": "Form Drill",
  "te-iru-usage": "Meaning Check",
  "ga-description": "Sentence Choice",
  "te-linking": "Sentence Link",
  "movement-purpose": "Sentence Build",
  "people-counter": "Counter Drill",
  "short-form-conjugation": "Conjugation",
  "informal-sentence": "Casual Rewrite",
  "quote-think-said": "Quoted Speech",
  "naide-kudasai": "Request Form",
  "wa-vs-ga": "Particle Choice",
  "noga-preference": "Preference Form",
  "nanika-nanimo": "Blank Fill",
  "noun-qualification": "Modifier Check",
  "mou-mada": "Completion",
  "kara-reason": "Reason Choice",
};

function useAudio() {
  const correctAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const swipeAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const hasPrimedAudioRef = React.useRef(false);
  const isMutedRef = React.useRef(false);

  const playSound = React.useCallback((ref: React.RefObject<HTMLAudioElement | null>) => {
    const audio = ref.current;
    if (!audio || isMutedRef.current) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const primeAudio = React.useCallback(() => {
    if (hasPrimedAudioRef.current) return;
    hasPrimedAudioRef.current = true;
    [correctAudioRef, wrongAudioRef, swipeAudioRef].forEach((ref) => {
      const audio = ref.current;
      if (!audio) return;
      const originalVolume = audio.volume;
      audio.volume = 0;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = originalVolume;
          })
          .catch(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = originalVolume;
          });
      }
    });
  }, []);

  React.useEffect(() => {
    isMutedRef.current = getSoundMuted();
    correctAudioRef.current = new Audio("/sound/correct.mp3");
    wrongAudioRef.current = new Audio("/sound/wrong.mp3");
    swipeAudioRef.current = new Audio("/sound/swipe.mp3");
    [correctAudioRef, wrongAudioRef, swipeAudioRef].forEach((ref) => {
      if (!ref.current) return;
      ref.current.preload = "auto";
      ref.current.load();
    });
    const handleMute = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      isMutedRef.current = Boolean(detail);
    };
    window.addEventListener(SOUND_MUTED_EVENT, handleMute);
    window.addEventListener("pointerdown", primeAudio, { capture: true, once: true });
    window.addEventListener("keydown", primeAudio, { capture: true, once: true });
    window.addEventListener("touchstart", primeAudio, { capture: true, once: true });

    return () => window.removeEventListener(SOUND_MUTED_EVENT, handleMute);
  }, [primeAudio]);

  return {
    correctAudioRef,
    wrongAudioRef,
    swipeAudioRef,
    playSound,
  };
}

export function MidtermSession({
  bank,
  className,
}: {
  bank: MidtermWordEntry[];
  className?: string;
}) {
  const [sessionState, setSessionState] = React.useState<MidtermSessionState>(() =>
    createMidtermSessionState()
  );
  const sessionStateRef = React.useRef<MidtermSessionState>(sessionState);
  const [question, setQuestion] = React.useState<MidtermQuestion | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [selectedChoice, setSelectedChoice] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "correct" | "incorrect">("idle");
  const [inputFeedback, setInputFeedback] = React.useState<"idle" | "success" | "error">("idle");
  const answerInputRef = React.useRef<HTMLInputElement | null>(null);
  const { correctAudioRef, wrongAudioRef, swipeAudioRef, playSound } = useAudio();

  const applySessionState = React.useCallback((nextState: MidtermSessionState) => {
    sessionStateRef.current = nextState;
    setSessionState(nextState);
  }, []);

  const loadNextQuestion = React.useCallback(() => {
    const next = getNextMidtermQuestion(sessionStateRef.current, bank);
    applySessionState(next.state);
    setQuestion(next.question);
    setInputValue("");
    setSelectedChoice(null);
    setStatus("idle");
    setInputFeedback("idle");
  }, [applySessionState, bank]);

  React.useEffect(() => {
    const initial = createMidtermSessionState();
    sessionStateRef.current = initial;
    const next = getNextMidtermQuestion(initial, bank);
    applySessionState(next.state);
    setQuestion(next.question);
  }, [applySessionState, bank]);

  React.useEffect(() => {
    if (!question) return;
    playSound(swipeAudioRef);
  }, [playSound, question, swipeAudioRef]);

  const triggerInputFeedback = React.useCallback((next: "success" | "error") => {
    setInputFeedback("idle");
    requestAnimationFrame(() => setInputFeedback(next));
  }, []);

  const resolveQuestion = React.useCallback(
    (isCorrect: boolean) => {
      if (!question || status !== "idle") return;
      applySessionState(recordMidtermResult(sessionStateRef.current, question, isCorrect));
      setStatus(isCorrect ? "correct" : "incorrect");
      triggerInputFeedback(isCorrect ? "success" : "error");
      playSound(isCorrect ? correctAudioRef : wrongAudioRef);
    },
    [applySessionState, correctAudioRef, playSound, question, status, triggerInputFeedback, wrongAudioRef]
  );

  const checkTypedAnswer = React.useCallback(() => {
    if (!question || question.answerMode !== "typing") return;
    resolveQuestion(answerMatches(inputValue, question.acceptedAnswers));
  }, [inputValue, question, resolveQuestion]);

  React.useEffect(() => {
    if (inputFeedback === "idle") return;
    const timeout = window.setTimeout(() => setInputFeedback("idle"), 600);
    return () => window.clearTimeout(timeout);
  }, [inputFeedback]);

  React.useEffect(() => {
    if (status === "idle") return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key.length === 1 || event.key.startsWith("Arrow")) {
        loadNextQuestion();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loadNextQuestion, status]);

  React.useEffect(() => {
    if (!question || question.answerMode !== "typing" || status !== "idle") return;
    const frame = requestAnimationFrame(() => {
      answerInputRef.current?.focus();
      answerInputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [question, status]);

  const promptTopic = question?.topicTags[0] ?? "vocab-recognition";
  const vocabCount = bank.filter((entry) => entry.source !== "supplemental").length;
  const accuracy =
    sessionState.attempted === 0
      ? 0
      : Math.round((sessionState.correct / sessionState.attempted) * 100);
  const inputFeedbackClass =
    inputFeedback === "success"
      ? "quiz-input-success"
      : inputFeedback === "error"
        ? "quiz-input-error"
        : "";

  return (
    <Card className={cn("border-0 shadow-none", className)}>
      <CardHeader className="px-0">
        <CardTitle className="text-3xl sm:text-4xl">Ultimate Midterm Review</CardTitle>
        <CardDescription className="text-base">
          Endless mixed cram across {vocabCount} vocab items, 18 grammar buckets,
          and fast replay on misses.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        {!question && <p className="text-sm text-muted-foreground">Loading review deck…</p>}

        {question && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="text-sm" variant="secondary">
                {topicLabels[promptTopic]}
              </Badge>
              <Badge className="text-sm" variant="outline">
                {kindLabels[question.kind]}
              </Badge>
              <Badge className="text-sm" variant="outline">
                Streak {sessionState.streak}
              </Badge>
              <Badge className="text-sm" variant="outline">
                {sessionState.correct}/{sessionState.attempted || 0}
              </Badge>
              <Badge className="text-sm" variant="outline">
                {accuracy}%
              </Badge>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Question {sessionState.askedCount}
              </p>
              <h3 className="text-4xl font-semibold leading-tight sm:text-5xl">
                {question.prompt}
              </h3>
              {question.clue && (
                <p className="text-base text-muted-foreground">{question.clue}</p>
              )}
            </div>

            {question.answerMode === "multiple-choice" && (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {question.choices?.map((choice) => {
                    const isSelected = selectedChoice === choice;
                    const isCorrect = answerMatches(choice, question.acceptedAnswers);
                    const showCorrect = status !== "idle" && isCorrect;
                    const showWrong = status === "incorrect" && isSelected && !isCorrect;

                    return (
                      <Button
                        key={choice}
                        variant={showWrong ? "secondary" : "outline"}
                        className={cn(
                          "h-12 text-base",
                          showCorrect &&
                            "bg-emerald-500 text-white hover:bg-emerald-500",
                          showWrong && "bg-rose-500 text-white hover:bg-rose-500"
                        )}
                        disabled={status !== "idle"}
                        onClick={() => {
                          setSelectedChoice(choice);
                          resolveQuestion(answerMatches(choice, question.acceptedAnswers));
                        }}
                      >
                        {choice}
                      </Button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!question || status !== "idle") {
                        loadNextQuestion();
                        return;
                      }
                      applySessionState(
                        recordMidtermResult(sessionStateRef.current, question, false)
                      );
                      setStatus("incorrect");
                      setInputFeedback("error");
                    }}
                  >
                    Skip
                  </Button>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Mixed review
                  </p>
                </div>
              </div>
            )}

            {question.answerMode === "typing" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    ref={answerInputRef}
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      if (status === "idle") {
                        checkTypedAnswer();
                        return;
                      }
                      loadNextQuestion();
                    }}
                    className={cn("h-12 text-base", inputFeedbackClass)}
                    placeholder="Type your answer"
                    disabled={status !== "idle"}
                  />
                  <Button
                    className={cn(
                      "h-12 text-base",
                      status === "correct" &&
                        "bg-emerald-500 text-white hover:bg-emerald-500"
                    )}
                    onClick={() => {
                      if (status === "idle") {
                        checkTypedAnswer();
                        return;
                      }
                      loadNextQuestion();
                    }}
                  >
                    {status === "idle" ? "Check" : "Next"}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!question || status !== "idle") {
                        loadNextQuestion();
                        return;
                      }
                      applySessionState(
                        recordMidtermResult(sessionStateRef.current, question, false)
                      );
                      setStatus("incorrect");
                      setInputFeedback("error");
                    }}
                  >
                    Skip
                  </Button>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Coverage {MIDTERM_TOPIC_TAGS.filter((topic) => sessionState.coverage[topic] > 0).length}/18
                  </p>
                </div>
              </div>
            )}

            {status !== "idle" && (
              <div className="space-y-3 rounded-md border border-border bg-muted/40 p-5">
                <p
                  className={cn(
                    "text-base font-medium",
                    status === "correct"
                      ? "text-emerald-600 dark:text-emerald-300"
                      : "text-destructive"
                  )}
                >
                  {status === "correct" ? "Correct." : "Not quite."}
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Answer: {question.displayAnswer}</p>
                  <p>{question.explanation}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Press Enter or any key to keep moving.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
