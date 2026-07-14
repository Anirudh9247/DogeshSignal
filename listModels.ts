import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

async function main() {
  try {
    const response = await ai.models.list();
    console.log("Response class:", response.constructor.name);
    
    // Try async iteration
    console.log("Trying async iteration:");
    let count = 0;
    for await (const model of response) {
      console.log(model.name);
      count++;
    }
    console.log("Async iteration finished. Total:", count);
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

main();
