import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuizHub } from "@/components/quiz/quiz-hub";

describe("QuizHub", () => {
  it("renders the featured midterm review card", () => {
    render(<QuizHub isQuizVisible />);

    expect(screen.getByText("Ultimate Midterm Review")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Start Midterm Review" })
    ).toHaveAttribute("href", "/midterm");
  });
});
