
import { GoogleGenAI } from "@google/genai";
import { Learner } from "./types";

const getAI = () => {
  const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("No Gemini API key found. Please select an API key in the Secrets panel or ensure GEMINI_API_KEY is set.");
  }
  return new GoogleGenAI({ apiKey: key });
};

// System Context extracted from the provided PDF OCR
const EMIS_CONTEXT = `
You are the EMIS Intelligence Assistant for the Ministry of Education and Sports, Malawi (TDC Information System).
Your knowledge base includes:
- EMIS: Education Management Information System
- LIN: Learner Identification Number (Auto-generated unique ID)
- NIN: National Identification Number (Required for validation)
- NIRA: National Identification and Registration Authority
- MoES: Ministry of Education and Sports
- Pre-Primary Version: Specifically for Daycare, Baby, Middle, and Top classes.

Administrative Steps:
1. Registration requires NIN validation for contact persons.
2. Learners are registered either 'With NIN' or 'Without NIN' (refugees/foreigners).
3. Transfers require a 'Transfer Reason' and Parent NIN validation.
4. Support staff and teachers must be added via the 'Human Resource' module.
`;

// Upgraded to gemini-3.1-pro-preview as reasoning about EMIS regulations and records is a complex task.
export const chatWithSystem = async (query: string, records: Learner[]) => {
  const context = JSON.stringify(records.slice(0, 5));

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `User Query: ${query}\n\nLocal Record Context (Current Learners): ${context}`,
      config: {
        systemInstruction: EMIS_CONTEXT,
        thinkingConfig: { thinkingBudget: 4096 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Generation error:", error);
    return "I am currently processing system data. Please try again or check the manual.";
  }
};

// analyzeData remains on gemini-3-flash-preview as summarization is a basic text task.
export const analyzeData = async (records: Learner[]) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a quick summary of this school's registration status based on these records: ${JSON.stringify(records)}`,
      config: {
        systemInstruction: EMIS_CONTEXT + " Be very brief, maximum 2 sentences.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis error:", error);
    return "Analysis unavailable offline.";
  }
};
