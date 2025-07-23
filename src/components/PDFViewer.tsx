import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import '../styles/react-pdf/TextLayer.css';
import '../styles/react-pdf/AnnotationLayer.css';

// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';


interface PDFViewerProps {
  pdfFile: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
  syncScrollTop?: number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfFile,
  currentPage,
  onPageChange,
  onScroll,
  syncScrollTop
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(currentPage);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef<boolean>(false);

  useEffect(() => {
    setPageNumber(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (syncScrollTop !== undefined && !isUserScrolling.current && containerRef.current) {
      containerRef.current.scrollTop = syncScrollTop;
    }
  }, [syncScrollTop]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      onPageChange(newPage);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      onPageChange(newPage);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= numPages) {
      setPageNumber(value);
      onPageChange(value);
    }
  };

  const handleScroll = useCallback(() => {
    if (containerRef.current && onScroll) {
      isUserScrolling.current = true;
      const { scrollTop, scrollHeight } = containerRef.current;
      onScroll(scrollTop, scrollHeight);
      
      // Reset user scrolling flag after a delay
      setTimeout(() => {
        isUserScrolling.current = false;
      }, 100);
    }
  }, [onScroll]);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={pageNumber}
              onChange={handlePageInputChange}
              min={1}
              max={numPages}
              className="w-16 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 text-center"
            />
            <span className="text-gray-300">/ {numPages}</span>
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          
          <span className="text-gray-300 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          
          <button
            onClick={rotate}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <RotateCw className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-800 p-4"
        onScroll={handleScroll}
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-300">Loading PDF...</span>
          </div>
        )}
        
        <div className="flex justify-center">
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            loading=""
            className="shadow-lg"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              className="border border-gray-600 bg-white"
              // renderTextLayer={true}
              // renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;