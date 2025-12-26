import { GoogleGenerativeAI } from "@google/generative-ai";
import { WritingFeedbackDetailed } from "@/types";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateAIFeedback(
  taskType: string,
  prompt: string,
  wordCount: number,
  content: string
): Promise<WritingFeedbackDetailed> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const systemPrompt = `You are an expert IELTS Writing examiner. Evaluate the following ${
      taskType === "task1" ? "Task 1" : "Task 2"
    } response

Task Prompt: ${prompt}

Student's Response: (${wordCount} words):
${content}

Provide detailed feedback in the following JSON format:
{
  "overallScore": <number between 0-9 in 0.5 increments>,
  "taskAchievement": {
    "score": <number 0-9>,
    "comments": "<detailed comments>",
    "suggestions": ["<suggestion 1>", "<suggestion 2>"]
  },
  "coherenceCohesion": {
    "score": <number 0-9>,
    "comments": "<detailed comments>",
    "suggestions": ["<suggestion 1>", "<suggestion 2>"]
  },
  "lexicalResource": {
    "score": <number 0-9>,
    "comments": "<detailed comments>",
    "suggestions": ["<suggestion 1>", "<suggestion 2>"]
  },
  "grammaticalAccuracy": {
    "score": <number 0-9>,
    "comments": "<detailed comments>",
    "errors": ["<error 1>", "<error 2>"]
  },
  "improvements": ["<key improvement 1>", "<key improvement 2>", "<key improvement 3>"],
  "strengths": ["<strength 1>", "<strength 2>"]
}
Be constructive, specific, and provide actionable feedback. Focus on IELTS band descriptors.`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    const feedback = JSON.parse(jsonText);
    return feedback as WritingFeedbackDetailed;
  } catch (error) {
    console.error("Error generating AI feedback:", error);
    return {
      overallScore: 0,
      taskAchievement: {
        score: 0,
        comments: "Unable to generate detailed feedback at this time",
        suggestions: ["Please try again later."],
      },
      coherenceCohesion: {
        score: 0,
        comments: "Unable to generate detailed feedback at this time",
        suggestions: ["Please try again later."],
      },
      lexicalResource: {
        score: 0,
        comments: "Unable to generate detailed feedback at this time",
        suggestions: ["Please try again later."],
      },
      grammaticalAccuracy: {
        score: 0,
        comments: "Unable to generate detailed feedback at this time",
        errors: ["Unable to generate detailed feedback at this time"],
      },
      improvements: ["Unable to generate detailed feedback at this time"],
      strengths: [],
    };
  }
}
