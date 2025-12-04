

import { GoogleGenAI, Type, Part } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getAIAssistance = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Please set the API_KEY environment variable.";
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are an expert HR analyst and business consultant. Provide concise, actionable, and data-driven insights. Format your responses clearly using markdown for readability, including headers, lists, and bold text.",
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `An error occurred while fetching AI insights: ${error.message}`;
    }
    return "An unknown error occurred while fetching AI insights.";
  }
};


export const getAIPrediction = async <T>(contents: string | { parts: Part[] }, schema: any): Promise<T | { error: string }> => {
    if (!process.env.API_KEY) {
        return { error: "API Key not configured. Please set the API_KEY environment variable." };
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as T;
    } catch (error) {
        console.error("Error calling Gemini API for prediction:", error);
        if (error instanceof SyntaxError) {
             return { error: `Failed to parse JSON response from AI. The AI returned: ${error.message}` };
        }
        if (error instanceof Error) {
            return { error: `An error occurred while fetching AI prediction: ${error.message}` };
        }
        return { error: "An unknown error occurred while fetching AI prediction." };
    }
};