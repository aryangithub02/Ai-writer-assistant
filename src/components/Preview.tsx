import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
// removed: import { jsPDF } from 'jspdf';
import MDEditor from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';

interface PreviewProps {
  content: string;
  onContentChange?: (newContent: string) => void;
}

const Preview: React.FC<PreviewProps> = ({ content, onContentChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [copyAlertMessage, setCopyAlertMessage] = useState('');

  useEffect(() => {
    setEditedContent(content);
    setIsEditing(false); // Reset editing state when content changes from parent
  }, [content]);

  const copyToClipboard = async () => {
    setCopyAlertMessage('Copying content...');
    setShowCopyAlert(true);

    try {
      await navigator.clipboard.writeText(content);
      setCopyAlertMessage('Content copied!');
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyAlertMessage('Failed to copy content');
    } finally {
      setTimeout(() => {
        setShowCopyAlert(false);
        setCopyAlertMessage('');
      }, 2000);
    }
  };

  const exportToPDF = async () => {
    setIsPdfLoading(true); // Start loading
    setShowDownloadAlert(true); // Show alert immediately

    try {
      const response = await fetch('http://localhost:5000/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdownContent: content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-writer-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Alert will remain visible and switch to success message in finally block

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to generate PDF. Please ensure the PDF server is running (run node server/index.js).');
    } finally {
      setIsPdfLoading(false); // Stop loading
      // Alert will automatically hide after 3 seconds from its initial show
    }
  };

  const exportToText = () => {
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

  const handleSave = () => {
    if (onContentChange) {
      onContentChange(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 relative">
      {showDownloadAlert && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 p-3 sm:p-4 mb-4 text-xs sm:text-sm rounded-lg flex items-center gap-2 ${isPdfLoading ? "bg-blue-50 text-blue-800 dark:bg-gray-800 dark:text-blue-400" : "bg-green-50 text-green-800 dark:bg-gray-800 dark:text-green-400"} max-w-[90vw]`} role="alert">
          <div className="flex items-center flex-grow">
            {
              isPdfLoading ? (
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="shrink-0 w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                </svg>
              )
            }
            <div>
              <span className="font-medium">
                {isPdfLoading ? 'Generating PDF...' : 'PDF Downloaded!'}
              </span> 
              {!isPdfLoading && ' Your file is ready.'}
            </div>
          </div>
          <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-200 inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-white" onClick={() => setShowDownloadAlert(false)} aria-label="Close">
            <span className="sr-only">Close</span>
            <svg className="w-2 h-2 sm:w-3 sm:h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
      )}
      {showCopyAlert && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 p-3 sm:p-4 mb-4 text-xs sm:text-sm rounded-lg flex items-center gap-2 ${copyAlertMessage === 'Content copied!' ? "bg-green-50 text-green-800 dark:bg-gray-800 dark:text-green-400" : "bg-blue-50 text-blue-800 dark:bg-gray-800 dark:text-blue-400"} max-w-[90vw]`} role="alert">
          <div className="flex items-center flex-grow">
            {copyAlertMessage === 'Copying content...' ? (
              <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="shrink-0 w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
            )}
            <div>
              <span className="font-medium">{copyAlertMessage}</span>
            </div>
          </div>
          <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-200 inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-white" onClick={() => setShowCopyAlert(false)} aria-label="Close">
            <span className="sr-only">Close</span>
            <svg className="w-2 h-2 sm:w-3 sm:h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Preview</h2>
          <div className="flex flex-wrap gap-2 sm:gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-2 sm:px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs sm:text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 sm:px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs sm:text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2 sm:px-3 py-1 text-white rounded hover:bg-blue-700 text-xs sm:text-sm transition-all duration-100 ease-in-out"
                  title="Edit Content"
                >
                  <img width="20" height="20" className="sm:w-6 sm:h-6" src="https://img.icons8.com/pulsar-color/48/edit.png" alt="edit"/>
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-2 sm:px-3 py-1 text-white rounded hover:bg-green-700 text-xs sm:text-sm flex items-center justify-center transition-all duration-100 ease-in-out"
                  title="Copy to Clipboard"
                >
                  <img width="20" height="20" className="sm:w-6 sm:h-6" src="https://img.icons8.com/dusk/64/copy.png" alt="copy"/>
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={isPdfLoading} // Disable button while loading
                  className="px-2 sm:px-3 py-1 text-white rounded hover:bg-red-700 text-xs sm:text-sm transition-all duration-100 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export as PDF"
                >
                  <img width="20" height="20" className="sm:w-6 sm:h-6" src="https://img.icons8.com/fluency/48/pdf--v2.png" alt="pdf--v2"/>
                </button>
                <button
                  onClick={exportToText}
                  className="px-2 sm:px-3 py-1 text-white rounded hover:bg-blue-700 text-xs sm:text-sm transition-all duration-100 ease-in-out"
                  title="Export as Text File"
                >
                  <img width="20" height="20" className="sm:w-6 sm:h-6" src="https://img.icons8.com/arcade/64/txt.png" alt="txt"/>
                </button>
              </>
            )}
          </div>
        </div>
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={8}
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black text-sm sm:text-base h-[300px] sm:h-[400px]"
          />
        ) : (
          <div className="h-[300px] sm:h-[400px] overflow-y-auto p-3 sm:p-4 border rounded-md bg-white">
            <div className="prose prose-indigo max-w-none text-sm sm:text-base
              [&_strong]:font-bold [&_strong]:text-gray-900 
              [&_ul]:list-disc [&_ul]:pl-4 sm:[&_ul]:pl-6 
              [&_ol]:list-decimal [&_ol]:pl-4 sm:[&_ol]:pl-6 
              [&_li]:my-1 
              [&_h1]:text-2xl sm:[&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:text-gray-900 [&_h1]:mb-4 sm:[&_h1]:mb-6 [&_h1]:border-b [&_h1]:border-gray-200 [&_h1]:pb-2
              [&_h2]:text-xl sm:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-3 sm:[&_h2]:mb-4 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-1
              [&_h3]:text-lg sm:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-700 [&_h3]:mb-2 sm:[&_h3]:mb-3
              [&_h4]:text-base sm:[&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-gray-700 [&_h4]:mb-2
              [&_h5]:text-sm sm:[&_h5]:text-lg [&_h5]:font-bold [&_h5]:text-gray-700 [&_h5]:mb-2
              [&_h6]:text-xs sm:[&_h6]:text-base [&_h6]:font-bold [&_h6]:text-gray-700 [&_h6]:mb-2
              [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 sm:[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600
              [&_p]:my-2
              [&_ul]:my-2
              [&_ol]:my-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview; 