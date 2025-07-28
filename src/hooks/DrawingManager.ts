// hooks/useDrawingManager.ts
import { useState, useCallback, useEffect } from 'react';
import { DrawingShape } from '../components/Drawing';

export const useDrawingManager = () => {
  const [drawings, setDrawings] = useState<DrawingShape[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Load drawings from memory storage on mount
  useEffect(() => {
    const savedDrawings = (window as any).drawingsCache;
    if (savedDrawings) {
      try {
        setDrawings(JSON.parse(savedDrawings));
      } catch (error) {
        console.error('Failed to parse saved drawings:', error);
      }
    }
  }, []);

  // Save drawings to memory storage whenever drawings change
  const saveDrawings = useCallback((newDrawings: DrawingShape[]) => {
    (window as any).drawingsCache = JSON.stringify(newDrawings);
  }, []);

  const addDrawing = useCallback((shape: DrawingShape) => {
    setDrawings(prev => {
      const newDrawings = [...prev, shape];
      saveDrawings(newDrawings);
      return newDrawings;
    });
  }, [saveDrawings]);

  const clearDrawings = useCallback(() => {
    setDrawings([]);
    delete (window as any).drawingsCache;
  }, []);

  const undoLastDrawing = useCallback(() => {
    setDrawings(prev => {
      if (prev.length === 0) return prev;
      const newDrawings = prev.slice(0, -1);
      saveDrawings(newDrawings);
      return newDrawings;
    });
  }, [saveDrawings]);

  const getDrawingsForPage = useCallback((page: number, panel: 'pdf' | 'html') => {
    return drawings.filter(d => d.page === page && d.panel === panel);
  }, [drawings]);

  const toggleDrawingMode = useCallback(() => {
    setIsDrawingMode(prev => !prev);
  }, []);

  return {
    drawings,
    isDrawingMode,
    addDrawing,
    clearDrawings,
    undoLastDrawing,
    getDrawingsForPage,
    toggleDrawingMode
  };
};