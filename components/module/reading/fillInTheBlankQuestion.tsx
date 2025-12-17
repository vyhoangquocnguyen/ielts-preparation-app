import React from "react";

type FillInTheBlankQuestionProps = {
  questionNumber: number;
  questionText: string;
  value: string;
  onChange: (value: string) => void;
};

function FillInTheBlankQuestion({ questionNumber, questionText, value, onChange }: FillInTheBlankQuestionProps) {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="font-medium">
        <span className="text-primary mr-2">{questionNumber}.</span>
        <span className="text-gray-600 dark:text-gray-400">{questionText}</span>
      </div>
      {/* Input field */}
      <div className="ml-6">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
        />
        <p className="text-xs text-muted-foreground">Type your answer exactly as it appears in the passage.</p>
      </div>
    </div>
  );
}

export default FillInTheBlankQuestion;
