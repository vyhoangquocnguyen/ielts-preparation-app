"use client";

import FillInTheBlankQuestion from "./fillInTheBlankQuestion";
import MultipleChoiceQuestion from "./multipleChoiceQuestion";
import TrueFalseQuestion from "./trueFalseQuestion";

type Question = {
  id: string;
  questionNumber: number;
  questionType: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
};

interface QuestionsPanelProps {
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
}

function renderQuestion(
  question: Question,
  answers: Record<string, string>,
  onAnswerChange: (questionId: string, answer: string) => void
) {
  const currentAnswer = answers[question.id] || "";

  // True/false/not given questions
  if (question.questionType === "true_false_ng") {
    return (
      <TrueFalseQuestion
        questionNumber={question.questionNumber}
        questionText={question.questionText}
        value={currentAnswer}
        onChange={(value) => onAnswerChange(question.id, value)}
      />
    );
  }
  // Multiple choice questions
  if (question.questionType === "multiple_choice") {
    return (
      <MultipleChoiceQuestion
        questionNumber={question.questionNumber}
        questionText={question.questionText}
        options={question.options}
        value={currentAnswer}
        onChange={(value) => onAnswerChange(question.id, value)}
      />
    );
  }
  // Fill the BLANK questions
  if (question.questionType === "fill_in_the_blank") {
    return (
      <FillInTheBlankQuestion
        questionNumber={question.questionNumber}
        questionText={question.questionText}
        value={currentAnswer}
        onChange={(value) => onAnswerChange(question.id, value)}
      />
    );
  }
  // Fallback for unknown types
  return (
    <div className="p-4 border bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
      <p className="text-sm text-yellow-800 dark:text-yellow-400">Unknown question type: {question.questionType}</p>{" "}
    </div>
  );
}

const QuestionsPanel = ({ questions, answers, onAnswerChange }: QuestionsPanelProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Questions</h2>
      {questions.map((question) => (
        <div key={question.id} className="space-y-2">
          {renderQuestion(question, answers, onAnswerChange)} {renderQuestion(question, answers, onAnswerChange)}
        </div>
      ))}
    </div>
  );
};

export default QuestionsPanel;
