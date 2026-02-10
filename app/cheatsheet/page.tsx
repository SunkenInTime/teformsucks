import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CheatSheetPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-6 py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Cheatsheet
            </p>
            <h1 className="text-3xl font-semibold">Conjugation guide</h1>
            <p className="text-sm text-muted-foreground">
              Use this when you get stuck. Keep it short and focused.
            </p>
          </div>
          <Link className="text-sm underline" href="/">
            Back to quiz
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border bg-background px-2 py-0.5 font-medium text-muted-foreground">
            Legend
          </span>
          <span className="rounded-full bg-emerald-800/80 px-2 py-0.5 font-semibold text-emerald-50 dark:bg-emerald-500/35 dark:text-emerald-50">
            Ru-verb
          </span>
          <span className="rounded-full bg-sky-800/80 px-2 py-0.5 font-semibold text-sky-50 dark:bg-sky-500/35 dark:text-sky-50">
            U-verb
          </span>
          <span className="rounded-full bg-amber-800/80 px-2 py-0.5 font-semibold text-amber-50 dark:bg-amber-500/35 dark:text-amber-50">
            Irregular
          </span>
          <span className="rounded-full bg-teal-800/80 px-2 py-0.5 font-semibold text-teal-50 dark:bg-teal-500/35 dark:text-teal-50">
            I-adj
          </span>
          <span className="rounded-full bg-orange-800/80 px-2 py-0.5 font-semibold text-orange-50 dark:bg-orange-500/35 dark:text-orange-50">
            Na-adj
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How to identify verb types</CardTitle>
            <CardDescription>Quick checks you can do fast.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Fast check</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border bg-background px-2 py-0.5 text-xs font-medium">
                  Ends in いる / える
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="rounded-full bg-emerald-800/80 px-2 py-0.5 text-xs font-semibold text-emerald-50 dark:bg-emerald-500/35 dark:text-emerald-50">
                  Ru-verb
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="rounded-full border bg-background px-2 py-0.5 text-xs font-medium">
                  Otherwise
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="rounded-full bg-sky-800/80 px-2 py-0.5 text-xs font-semibold text-sky-50 dark:bg-sky-500/35 dark:text-sky-50">
                  U-verb
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-background/60 p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rule</p>
                  <span className="rounded-full bg-emerald-800/80 px-2 py-0.5 text-xs font-semibold text-emerald-50 dark:bg-emerald-500/35 dark:text-emerald-50">
                    Ru-verb
                  </span>
                </div>
                <p className="mt-2 font-medium">Drop る before ます</p>
                <p className="text-muted-foreground">Often end in いる / える</p>
                <p className="mt-2 font-mono text-sm">たべる → たべます</p>
              </div>

              <div className="rounded-lg border bg-background/60 p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rule</p>
                  <span className="rounded-full bg-sky-800/80 px-2 py-0.5 text-xs font-semibold text-sky-50 dark:bg-sky-500/35 dark:text-sky-50">
                    U-verb
                  </span>
                </div>
                <p className="mt-2 font-medium">Change last kana to い-row</p>
                <p className="text-muted-foreground">う→い, く→き, む→み, ぶ→び, ぬ→に, る→り, つ→ち, す→し, ぐ→ぎ</p>
                <p className="mt-2 font-mono text-sm">のむ → のみます</p>
              </div>

              <div className="rounded-lg border bg-background/60 p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rule</p>
                  <span className="rounded-full bg-amber-800/80 px-2 py-0.5 text-xs font-semibold text-amber-50 dark:bg-amber-500/35 dark:text-amber-50">
                    Irregular
                  </span>
                </div>
                <p className="mt-2 font-medium">Only a few verbs</p>
                <p className="text-muted-foreground">する, くる, and 〜する / 〜くる compounds</p>
                <p className="mt-2 font-mono text-sm">する → します / くる → きます</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verb polite forms</CardTitle>
            <CardDescription>All quizzes use polite forms.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="overflow-x-auto">
              <div className="min-w-[720px] rounded-lg border bg-muted/30 p-3">
                <div className="grid grid-cols-6 gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <div>Example</div>
                  <div>ます</div>
                  <div>ました</div>
                  <div>て</div>
                  <div>ています</div>
                  <div>ていました</div>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-6 gap-2 rounded-md border bg-background/60 p-2">
                    <div>
                      <p className="font-medium">たべる</p>
                      <p className="text-xs text-muted-foreground">Ru-verb</p>
                    </div>
                    <div className="font-mono">たべます</div>
                    <div className="font-mono">たべました</div>
                    <div className="font-mono">たべて</div>
                    <div className="font-mono">たべています</div>
                    <div className="font-mono">たべていました</div>
                  </div>

                  <div className="grid grid-cols-6 gap-2 rounded-md border bg-background/60 p-2">
                    <div>
                      <p className="font-medium">のむ</p>
                      <p className="text-xs text-muted-foreground">U-verb</p>
                    </div>
                    <div className="font-mono">のみます</div>
                    <div className="font-mono">のみました</div>
                    <div className="font-mono">のんで</div>
                    <div className="font-mono">のんでいます</div>
                    <div className="font-mono">のんでいました</div>
                  </div>

                  <div className="grid grid-cols-6 gap-2 rounded-md border bg-background/60 p-2">
                    <div>
                      <p className="font-medium">する</p>
                      <p className="text-xs text-muted-foreground">Irregular</p>
                    </div>
                    <div className="font-mono">します</div>
                    <div className="font-mono">しました</div>
                    <div className="font-mono">して</div>
                    <div className="font-mono">しています</div>
                    <div className="font-mono">していました</div>
                  </div>

                  <div className="grid grid-cols-6 gap-2 rounded-md border bg-background/60 p-2">
                    <div>
                      <p className="font-medium">くる</p>
                      <p className="text-xs text-muted-foreground">Irregular</p>
                    </div>
                    <div className="font-mono">きます</div>
                    <div className="font-mono">きました</div>
                    <div className="font-mono">きて</div>
                    <div className="font-mono">きています</div>
                    <div className="font-mono">きていました</div>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Tip: In quizzes, identify the type first, then read across the row for the target form.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adjective types</CardTitle>
            <CardDescription>Identify i-adj vs na-adj fast.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-background/60 p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Type</p>
                  <span className="rounded-full bg-teal-800/80 px-2 py-0.5 text-xs font-semibold text-teal-50 dark:bg-teal-500/35 dark:text-teal-50">
                    I-adj
                  </span>
                </div>
                <p className="mt-2 font-medium">Ends in い</p>
                <p className="text-muted-foreground">Past polite: かったです</p>
                <p className="text-muted-foreground">Linking: くて</p>
                <p className="mt-2 font-mono text-sm">おもしろい → おもしろかったです</p>
              </div>

              <div className="rounded-lg border bg-background/60 p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Type</p>
                  <span className="rounded-full bg-orange-800/80 px-2 py-0.5 text-xs font-semibold text-orange-50 dark:bg-orange-500/35 dark:text-orange-50">
                    Na-adj
                  </span>
                </div>
                <p className="mt-2 font-medium">Needs です / でした</p>
                <p className="text-muted-foreground">Linking: で</p>
                <p className="mt-2 font-mono text-sm">しずか → しずかでした</p>
              </div>
            </div>

            <div className="rounded-lg border border-dashed bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Special</p>
              <p className="mt-1 font-medium">いい → よい when conjugating</p>
              <p className="text-muted-foreground">よかった, よくて</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adjective polite + linking</CardTitle>
            <CardDescription>Desu / deshita / te-linking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="overflow-x-auto">
              <div className="min-w-[560px] rounded-lg border bg-muted/30 p-3">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <div>Dictionary</div>
                  <div>Polite</div>
                  <div>Past</div>
                  <div>Linking</div>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-4 gap-2 rounded-md border bg-background/60 p-2">
                    <div className="font-medium">おもしろい</div>
                    <div className="font-mono">おもしろいです</div>
                    <div className="font-mono">おもしろかったです</div>
                    <div className="font-mono">おもしろくて</div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 rounded-md border bg-background/60 p-2">
                    <div className="font-medium">しずか</div>
                    <div className="font-mono">しずかです</div>
                    <div className="font-mono">しずかでした</div>
                    <div className="font-mono">しずかで</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
