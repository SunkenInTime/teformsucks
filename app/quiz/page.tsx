import { Suspense } from "react";

import { QuizPageClient } from "@/components/quiz/quiz-page-client";

export default function QuizPage() {
  return (
    <Suspense>
      <QuizPageClient />
    </Suspense>
  );
}
