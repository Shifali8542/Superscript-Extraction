import React, { useState } from 'react';
import PDFViewer from './components/PDFViewer';
import HTMLViewer from './components/HTMLViewer';
import SuperscriptAnalyzer from './components/SuperscriptAnalyzer';
import { useScrollSync } from './hooks/useScrollSync';
import { useDrawingManager } from './hooks/DrawingManager';
import { Split, Link, Unlink, FileText, Eye, ChevronLeft, ChevronRight, Pencil, Undo, Trash2 } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [superscriptCount, setSuperscriptCount] = useState<number>(0);
  const [totalPages] = useState<number>(50);
  const [numPages, setNumPages] = useState<number>(50);

  const {
    pdfScrollTop,
    htmlScrollTop,
    syncEnabled,
    handlePdfScroll,
    handleHtmlScroll,
    toggleSync
  } = useScrollSync();

  const {
    drawings,
    isDrawingMode,
    addDrawing,
    clearDrawings,
    undoLastDrawing,
    toggleDrawingMode
  } = useDrawingManager();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSuperscriptCount = (count: number) => {
    setSuperscriptCount(count);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '') {
      setCurrentPage(NaN);
      return;
    }

    const numeric = parseInt(value, 10);
    if (!isNaN(numeric)) {
      setCurrentPage(numeric);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value;
      const numeric = parseInt(value, 10);
      
      if (!isNaN(numeric) && numeric >= 1 && numeric <= numPages) {
        setCurrentPage(numeric);
      } else {
        setCurrentPage(currentPage);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Left section - Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">PDF vs HTML Validator</h1>
            </div>
          </div>

          {/* Center section - Page Navigation */}
          <div className="flex items-center justify-center space-x-1 flex-1">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="p-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={isNaN(currentPage) ? '' : currentPage}
                onChange={handlePageInputChange}
                onKeyDown={handleKeyDown}
                min={1}
                max={numPages}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 text-center"
                placeholder="Page"
              />
              <span className="text-gray-300">/ {numPages}</span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              className="p-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Right section - Drawing and Sync controls */}
          <div className="flex items-center space-x-3">
            {/* Drawing Controls */}
            <div className="flex items-center space-x-2">
              {isDrawingMode && (
                <>
                  <button
                    onClick={undoLastDrawing}
                    className="p-2 rounded bg-yellow-600 hover:bg-yellow-700 transition-colors"
                    title="Undo last drawing"
                  >
                    <Undo className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={clearDrawings}
                    className="p-2 rounded bg-red-600 hover:bg-red-700 transition-colors"
                    title="Clear all drawings"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
              
              <button
                onClick={toggleDrawingMode}
                className={`p-2 rounded transition-colors ${
                  isDrawingMode 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                title={isDrawingMode ? 'Exit drawing mode' : 'Enter drawing mode'}
              >
                <Pencil className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Sync Control */}
            <div className="flex items-center">
              {syncEnabled ? <Link className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
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
            onNumPagesChange={setNumPages}
            // Drawing props
            isDrawingMode={isDrawingMode}
            drawings={drawings}
            onDrawingComplete={addDrawing}
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
            // Drawing props
            isDrawingMode={isDrawingMode}
            drawings={drawings}
            onDrawingComplete={addDrawing}
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