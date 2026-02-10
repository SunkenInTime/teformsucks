"use client";

import * as React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CUSTOM_QUIZ_STORAGE_KEY,
  defaultCustomConfig,
  presets,
  type QuizConfig,
} from "@/lib/quiz/config";
import { getTargetLabel } from "@/lib/quiz/conjugation";
import { cn } from "@/lib/utils";

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
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        CUSTOM_QUIZ_STORAGE_KEY,
        JSON.stringify(customConfig)
      );
    }
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
              <Button size="sm" asChild>
                <Link href={`/quiz?preset=${preset.id}`}>Start</Link>
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
              Save Custom Quiz
            </Button>
            <Button variant="secondary" asChild disabled={!customValid}>
              <Link href="/quiz?custom=1">Start Custom Quiz</Link>
            </Button>
            {!customValid && (
              <p className="text-sm text-muted-foreground">
                Select at least one valid word group, target, and question type.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
