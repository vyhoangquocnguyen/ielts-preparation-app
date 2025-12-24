// test-gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

console.log("🔑 API Key loaded:", process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    // Use current Gemini model (gemini-pro is deprecated)
    const modelName = "gemini-2.5-flash-lite";
    console.log(`🧪 Testing Gemini API with model: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello!");
    console.log("✅ Success! Response:");
    console.log(result.response.text());
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; statusText?: string };
    console.error("❌ Error:", err.message);
    if (err.status) {
      console.error(`Status: ${err.status} ${err.statusText}`);
    }
  }
}

test();
