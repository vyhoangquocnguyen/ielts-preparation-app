import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScoreColor } from "@/lib/utils";
import { SpeakingFeedbackDetailed } from "@/types";
import {
  ArrowTrendingUpIcon,
  BookOpenIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  MicrophoneIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
interface Props {
  feedback: SpeakingFeedbackDetailed;
}

export default function SpeakingFeedbackDisplay({ feedback }: Props) {
  const { strengths, improvements, fluencyCoherence, lexicalResource, grammaticalAccuracy, pronunciation } = feedback;
  const criteria = [
    {
      title: "Fluency & Coherence",
      icon: ChatBubbleLeftEllipsisIcon,
      data: fluencyCoherence,
      description: "Flow of speech and logical organization",
    },
    {
      title: "Lexical Resource",
      icon: BookOpenIcon,
      data: lexicalResource,
      description: "Range and accuracy of vocabulary used",
    },
    {
      title: "Grammatical Range & Accuracy",
      icon: CheckBadgeIcon,
      data: grammaticalAccuracy,
      description: "Variety and accuracy of grammar",
    },
    {
      title: "Pronunciation",
      icon: MicrophoneIcon,
      data: pronunciation,
      description: "Clarity and natural rhythm",
    },
  ];
  return (
    <div className="space-y-6">
      {/* Strength */}
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
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {/* Detailed Criteria Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {criteria.map(({ icon: Icon, ...criteria }, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">{criteria.title}</CardTitle>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(criteria.data.score)}`}>{criteria.data.score}</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{criteria.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score Badge */}
              <div
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                  criteria.data.score
                )}`}>
                Band {criteria.data.score}
              </div>
              {/* Comments */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Feedback</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{criteria.data.comments}</p>
              </div>
              {/* Suggestions */}
              {criteria.data.suggestions && criteria.data.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Suggestions</h4>
                  <ul className="space-y-1">
                    {criteria.data.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errors */}
              {criteria.data.errors && criteria.data.errors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Errors</h4>
                  <ul className="space-y-1">
                    {criteria.data.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-red-600 mt-1">x</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pronunciation Issue */}
              {criteria.data.issues && criteria.data.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Issues</h4>
                  <ul className="space-y-1">
                    {criteria.data.issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-red-600 mt-1">x</span>
                        <span>{issue}</span>
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
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <ArrowTrendingUpIcon className="w-5 h-5" />
            Key Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-900 dark:text-purple-100">Practice Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-purple-900 dark:text-purple-100">
            <p>🎤 Record yourself regularly to track improvement over time</p>
            <p>👂 Listen to native speakers and mimic their pronunciation</p>
            <p>📚 Expand vocabulary by reading widely and noting new words</p>
            <p>🗣️ Practice speaking on various topics for 2 minutes without stopping</p>
            <p>✍️ Work on grammar through writing exercises and correction</p>
            <p>💬 Join speaking groups or find language exchange partners</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
