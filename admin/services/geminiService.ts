import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAiReport = async (context: string, data: any): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Configuration Error: Missing API Key.";

  try {
    const prompt = `
      You are an expert agricultural and sustainability data analyst.
      Context: ${context}
      Data: ${JSON.stringify(data, null, 2)}
      
      Please provide a concise, professional summary and actionable insights based on this data. 
      Format the output with clear headings and bullet points. 
      Use Markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate AI report. Please try again later.";
  }
};

export const analyzeAdvisoryRequest = async (requestDescription: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Configuration Error.";

  try {
    const prompt = `
      You are an agricultural expert assistant.
      Analyze the following farmer's advisory request description:
      "${requestDescription}"

      Provide:
      1. A short summary of the core issue.
      2. Suggested immediate actions or advice (2-3 bullet points).
      3. Recommended specialization for the expert (e.g., Pest Control, Soil Health).
      
      Keep it brief.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing request.";
  }
};
