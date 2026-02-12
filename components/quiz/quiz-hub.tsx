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

export function QuizHub({ isQuizVisible = false }: { isQuizVisible?: boolean }) {
  const [activeConfig, setActiveConfig] = React.useState<QuizConfig>(presets[0]);
  const [customConfig, setCustomConfig] = React.useState<QuizConfig>(
    defaultCustomConfig
  );

  const typePresets = presets.filter(
    (preset) =>
      preset.verbTargets.includes("type") || preset.adjectiveTargets.includes("type")
  );
  const verbPresets = presets.filter(
    (preset) =>
      preset.wordGroups.includes("verb") &&
      !preset.verbTargets.includes("type") &&
      preset.adjectiveTargets.length === 0
  );
  const adjectivePresets = presets.filter(
    (preset) =>
      preset.wordGroups.includes("adjective") &&
      !preset.adjectiveTargets.includes("type") &&
      preset.verbTargets.length === 0
  );

  const getPresetFocus = (preset: QuizConfig) => {
    if (preset.verbTargets.includes("type") || preset.adjectiveTargets.includes("type")) {
      return "Type ID";
    }
    const targets = [...preset.verbTargets, ...preset.adjectiveTargets]
      .map((target) => getTargetLabel(target))
      .filter(Boolean);
    if (!targets.length) return "Mixed";
    return targets.join(" / ");
  };

  const renderPresetSection = (
    title: string,
    description: string,
    items: QuizConfig[]
  ) => (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((preset, index) => (
          <Card
            key={preset.id}
            className={cn(
              "transition hover:border-foreground/40",
              activeConfig.id === preset.id && "border-foreground"
            )}
            style={{
              opacity: isQuizVisible ? 1 : 0,
              transform: isQuizVisible ? "translateY(0)" : "translateY(20px)",
              transitionDuration: "500ms",
              transitionDelay: isQuizVisible ? `${200 + index * 50}ms` : "0ms",
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <CardHeader>
              <CardTitle>{preset.title}</CardTitle>
              <CardDescription>{preset.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {[...preset.verbTargets, ...preset.adjectiveTargets].map((target) => (
                  <Badge key={target} variant="secondary">
                    {getTargetLabel(target)}
                  </Badge>
                ))}
              </div>
              <Button size="sm" asChild>
                <Link href={`/quiz?preset=${preset.id}`}>Start</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
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
      {renderPresetSection(
        "Verb Conjugation",
        "Practice how verbs change form.",
        verbPresets
      )}
      {renderPresetSection(
        "Adjective Conjugation",
        "Practice polite and linking forms.",
        adjectivePresets
      )}
      {renderPresetSection(
        "Type Identification",
        "Name the word class at a glance.",
        typePresets
      )}

      <Card>
        <CardHeader>
          <CardTitle>Custom Quiz</CardTitle>
          <CardDescription>
            Turn off what you do not want. Your mix, your pace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Select Words
              </h3>
              <p className="text-sm text-muted-foreground">
                Pick which kinds of words to include.
              </p>
            </div>
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
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Select Targets
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose the form or focus you want to drill.
              </p>
            </div>
            <ToggleGroup
              label="Verb targets"
              options={[
                { id: "masu", label: "ます" },
                { id: "mashita", label: "ました" },
                { id: "te", label: "て" },
                { id: "te-imasu", label: "ています" },
                { id: "te-imashita", label: "ていました" },
                { id: "type", label: "Type" },
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
                { id: "type", label: "Type" },
              ]}
              selected={customConfig.adjectiveTargets}
              onToggle={(value) => handleCustomToggle("adjectiveTargets", value)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Question Style
              </h3>
              <p className="text-sm text-muted-foreground">
                Decide how you want to answer.
              </p>
            </div>
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
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={startCustom} disabled={!customValid}>
              Save Custom Quiz
            </Button>
            <Button asChild disabled={!customValid}>
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
