import React from 'react';
import { WritingType, Tone } from '../types';

interface HistoryItem {
  id: string;
  content: string;
  type: WritingType;
  tone: Tone;
  timestamp: number;
}

interface SidebarProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ history, onSelectHistory, onDeleteHistory }) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 h-screen overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">History</h2>
      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
            onClick={() => onSelectHistory(item)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.content.substring(0, 50)}...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {item.type}
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {item.tone}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteHistory(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 