import { GoogleGenerativeAI } from '@google/generative-ai';
import { WritingType, Tone } from '../types';

// Ensure API key is available
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('Missing Gemini API Key. Please set REACT_APP_GEMINI_API_KEY in your .env file.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// System prompts for different writing types
const SYSTEM_PROMPTS = {
  email: (tone: Tone) => `You are an assistant helping write a ${tone} email. 
    Focus on clear communication, appropriate tone, and professional structure.
    Include a proper greeting and sign-off.`,
  
  blog: (tone: Tone) => `You are a professional content writer creating a ${tone} blog post.
    Focus on engaging content, proper structure with headings, and maintaining reader interest.
    Include an introduction, main points, and conclusion.`,
  
  story: (tone: Tone) => `You are a creative writer crafting a ${tone} story.
    Focus on narrative flow, character development, and engaging plot elements.
    Create an immersive experience for the reader.`,

  suggestion: (tone: Tone) => `You are an AI writing assistant helping complete sentences.
    Provide natural, contextually appropriate continuations that maintain the original style and tone.
    Keep suggestions concise and relevant to the existing text.`
};

export const generateContent = async (
  content: string,
  type: WritingType,
  tone: Tone
): Promise<string> => {
  try {
    const systemPrompt = SYSTEM_PROMPTS[type](tone);
    const userPrompt = `Write about: "${content}"`;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Combine system and user prompts
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = await response.text();

    return text.trim() || '⚠️ No content was generated.';
  } catch (error: any) {
    console.error('❌ AI generation error:', error.message || error);
    return '⚠️ Failed to generate content. Please try again.';
  }
};
