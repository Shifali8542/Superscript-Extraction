// components/DrawingOverlay.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';

export interface DrawingShape {
  id: string;
  type: 'rectangle';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  page: number;
  panel: 'pdf' | 'html';
}

interface DrawingOverlayProps {
  isDrawingMode: boolean;
  currentPage: number;
  panel: 'pdf' | 'html';
  drawings: DrawingShape[];
  onDrawingComplete: (shape: DrawingShape) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const DrawingOverlay: React.FC<DrawingOverlayProps> = ({
  isDrawingMode,
  currentPage,
  panel,
  drawings,
  onDrawingComplete,
  containerRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<DrawingShape | null>(null);

  // Get container dimensions and position
  const getContainerBounds = useCallback(() => {
    if (!containerRef.current) return { width: 0, height: 0, offsetX: 0, offsetY: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      width: containerRef.current.scrollWidth,
      height: containerRef.current.scrollHeight,
      offsetX: rect.left,
      offsetY: rect.top
    };
  }, [containerRef]);

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bounds = getContainerBounds();
    canvas.width = bounds.width;
    canvas.height = bounds.height;
    
    // Redraw existing shapes
    redrawCanvas();
  }, [currentPage, drawings]);

  // Redraw all shapes on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing shapes for current page and panel
    const currentPageDrawings = drawings.filter(
      d => d.page === currentPage && d.panel === panel
    );

    currentPageDrawings.forEach(shape => {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 2;

      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;

      ctx.fillRect(shape.startX, shape.startY, width, height);
      ctx.strokeRect(shape.startX, shape.startY, width, height);
    });

    // Draw current rectangle being drawn
    if (currentRect) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 2;

      const width = currentRect.endX - currentRect.startX;
      const height = currentRect.endY - currentRect.startY;

      ctx.fillRect(currentRect.startX, currentRect.startY, width, height);
      ctx.strokeRect(currentRect.startX, currentRect.startY, width, height);
    }
  }, [drawings, currentPage, panel, currentRect]);

  // Redraw when dependencies change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getMousePosition = (e: MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return { x: 0, y: 0 };

    const bounds = getContainerBounds();
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width) + containerRef.current.scrollLeft,
      y: (e.clientY - rect.top) * (canvas.height / rect.height) + containerRef.current.scrollTop
    };
  };

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!isDrawingMode) return;
    
    e.preventDefault();
    const pos = getMousePosition(e);
    setStartPoint(pos);
    setIsDrawing(true);
    setCurrentRect({
      id: '',
      type: 'rectangle',
      startX: pos.x,
      startY: pos.y,
      endX: pos.x,
      endY: pos.y,
      page: currentPage,
      panel
    });
  }, [isDrawingMode, currentPage, panel]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDrawing || !startPoint) return;

    const pos = getMousePosition(e);
    setCurrentRect(prev => prev ? {
      ...prev,
      endX: pos.x,
      endY: pos.y
    } : null);
  }, [isDrawing, startPoint]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDrawing || !startPoint || !currentRect) return;

    const pos = getMousePosition(e);
    const finalShape: DrawingShape = {
      id: `${panel}-${currentPage}-${Date.now()}`,
      type: 'rectangle',
      startX: Math.min(startPoint.x, pos.x),
      startY: Math.min(startPoint.y, pos.y),
      endX: Math.max(startPoint.x, pos.x),
      endY: Math.max(startPoint.y, pos.y),
      page: currentPage,
      panel
    };

    // Only save if rectangle has meaningful size
    const width = Math.abs(finalShape.endX - finalShape.startX);
    const height = Math.abs(finalShape.endY - finalShape.startY);
    
    if (width > 5 && height > 5) {
      onDrawingComplete(finalShape);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  }, [isDrawing, startPoint, currentRect, currentPage, panel, onDrawingComplete]);

  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Update cursor style
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.cursor = isDrawingMode ? 'crosshair' : 'default';
  }, [isDrawingMode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto z-10"
      style={{
        display: isDrawingMode ? 'block' : 'none',
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default DrawingOverlay;