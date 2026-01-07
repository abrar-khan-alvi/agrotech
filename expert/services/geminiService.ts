import { GoogleGenAI } from "@google/genai";
import { IoTDataPoint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAdvisory = async (crop: string, location: string, iotData: IoTDataPoint[]) => {
  // Summarize data for the prompt to save tokens
  const recentData = iotData.slice(-5);
  const dataSummary = recentData.map(d => 
    `Time: ${d.time}, Moisture: ${d.moisture}%, Temp: ${d.temp}C`
  ).join('\n');

  const prompt = `
    You are an expert agricultural agronomist.
    Analyze the following recent IoT sensor data for a ${crop} field in ${location}.
    
    Recent Data:
    ${dataSummary}

    Provide a concise, 3-point advisory for the farmer. Focus on irrigation, potential disease risks based on temperature/moisture, and immediate actions.
    Keep the tone professional and actionable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate advisory at this time due to technical difficulties.";
  }
};

export const generateReportDraft = async (notes: string, diagnosis: string) => {
  const prompt = `
    Draft a professional formal agricultural consultation report based on the following:
    Diagnosis: ${diagnosis}
    Expert Notes: ${notes}
    
    Format nicely with Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error(error);
    return "Error generating draft.";
  }
};