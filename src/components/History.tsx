import React from 'react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

interface HistoryItem {
  id: string;
  timestamp: number;
  content: string;
}

interface HistoryProps {
  items: HistoryItem[];
  onSelect: (content: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const History: React.FC<HistoryProps> = ({ items, onSelect, onDelete, onClearAll }) => {
  const exportToPDF = (content: string) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 10, 10);
    doc.save(`ai-writer-${Date.now()}.pdf`);
  };

  const exportToText = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-writer-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Generation History</h2>
        <button
          onClick={onClearAll}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Clear All History
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500">
                {format(item.timestamp, 'MMM d, yyyy HH:mm')}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  title="Delete"
                >
                  <img width="20" height="20" className="sm:w-7 sm:h-7" src="https://img.icons8.com/fluency/48/filled-trash.png" alt="filled-trash"/>
                </button>
                <button
                  onClick={() => exportToPDF(item.content)}
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  title="Export as PDF"
                >
                  <img width="20" height="20" className="sm:w-7 sm:h-7" src="https://img.icons8.com/fluency/48/pdf--v1.png" alt="pdf--v1"/>
                </button>
                
                <button
                  onClick={() => exportToText(item.content)}
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  title="Export as Text"
                >
                  <img width="20" height="20" className="sm:w-7 sm:h-7" src="https://img.icons8.com/arcade/64/txt.png" alt="txt"/>
                </button>
              </div>
            </div>
            <p
              className="text-gray-700 cursor-pointer hover:text-blue-600"
              onClick={() => onSelect(item.content)}
            >
              {item.content.slice(0, 100)}
              {item.content.length > 100 ? '...' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History; 