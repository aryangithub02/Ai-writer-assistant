import { generateContent } from './ai';

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
let pendingRequest: Promise<string> | null = null;

export const getSuggestion = async (text: string): Promise<string> => {
  const now = Date.now();
  
  // If there's a pending request, return it
  if (pendingRequest) {
    return pendingRequest;
  }

  // Check rate limiting
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    return '';
  }

  // Create new request
  pendingRequest = generateContent(
    `Continue this sentence: ${text}`,
    'suggestion',
    'formal'
  ).then((result) => {
    lastRequestTime = Date.now();
    pendingRequest = null;
    return result;
  });

  return pendingRequest;
}; 