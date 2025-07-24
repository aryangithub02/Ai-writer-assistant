import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import History from './components/History';
import { WritingType, Tone } from './types';
import { generateContent } from './services/ai';

interface HistoryItem {
  id: string;
  content: string;
  type: WritingType;
  tone: Tone;
  timestamp: number;
}

function App() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-writer-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (content: string, type: WritingType, tone: Tone) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      content,
      type,
      tone,
      timestamp: Date.now()
    };
    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    localStorage.setItem('ai-writer-history', JSON.stringify(newHistory));
  };

  const handleDeleteHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('ai-writer-history', JSON.stringify(newHistory));
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('ai-writer-history');
    }
  };

  const handleGenerate = async (content: string, type: WritingType, tone: Tone) => {
    setIsLoading(true);
    try {
      const generatedContent = await generateContent(content, type, tone);
      setContent(generatedContent);
      saveToHistory(generatedContent, type, tone);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (content: string) => {
    setContent(content);
    setShowHistory(false);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">AI Writing Assistant</h1>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-8">
            {showHistory ? (
              <History 
                items={history} 
                onSelect={handleHistorySelect}
                onDelete={handleDeleteHistory}
                onClearAll={handleClearAllHistory}
              />
            ) : (
              <>
                <Editor onGenerate={handleGenerate} isLoading={isLoading} />
                {content && !isLoading && <Preview content={content} onContentChange={handleContentChange} />}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
