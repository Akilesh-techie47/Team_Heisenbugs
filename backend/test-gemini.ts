import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

console.log("1. Test started");

dotenv.config();

console.log(
    "2. API key loaded:",
    process.env.GEMINI_API_KEY ? "YES" : "NO"
);

if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is missing");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
    console.log("3. Connecting to Gemini...");

    try {
        console.log("3.1 Sending request...");

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: "Reply with exactly: Gemini connection successful",
        });

        console.log("3.2 Request completed");

        console.log("4. Gemini response:");
        console.log(response.text);

    } catch (error) {
        console.error("5. Gemini ERROR:");
        console.error(error);
    }
}

console.log("6. Starting testGemini()...");

testGemini()
    .then(() => {
        console.log("7. Test finished");
    })
    .catch((error) => {
        console.error("8. Unexpected error:");
        console.error(error);
    });