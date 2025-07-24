import React, { useState, useEffect } from 'react';
import { WritingType, Tone } from '../types';
import ReactMarkdown from 'react-markdown';
import { generateContent } from '../services/ai';

interface EditorProps {
  onGenerate: (content: string, type: WritingType, tone: Tone) => void;
  isLoading: boolean;
}

const Editor: React.FC<EditorProps> = ({ onGenerate, isLoading }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<WritingType>('email');
  const [tone, setTone] = useState<Tone>('formal');
  const [isImproving, setIsImproving] = useState(false);
  const [showGenerationAlert, setShowGenerationAlert] = useState(false);
  const [generationAlertMessage, setGenerationAlertMessage] = useState('');

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const getImprovementPrompt = (content: string, type: WritingType, tone: Tone) => {
    let typeSpecificGuidance = '';
    
    switch (type) {
      case 'email':
        typeSpecificGuidance = `Consider the following for an email:
- Clear subject line and purpose
- Professional greeting and sign-off
- Structured paragraphs with clear points
- Call to action if needed
- Appropriate length for the context

Structure your response with:
1. H1 for the main subject/title of the email
2. Clear headings for each section
3. Bullet points for key information
4. Numbered lists for steps or sequences
5. Bold text for important points
6. Proper spacing between sections`;
        break;
      case 'blog':
        typeSpecificGuidance = `Consider the following for a blog post:
- Engaging headline and introduction
- Clear main points and subheadings
- Supporting examples or data
- Engaging conclusion
- SEO-friendly structure

Structure your response with:
1. H1 for main title
2. H2 for major sections
3. H3 for subsections
4. Bullet points for lists
5. Bold text for emphasis
6. Blockquotes for important quotes
7. Code blocks for technical content
8. Tables for structured data`;
        break;
      case 'story':
        typeSpecificGuidance = `Consider the following for a story:
- Compelling opening hook
- Character development
- Plot progression
- Setting and atmosphere
- Satisfying conclusion

Structure your response with:
1. Clear scene breaks
2. Dialogue formatting
3. Character descriptions in italics
4. Important plot points in bold
5. Timeline markers
6. Setting descriptions in blockquotes
7. Emotional beats highlighted`;
        break;
      default:
        typeSpecificGuidance = `Consider the following for your content:
- Clear purpose and goals
- Target audience
- Key points to cover
- Desired outcome
- Any specific requirements

Structure your response with:
1. Clear hierarchy of headings
2. Bullet points for lists
3. Numbered steps where needed
4. Bold text for emphasis
5. Blockquotes for important quotes
6. Tables for structured data
7. Code blocks for technical content`;
    }

    return `Improve this ${tone} ${type} prompt to be more detailed and effective. 
Current prompt: "${content}"

${typeSpecificGuidance}

Please enhance the prompt by:
1. Adding specific details and context
2. Clarifying the main purpose and goals
3. Including any necessary background information
4. Specifying the target audience
5. Adding any relevant constraints or requirements
6. Ensuring proper markdown formatting for better readability
7. Using appropriate heading levels (H1, H2, H3)
8. Implementing bullet points and numbered lists
9. Adding emphasis where needed (bold, italic)
10. Including blockquotes for important information

Provide ONLY the improved prompt in markdown format, without any additional descriptions or explanations.`;
  };

  const handleImprovePrompt = async () => {
    if (!content.trim()) return;
    
    setIsImproving(true);
    setGenerationAlertMessage('Improving prompt...');
    setShowGenerationAlert(true);

    try {
      const improvementPrompt = getImprovementPrompt(content, type, tone);
      const improvedPrompt = await generateContent(
        improvementPrompt,
        'suggestion',
        'professional'
      );
      
      // Filter out AI response lines and get only the content
      const lines = improvedPrompt.split('\n');
      const filteredLines = lines.filter(line => {
        const lowerLine = line.toLowerCase();
        return !(
          lowerLine.includes('here\'s') ||
          lowerLine.includes('here is') ||
          lowerLine.includes('based on your') ||
          lowerLine.includes('ready for you') ||
          lowerLine.includes('please find') ||
          lowerLine.includes('i\'ve created') ||
          lowerLine.includes('i have created') ||
          lowerLine.includes('draft') ||
          lowerLine.includes('customize') ||
          lowerLine.includes('specific details') ||
          lowerLine.includes('hope this helps') ||
          lowerLine.includes('let me know') ||
          lowerLine.includes('feel free to')
        );
      });

      // Find the first line that starts with a markdown element
      const contentStartIndex = filteredLines.findIndex(line => 
        line.startsWith('#') || 
        line.startsWith('-') || 
        line.startsWith('*') || 
        line.startsWith('1.') ||
        line.startsWith('>')
      );

      const cleanPrompt = contentStartIndex >= 0 
        ? filteredLines.slice(contentStartIndex).join('\n')
        : filteredLines.join('\n');

      setContent(cleanPrompt.trim());
    } catch (error) {
      console.error('Error improving prompt:', error);
      alert('Failed to improve prompt. Please try again.');
    } finally {
      setIsImproving(false);
      setShowGenerationAlert(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowGenerationAlert(true);
    setGenerationAlertMessage('Generating content...');
    onGenerate(content, type, tone);
    // The alert will be hidden when isLoading (passed via prop) becomes false
  };

  // Watch for changes in isLoading from parent and hide alert
  useEffect(() => {
    if (!isLoading && showGenerationAlert && generationAlertMessage === 'Generating content...') {
      setShowGenerationAlert(false);
    }
  }, [isLoading, showGenerationAlert, generationAlertMessage]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 relative">
      {showGenerationAlert && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 p-3 sm:p-4 mb-4 text-xs sm:text-sm rounded-lg flex items-center gap-2 bg-blue-50 text-blue-800 dark:bg-gray-800 dark:text-blue-400 max-w-[90vw]" role="alert">
          <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium">{generationAlertMessage}</span>
          <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-200 inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-white" onClick={() => setShowGenerationAlert(false)} aria-label="Close">
            <span className="sr-only">Close</span>
            <svg className="w-2 h-2 sm:w-3 sm:h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Writing Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as WritingType)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
              disabled={isLoading}
            >
              <option value="email">Email</option>
              <option value="blog">Blog Post</option>
              <option value="story">Story</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
              disabled={isLoading}
            >
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-1">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Your Text
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleImprovePrompt}
                  disabled={isImproving || !content.trim() || isLoading}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImproving ? 'Improving...' : 'Improve Prompt'}
                </button>
              </div>
            </div>
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={handleContentChange}
                placeholder="Type your prompt or text here..."
                rows={8}
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black text-sm sm:text-base"
                disabled={isLoading || isImproving}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !content.trim()}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>
    </div>
  );
};

export default Editor; 