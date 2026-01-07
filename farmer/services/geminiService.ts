import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || 'dummy_key'; 
const ai = new GoogleGenAI({ apiKey });

export const generateAgriAdvice = async (
  query: string,
  context: string = ''
): Promise<string> => {
  if (!process.env.API_KEY) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`(Simulated AI Response) প্রশ্ন: "${query}"। \n\nআপনার জমির বর্তমান অবস্থার উপর ভিত্তি করে, আমি পরামর্শ দিচ্ছি যে আপনি ইউরিয়া সারের ব্যবহার কমান। বিস্তারিত বিশ্লেষণের জন্য একজন বিশেষজ্ঞের সাথে কথা বলুন।`);
      }, 1500);
    });
  }

  try {
    const model = 'gemini-3-flash-preview';
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: `System Instruction: You are an agricultural expert assistant for a farmer in Bangladesh. 
      IMPORTANT: You must respond in the Bengali (Bangla) language. Keep the language simple and easy to understand for a rural farmer. Avoid technical jargon.
      
      CRITICAL: Use secular, neutral language. Do NOT use religious greetings (e.g., do not use Nomoshkar or Salam). Use "Swagotom" (Welcome) or "Hello" or start directly with the answer.
      
      Context Data:
      ${context}
      
      User Query: ${query}
      
      Provide a helpful, concise, and actionable response in Bangla.`,
    });

    return response.text || "দুঃখিত, আমি এখন উত্তর দিতে পারছি না।";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "নেটওয়ার্ক সমস্যা হচ্ছে। দয়া করে পরে আবার চেষ্টা করুন।";
  }
};