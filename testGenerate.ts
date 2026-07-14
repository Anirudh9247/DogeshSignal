import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

async function testModel(modelName: string) {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Hello, say test.",
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
    "gemini-3.5-flash",
    "gemini-3-pro-preview",
    "gemini-3-flash-preview",
    "gemini-3.1-pro-preview",
    "gemini-3.1-flash-lite",
    "gemini-pro-latest",
    "gemini-flash-latest"
  ];
  for (const m of models) {
    await testModel(m);
  }
}

main();
