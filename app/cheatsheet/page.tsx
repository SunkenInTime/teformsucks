import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CheatSheetPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
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

        <Card>
          <CardHeader>
            <CardTitle>How to identify verb types</CardTitle>
            <CardDescription>Quick checks you can do fast.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Ru-verbs</strong>: usually end in いる / える and drop る
              before ます.
            </p>
            <p>
              <strong>U-verbs</strong>: everything else. Change the last sound to
              the い row before ます.
            </p>
            <p>
              <strong>Irregular</strong>: する, くる, and compound 〜する / 〜くる.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verb polite forms</CardTitle>
            <CardDescription>All quizzes use polite forms.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">Ru-verb</p>
              <p>たべる → たべます / たべました / たべて / たべています / たべていました</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="font-medium">U-verb</p>
              <p>のむ → のみます / のみました / のんで / のんでいます / のんでいました</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="font-medium">Irregular</p>
              <p>する → します / しました / して / しています / していました</p>
              <p>くる → きます / きました / きて / きています / きていました</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adjective types</CardTitle>
            <CardDescription>Identify i-adj vs na-adj fast.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>I-adj</strong>: end in い. Polite past becomes かったです.
            </p>
            <p>
              <strong>Na-adj</strong>: take です/でした. Use で to link.
            </p>
            <p>
              <strong>Special</strong>: いい → よい when conjugating (よかった, よくて).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adjective polite + linking</CardTitle>
            <CardDescription>Desu / deshita / te-linking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>おもしろい → おもしろいです / おもしろかったです / おもしろくて</p>
            <p>しずか → しずかです / しずかでした / しずかで</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
