
import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptionData, ProcessingOptions } from "../types";

export const processFile = async (
  fileBase64: string | null,
  mimeType: string,
  options: ProcessingOptions,
  extractedText?: string
): Promise<TranscriptionData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isDocument = mimeType.includes('pdf') || 
                     mimeType.includes('officedocument') || 
                     mimeType.includes('msword') || 
                     mimeType.includes('text') ||
                     !!extractedText;

  let systemInstruction = "";

  if (isDocument) {
    systemInstruction = `
      You are an expert document analyst and editor.
      Your task is to process the provided content.
      1. Analyze the text content accurately.
      ${options.summarize ? "2. Provide a clear, professional summary of the contents." : ""}
      ${options.cleanText ? "3. Provide a 'Cleaned' version which performs a comprehensive grammar check, fixes typos, and improves clarity while maintaining the original tone." : ""}
      ${options.translate ? `4. Translate the content into ${options.targetLanguage}.` : ""}
      
      Return the response strictly as a JSON object matching the provided schema.
    `;
  } else {
    systemInstruction = `
      You are an expert transcriptionist and multimedia analyst.
      Your task is to transcribe the provided audio/video file accurately.
      1. Identify different speakers and label them (e.g., "Speaker 1", "Speaker 2").
      2. Provide precise timestamps for every significant turn in the conversation in MM:SS format.
      3. Ensure the transcription is verbatim unless "Clean Text" is requested.
      ${options.summarize ? "4. Provide a concise summary of the conversation, highlighting key points." : ""}
      ${options.translate ? `5. Translate the transcript into ${options.targetLanguage}, preserving speaker labels and timestamps.` : ""}
      ${options.cleanText ? "6. Provide a 'Cleaned' version where filler words are removed and grammar is polished." : ""}
      
      Return the response strictly as a JSON object matching the provided schema.
    `;
  }

  // Build parts dynamically. If we have extracted text (e.g. from Word), send it as text.
  // Otherwise, send as inlineData (for PDF, audio, video).
  const parts: any[] = [];
  
  if (extractedText) {
    parts.push({
      text: `Document Content to Analyze:\n\n${extractedText}`
    });
  } else if (fileBase64) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    });
  }

  parts.push({
    text: isDocument 
      ? "Please analyze this document content. Extract text, summarize, and check grammar as requested." 
      : "Please transcribe this multimedia file with speaker diarization and timestamps. Apply processing options."
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                timestamp: { type: Type.STRING },
                text: { type: Type.STRING },
              },
              required: ["speaker", "timestamp", "text"],
            },
          },
          summary: { type: Type.STRING },
          translatedText: { type: Type.STRING },
          cleanedText: { type: Type.STRING },
          originalText: { type: Type.STRING, description: "Full extracted text for documents" },
        },
        required: (!isDocument) ? ["segments"] : [],
      },
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error("No response received from the model.");
  }

  try {
    const parsed = JSON.parse(resultText) as TranscriptionData;
    // If it's a Word doc, we already have the text, but the AI might have extracted it better or formatted it
    if (extractedText && !parsed.originalText) {
      parsed.originalText = extractedText;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to parse Gemini JSON response:", err);
    throw new Error("The AI returned an invalid response format.");
  }
};
