import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScoreColor } from "@/lib/utils";
import { ArrowTrendingUpIcon, CheckCircleIcon, StarIcon } from "@heroicons/react/24/outline";
import React from "react";

export interface FeedbackCriterion {
  title: string;
  icon: React.ElementType;
  score: number;
  comments: string;
  description: string;
  suggestions?: string[];
  errors?: string[];
  issues?: string[];
}

interface FeedbackDisplayProps {
  criteria: FeedbackCriterion[];
  strengths?: string[];
  improvements?: string[];
  rewrittenSample?: string;
  tipsTitle?: string;
  tips?: { icon: string; text: string }[];
}

export default function FeedbackDisplay({
  criteria,
  strengths,
  improvements,
  rewrittenSample,
  tipsTitle = "What to do next",
  tips,
}: FeedbackDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Strengths */}
      {strengths && strengths.length > 0 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <StarIcon className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Detailed Criteria Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {criteria.map(({ title, icon: Icon, score, comments, description, suggestions, errors, issues }, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">{title}</CardTitle>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score Badge */}
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                Band {score}
              </div>

              {/* Comments */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Feedback</h4>
                <p className="text-sm text-muted-foreground">{comments}</p>
              </div>

              {/* Suggestions */}
              {suggestions && suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Suggestions</h4>
                  <ul className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-sm text-muted-foreground">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errors */}
              {errors && errors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Errors</h4>
                  <ul className="space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">x</span>
                        <span className="text-sm text-muted-foreground">{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Issues/Pronunciation */}
              {issues && issues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Detailed Issues</h4>
                  <ul className="space-y-1">
                    {issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">x</span>
                        <span className="text-sm text-muted-foreground">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Improvements */}
      {improvements && improvements.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <ArrowTrendingUpIcon className="w-5 h-5" /> Key Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {improvements.map((improvement, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Rewritten Sample */}
      {rewrittenSample && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-600 dark:text-purple-400">Rewritten Sample Answer</CardTitle>
            <p className="text-sm text-muted-foreground">Compare your response with this high-scoring version</p>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/30">
              <div className="whitespace-pre-wrap leading-relaxed text-sm">{rewrittenSample}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps / Tips */}
      {tips && tips.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-100">{tipsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-purple-900 dark:text-purple-100">
              {tips.map((tip, index) => (
                <p key={index}>
                  {tip.icon} {tip.text}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
