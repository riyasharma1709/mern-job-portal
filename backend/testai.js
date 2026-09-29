import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

import { readFileSync } from 'fs';

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

async function test() {
  try {
    const filePart = fileToGenerativePart("dummy.pdf", "application/pdf");
    const result = await model.generateContent(["What does this PDF say?", filePart]);
    console.log(result.response.text());
  } catch(e) {
    console.error("ERROR", e.stack || e.message);
  }
}
test();
