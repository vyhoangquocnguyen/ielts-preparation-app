import { Label } from '@/components/ui/label';
import React from 'react'

interface MultipleChoiceQuestionProps {
    questionNumber: number;
    questionText: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

const MultipleChoiceQuestion = ({questionNumber, questionText, options, value, onChange}: MultipleChoiceQuestionProps) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="font-medium">
        <span className="text-primary mr-2">{questionNumber}.</span>
        <span className="text-gray-600 dark:text-gray-400">{questionText}</span>
      </div>
      {/* Radio buttons */}
      <div className="space-y-2 ml-6">
        {options.map((option) => (
          <Label
            key={option}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors">
            <input
              type="radio"
              name={`question-${questionNumber}`}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm">{option}</span>
          </Label>
        ))}
      </div>
    </div>
  )
}

export default MultipleChoiceQuestion