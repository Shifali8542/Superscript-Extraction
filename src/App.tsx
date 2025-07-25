import React, { useState } from 'react';
import PDFViewer from './components/PDFViewer';
import HTMLViewer from './components/HTMLViewer';
import SuperscriptAnalyzer from './components/SuperscriptAnalyzer';
import { useScrollSync } from './hooks/useScrollSync';
import { Split, Link, Unlink, FileText, Eye } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [superscriptCount, setSuperscriptCount] = useState<number>(0);
  const [totalPages] = useState<number>(50); // This should be dynamically determined

  const {
    pdfScrollTop,
    htmlScrollTop,
    syncEnabled,
    handlePdfScroll,
    handleHtmlScroll,
    toggleSync
  } = useScrollSync();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSuperscriptCount = (count: number) => {
    setSuperscriptCount(count);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-8">

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">PDF vs HTML Validator</h1>
            </div>
            <div className="h-6 w-px bg-gray-600"></div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Superscript Analysis</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSync}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${syncEnabled
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
            >
              {syncEnabled ? <Link className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
              <span className="text-sm">
                Scroll Sync {syncEnabled ? 'On' : 'Off'}
              </span>
            </button>

            <div className="flex items-center space-x-2 text-gray-300">
              <Split className="w-4 h-4" />
              <span className="text-sm">Split View</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex" style={{ width: '100%', height: '100%' }}>
        {/* PDF Panel */}
        <div
          className="border-r border-gray-700"
          style={{ width: '50%', height: '100%', minWidth: '50%', maxWidth: '50%' }}
        >
          <PDFViewer
            pdfFile="/sample.pdf"
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onScroll={handlePdfScroll}
            syncScrollTop={syncEnabled ? htmlScrollTop : undefined}
          />
        </div>

        {/* HTML Panel */}
        <div
          style={{ width: '50%', height: '100%', minWidth: '50%', maxWidth: '50%' }}
        >
          <HTMLViewer
            currentPage={currentPage}
            onScroll={handleHtmlScroll}
            syncScrollTop={syncEnabled ? pdfScrollTop : undefined}
            onSuperscriptCount={handleSuperscriptCount}
          />
        </div>
      </div>

      {/* Analysis Footer */}
      <SuperscriptAnalyzer
        currentPage={currentPage}
        superscriptCount={superscriptCount}
        totalPages={totalPages}
      />
    </div>
  );
}

export default App;