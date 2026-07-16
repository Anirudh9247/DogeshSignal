import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

async function testModel(modelName: string) {
  console.log(`Testing ${modelName}...`);
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Hello, reply with exactly the word 'SUCCESS' if you read this.",
    });
    console.log(`✅ Success with ${modelName}:`, response.text?.trim());
    return true;
  } catch (err: any) {
    console.log(`❌ Failed with ${modelName}:`, err.message || err);
    return false;
  }
}

async function main() {
  const models = [
    "gemini-3-pro-preview",
    "gemini-3-pro-image-preview",
    "gemini-3-pro-image",
    "gemini-2.5-pro",
    "gemini-2.5-pro-preview-tts"
  ];
  for (const m of models) {
    await testModel(m);
  }
}

main();
