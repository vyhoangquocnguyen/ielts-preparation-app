import { GoogleGenerativeAI } from "@google/generative-ai";
import { SpeakingFeedbackDetailed, WritingFeedbackDetailed } from "@/types";
import { speakingAIFeedbackSchema, writingAIFeedbackSchema } from "./validation";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Generate writing feedback
export async function generateWritingAIFeedback(
  taskType: string,
  prompt: string,
  wordCount: number,
  content: string
): Promise<WritingFeedbackDetailed> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

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
    return writingAIFeedbackSchema.parse(feedback) as WritingFeedbackDetailed;
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

// Generate speaking feedback
export async function generateSpeakingAIFeedback(
  part: string,
  questions: string[],
  audioBase64: string,
  duration: number,
  mimeType: string = "audio/webm"
): Promise<SpeakingFeedbackDetailed> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const systemPrompt = `You are an expert IELTS Speaking examiner. Evaluate the following Speaking ${
      part === "part1" ? "Part 1" : part === "part2" ? "Part 2" : "Part 3"
    } response.

Questions: ${questions.join(", ")}

The audio recording is ${duration} seconds long.

Provide detailed feedback in the following JSON format:
{
  "overallScore": <number between 0-9 in 0.5 increments>,
  "fluencyCoherence": {
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
  "pronunciation": {
    "score": <number 0-9>,
    "comments": "<detailed comments>",
    "issues": ["<issue 1>", "<issue 2>"]
  },
  "improvements": ["<key improvement 1>", "<key improvement 2>", "<key improvement 3>"],
  "strengths": ["<strength 1>", "<strength 2>"]
}

Be constructive, specific, and provide actionable feedback. Consider:
- Natural speech patterns and hesitations
- Vocabulary range and appropriacy
- Grammar accuracy and complexity
- Pronunciation clarity
- Fluency and coherence of ideas`;

    // Call Gemini API with audio as inline data
    // This allows Gemini to process the audio directly using its multimodal capabilities
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      },
      systemPrompt,
    ]);
    const text = result.response.text();
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    // Parse JSON
    const feedback = JSON.parse(jsonText);
    return speakingAIFeedbackSchema.parse(feedback) as SpeakingFeedbackDetailed; //return with validation feedback
  } catch (error) {
    console.error("Error generating AI feedback:", error);
  }
  return {
    overallScore: 0,
    fluencyCoherence: {
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
    pronunciation: {
      score: 0,
      comments: "Unable to generate detailed feedback at this time",
    },
    improvements: ["Unable to generate detailed feedback at this time"],
    strengths: ["Unable to generate detailed feedback at this time"],
  };
}
