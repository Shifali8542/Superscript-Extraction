import { useState, useCallback, useRef } from 'react';

export const useScrollSync = () => {
  const [pdfScrollTop, setPdfScrollTop] = useState<number>(0);
  const [htmlScrollTop, setHtmlScrollTop] = useState<number>(0);
  const [syncEnabled, setSyncEnabled] = useState<boolean>(true);
  
  const lastPdfScroll = useRef<number>(0);
  const lastHtmlScroll = useRef<number>(0);

  const handlePdfScroll = useCallback((scrollTop: number, scrollHeight: number) => {
    if (!syncEnabled) return;
    
    lastPdfScroll.current = scrollTop;
    setPdfScrollTop(scrollTop);
    
    // Calculate relative scroll position and apply to HTML
    const scrollRatio = scrollTop / (scrollHeight - window.innerHeight);
    const htmlScrollTop = scrollRatio * (scrollHeight - window.innerHeight);
    
    if (Math.abs(htmlScrollTop - lastHtmlScroll.current) > 10) {
      setHtmlScrollTop(htmlScrollTop);
      lastHtmlScroll.current = htmlScrollTop;
    }
  }, [syncEnabled]);

  const handleHtmlScroll = useCallback((scrollTop: number, scrollHeight: number) => {
    if (!syncEnabled) return;
    
    lastHtmlScroll.current = scrollTop;
    setHtmlScrollTop(scrollTop);
    
    // Calculate relative scroll position and apply to PDF
    const scrollRatio = scrollTop / (scrollHeight - window.innerHeight);
    const pdfScrollTop = scrollRatio * (scrollHeight - window.innerHeight);
    
    if (Math.abs(pdfScrollTop - lastPdfScroll.current) > 10) {
      setPdfScrollTop(pdfScrollTop);
      lastPdfScroll.current = pdfScrollTop;
    }
  }, [syncEnabled]);

  const toggleSync = useCallback(() => {
    setSyncEnabled(prev => !prev);
  }, []);

  return {
    pdfScrollTop,
    htmlScrollTop,
    syncEnabled,
    handlePdfScroll,
    handleHtmlScroll,
    toggleSync
  };
};