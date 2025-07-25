import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Search, HighlighterIcon } from 'lucide-react';

interface HTMLViewerProps {
  currentPage: number;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
  syncScrollTop?: number;
  onSuperscriptCount?: (count: number) => void;
}

interface SuperscriptInfo {
  element: HTMLElement;
  text: string;
  position: { top: number; left: number };
}

const HTMLViewer: React.FC<HTMLViewerProps> = ({
  currentPage,
  onScroll,
  syncScrollTop,
  onSuperscriptCount
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [superscripts, setSuperscripts] = useState<SuperscriptInfo[]>([]);
  const [highlightedCount, setHighlightedCount] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef<boolean>(false);

  // Scroll Sync Listener
  useEffect(() => {
    if (syncScrollTop !== undefined && !isUserScrolling.current && containerRef.current) {
      containerRef.current.scrollTop = syncScrollTop;
    }
  }, [syncScrollTop]);

  const detectSuperscripts = useCallback((content: string): SuperscriptInfo[] => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    const superscriptElements = tempDiv.querySelectorAll('sup, .superscript, [style*="vertical-align: super"]');
    const superscriptInfo: SuperscriptInfo[] = [];

    superscriptElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        superscriptInfo.push({
          element: element.cloneNode(true) as HTMLElement,
          text: element.textContent || '',
          position: { top: 0, left: 0 }
        });
      }
    });

    return superscriptInfo;
  }, []);

  const highlightSuperscripts = useCallback((content: string): string => {
    let highlightedContent = content;

    // Highlight <sup> tags with a very light, semi-transparent background
    highlightedContent = highlightedContent.replace(
      /<sup([^>]*)>/gi,
      '<sup$1 style="background-color: rgba(255, 0, 0, 0.3); border: 2px solid rgba(255, 0, 0, 0.8); border-radius: 6px; padding: 3px 6px; margin: 0 3px; box-shadow: 0 0 8px rgba(255, 0, 0, 0.5); font-weight: bold;">'
    );

    // Highlight elements with superscript class
    highlightedContent = highlightedContent.replace(
      /class="([^"]*\s)?superscript(\s[^"]*)?"([^>]*>)/gi,
      'class="$1superscript$2" style="background-color: rgba(255, 0, 0, 0.3); border: 2px solid rgba(255, 0, 0, 0.8); border-radius: 6px; padding: 3px 6px; margin: 0 3px; box-shadow: 0 0 8px rgba(255, 0, 0, 0.5); font-weight: bold;"$3'
    );

    // Highlight inline superscript styles
    highlightedContent = highlightedContent.replace(
      /style="([^"]*vertical-align:\s*super[^"]*)"([^>]*>)/gi,
      'style="$1; background-color: rgba(255, 0, 0, 0.3); border: 2px solid rgba(255, 0, 0, 0.8); border-radius: 6px; padding: 3px 6px; margin: 0 3px; box-shadow: 0 0 8px rgba(255, 0, 0, 0.5); font-weight: bold;2'
    );

    return highlightedContent;
  }, []);

  // Function to inject CSS to override any existing styles

  const injectOverrideCSS = useCallback((content: string): string => {
    const overrideCSS = `
    <style>
      /* Override any centering styles in the HTML */
      body, html, * {
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }
      
      /* Force full width for all elements and prevent overflow */
      body, html, div, table, p, span {
        width: 100% !important;
        max-width: 100% !important;
        text-align: left !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        overflow-wrap: break-word !important;
        word-wrap: break-word !important;
      }
      
      /* Fix table overflow issues */
      table {
        width: 100% !important;
        margin: 0 !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
      }
      
      /* Ensure table cells don't overflow */
      td, th {
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        max-width: 0 !important;
        overflow: hidden !important;
      }
        /* Increase font size for table content */
      table, td, th {
      font-size: 20px !important;
      }
      
      /* Override any wrapper or container divs */
      div[style*="width"], div[style*="max-width"], div[style*="margin"] {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
      
      /* Ensure content takes full space without overflow */
      .content, .main, .wrapper, .container {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;
      }
    </style>
  `;

    return overrideCSS + content;
  }, []);

  // Load HTML on Page Change
  useEffect(() => {
    const loadHTML = async () => {
      setLoading(true);
      setError('');

      try {
        const pageNumberStr = String(currentPage).padStart(3, '0');
        const response = await fetch(`/html_output/complex_tables_all_${pageNumberStr}.html`);

        if (!response.ok) {
          throw new Error(`Failed to load complex_tables_all_${pageNumberStr}.html`);
        }

        let content = await response.text();

        // Inject override CSS first
        content = injectOverrideCSS(content);

        const detectedSuperscripts = detectSuperscripts(content);
        const highlightedContent = highlightSuperscripts(content);

        setHtmlContent(highlightedContent);
        setSuperscripts(detectedSuperscripts);
        setHighlightedCount(detectedSuperscripts.length);

        if (onSuperscriptCount) {
          onSuperscriptCount(detectedSuperscripts.length);
        }
      } catch (err) {
        setError(`Could not load HTML content for page ${currentPage}`);
        setHtmlContent('');
        setSuperscripts([]);
        setHighlightedCount(0);

        if (onSuperscriptCount) {
          onSuperscriptCount(0);
        }
      }

      setLoading(false);
    };

    loadHTML();
  }, [currentPage, detectSuperscripts, highlightSuperscripts, onSuperscriptCount, injectOverrideCSS]);

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

  // Apply additional CSS overrides after content is loaded(unwanted styles (like margins or centered text) are removed after rendering.)
  useEffect(() => {
    if (contentRef.current && htmlContent) {
      const allElements = contentRef.current.querySelectorAll('*');
      allElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        // Force remove any centering styles
        htmlElement.style.setProperty('margin-left', '0', 'important');
        htmlElement.style.setProperty('margin-right', '0', 'important');
        htmlElement.style.setProperty('text-align', 'left', 'important');
        htmlElement.style.setProperty('width', '100%', 'important');
        htmlElement.style.setProperty('max-width', 'none', 'important');
      });
    }
  }, [htmlContent]);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">HTML Output</span>
          <span className="text-gray-400">Page {currentPage}</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-orange-500/20 px-3 py-1 rounded-full">
            <HighlighterIcon className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 font-medium">
              {highlightedCount} superscript{highlightedCount !== 1 ? 's' : ''}
            </span>
          </div>

          {superscripts.length > 0 && (
            <div className="flex items-center space-x-2 text-green-400">
              {/* <Search className="w-4 h-4" /> */}
              {/* <span className="text-sm">Highlighted</span> */}
            </div>
          )}
        </div>
      </div>

      {/* HTML Content Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-white"
        onScroll={handleScroll}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {loading && (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-700">Loading HTML content...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-center p-8">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">HTML File Not Found</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <p className="text-sm text-gray-400">
              Make sure the HTML files are located in the <code className="bg-gray-200 px-2 py-1 rounded">/public/html_output/</code> directory
            </p>
          </div>
        )}

        {!loading && !error && htmlContent && (
          <div
            ref={contentRef}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '100%',
              padding: '40px',
              margin: '0',
              lineHeight: '1.7',
              fontSize: '25px',
              fontFamily: 'Georgia, serif',
              backgroundColor: 'white',
              color: 'black',
              textAlign: 'left',
              boxSizing: 'border-box',
              overflowX: 'hidden',
              maxWidth: '100%',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>
    </div>
  );
};

export default HTMLViewer;