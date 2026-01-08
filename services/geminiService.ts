
import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptionData, ProcessingOptions } from "../types";

/**
 * Enhanced utility to extract partial content from a growing JSON string.
 */
const extractPartialText = (jsonString: string): string => {
  try {
    const marker = '"originalText":';
    const index = jsonString.indexOf(marker);
    if (index === -1) return "";

    let start = index + marker.length;
    // Skip whitespaces, colons, and quotes
    while (start < jsonString.length && /[\s":]/.test(jsonString[start])) {
      start++;
    }

    let content = "";
    for (let i = start; i < jsonString.length; i++) {
      // Handle escaped quotes correctly
      if (jsonString[i] === '"' && jsonString[i - 1] !== '\\') break;
      content += jsonString[i];
    }
    
    return content
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\');
  } catch (e) {
    return "";
  }
};

const extractJson = (text: string) => {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
  return jsonMatch[1]?.trim() || text.trim();
};

export const processFile = async (
  fileBase64: string | null,
  mimeType: string,
  options: ProcessingOptions,
  onUpdate: (partialText: string, progress: number) => void,
  extractedText?: string
): Promise<TranscriptionData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isDocument = mimeType.includes('pdf') || 
                     mimeType.includes('officedocument') || 
                     mimeType.includes('msword') || 
                     mimeType.includes('text') ||
                     !!extractedText;

  // Optimized for maximum accuracy and verbatim fidelity
  const systemInstruction = `
    You are a Professional High-Fidelity Court Reporter and Analyst.
    Your absolute priority is 100% VERBATIM ACCURACY.
    
    ${isDocument ? `
    DOCUMENT ANALYSIS MODE:
    1. Extract ALL text exactly as it appears. Do not skip headers, footers, or fine print.
    2. Maintain the semantic flow of the document.
    ` : `
    MULTIMEDIA TRANSCRIPTION MODE:
    1. ZERO OMISSION POLICY: Do not summarize, paraphrase, or "clean up" the speaker's words in the 'originalText' field.
    2. DIARIZATION: Distinctly identify speakers based on vocal characteristics.
    3. TIMESTAMPS: Provide precise [MM:SS] markers for every speaker turn.
    4. Capture every word, including technical jargon, proper nouns, and identifiers.
    `}

    OUTPUT FORMAT:
    You MUST return a JSON object with these exact keys:
    {
      "originalText": "The complete, verbatim, unedited transcription or text extraction",
      "segments": [{"speaker": "Speaker Name", "timestamp": "00:00", "text": "Verbatim text"}],
      "summary": "A high-level professional executive briefing",
      "cleanedText": "A version with filler words removed and grammar polished",
      "translatedText": "Translation to the requested language"
    }

    CRITICAL: Provide the 'originalText' field FIRST in your JSON response to enable real-time UI streaming.
  `;

  const parts: any[] = [];
  if (extractedText) {
    parts.push({ text: `Source Content:\n${extractedText}` });
  } else if (fileBase64) {
    parts.push({ inlineData: { data: fileBase64, mimeType } });
  }

  parts.push({
    text: `Target: 100% Verbatim Accuracy. 
           Requested AI Enhancements: ${options.summarize ? 'Summary' : ''}, ${options.cleanText ? 'Grammar Polish' : ''}, ${options.translate ? `Translate to ${options.targetLanguage}` : ''}.`
  });

  onUpdate("", 5);

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      // Accuracy is prioritized over speed
      temperature: 0.1, 
      topP: 0.95,
    },
  });

  let fullResponseText = "";
  let currentProgress = 10;

  for await (const chunk of responseStream) {
    const chunkText = chunk.text;
    fullResponseText += chunkText;
    
    const partialText = extractPartialText(fullResponseText);
    
    // Smooth progress simulation based on chunk arrival
    currentProgress = Math.min(98, currentProgress + 1.5);
    onUpdate(partialText, Math.floor(currentProgress));
  }

  onUpdate("", 100);

  try {
    const cleanedJson = extractJson(fullResponseText);
    const parsed = JSON.parse(cleanedJson) as TranscriptionData;
    if (extractedText && !parsed.originalText) {
      parsed.originalText = extractedText;
    }
    return parsed;
  } catch (err) {
    console.error("JSON Parse Error:", err, "Raw:", fullResponseText);
    throw new Error("Accuracy verification failed. The model response was malformed. Please try again with a shorter clip.");
  }
};
