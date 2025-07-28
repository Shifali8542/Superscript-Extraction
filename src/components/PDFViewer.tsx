import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import DrawingOverlay, { DrawingShape } from './Drawing';
import '../styles/react-pdf/TextLayer.css';
import '../styles/react-pdf/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
  pdfFile: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
  syncScrollTop?: number;
  onNumPagesChange?: (numPages: number) => void;
  // Drawing props
  isDrawingMode?: boolean;
  drawings?: DrawingShape[];
  onDrawingComplete?: (shape: DrawingShape) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfFile,
  currentPage,
  onPageChange,
  onScroll,
  syncScrollTop,
  onNumPagesChange,
  isDrawingMode = false,
  drawings = [],
  onDrawingComplete
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(currentPage);
  const [scale, setScale] = useState<number>(2.5);
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
    if (onNumPagesChange) {
      onNumPagesChange(numPages);
    }
  };

  const handleScroll = useCallback(() => {
    if (containerRef.current && onScroll) {
      isUserScrolling.current = true;
      const { scrollTop, scrollHeight } = containerRef.current;
      onScroll(scrollTop, scrollHeight);

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
      {/* Simplified Toolbar - Only Zoom and Rotate Controls */}
      <div className="flex items-center justify-center py-6 px-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-center gap-2 bg-gray-700 rounded px-3 py-2">
          <button onClick={zoomOut} className="p-2 rounded bg-gray-600 hover:bg-gray-500 transition-colors">
            <ZoomOut className="w-5 h-5 text-white" />
          </button>

          <span className="text-gray-300 text-sm min-w-[3rem] text-center px-2">
            {Math.round(scale * 100)}%
          </span>

          <button onClick={zoomIn} className="p-2 rounded bg-gray-600 hover:bg-gray-500 transition-colors">
            <ZoomIn className="w-5 h-5 text-white" />
          </button>

          <button onClick={rotate} className="p-2 rounded bg-gray-600 hover:bg-gray-500 transition-colors">
            <RotateCw className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* PDF Container with Drawing Overlay */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-800 p-4 relative"
        onScroll={handleScroll}
        style={{ 
          pointerEvents: isDrawingMode ? 'none' : 'auto'
        }}
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-300">Loading PDF...</span>
          </div>
        )}

        <div className="flex justify-center relative">
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
            />
          </Document>
        </div>

        {/* Drawing Overlay */}
        {onDrawingComplete && (
          <DrawingOverlay
            isDrawingMode={isDrawingMode}
            currentPage={currentPage}
            panel="pdf"
            drawings={drawings}
            onDrawingComplete={onDrawingComplete}
            containerRef={containerRef}
          />
        )}
      </div>
    </div>
  );
};

export default PDFViewer;