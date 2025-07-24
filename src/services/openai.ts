import { GoogleGenerativeAI } from '@google/generative-ai';
import { WritingType, Tone } from '../types';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

export const generateContent = async (
  content: string,
  type: WritingType,
  tone: Tone
): Promise<string> => {
  try {
    const prompt = `Write a ${tone} ${type} on the topic: "${content}"`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text() || 'No response generated';
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
}; 