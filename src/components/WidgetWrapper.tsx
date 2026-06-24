import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GripHorizontal, X, Maximize2 } from 'lucide-react';

interface WidgetWrapperProps {
  id: string;
  title: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  w: number; // width in px
  h: number; // height in px
  zIndex: number;
  locked: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
  onClose: () => void;
  onFocus: () => void;
  themeClass?: string;
  key?: React.Key;
  children: React.ReactNode;
}

export default function WidgetWrapper({
  id,
  title,
  x,
  y,
  w,
  h,
  zIndex,
  locked,
  onMove,
  onResize,
  onClose,
  onFocus,
  themeClass,
  children
}: WidgetWrapperProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const widgetStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ w: 0, h: 0 });

  // Handle Drag Start
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (locked) return;
    onFocus();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    widgetStartPos.current = { x, y };

    // Prevent default scrolling on mobile when dragging
    if ('touches' in e) {
      e.stopPropagation();
    }
  };

  // Handle Resize Start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (locked) return;
    onFocus();
    e.stopPropagation();
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsResizing(true);
    dragStartPos.current = { x: clientX, y: clientY };
    resizeStartSize.current = { w, h };
  };

  // Drag and Resize Handlers
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging && !isResizing) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const parent = cardRef.current?.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const parentWidth = rect.width > 100 ? rect.width : window.innerWidth;
      const parentHeight = rect.height > 100 ? rect.height : window.innerHeight;

      if (isDragging) {
        const deltaX = clientX - dragStartPos.current.x;
        const deltaY = clientY - dragStartPos.current.y;

        // Convert delta px to percentages
        const deltaXPercent = (deltaX / parentWidth) * 100;
        const deltaYPercent = (deltaY / parentHeight) * 100;

        let newX = widgetStartPos.current.x + deltaXPercent;
        let newY = widgetStartPos.current.y + deltaYPercent;

        // Clamp inside parent container bounds (roughly 0 to 95)
        newX = Math.max(0, Math.min(100 - (w / parentWidth) * 100, newX));
        newY = Math.max(0, Math.min(100 - (h / parentHeight) * 100, newY));

        onMove(id, newX, newY);
      } else if (isResizing) {
        const deltaX = clientX - dragStartPos.current.x;
        const deltaY = clientY - dragStartPos.current.y;

        const newW = Math.max(220, Math.min(800, resizeStartSize.current.w + deltaX));
        const newH = Math.max(160, Math.min(600, resizeStartSize.current.h + deltaY));

        onResize(id, newW, newH);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing, x, y, w, h, id, onMove, onResize]);

  return (
    <motion.div
      ref={cardRef}
      id={`widget-${id}`}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}px`,
        height: `${h}px`,
        zIndex: zIndex,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={onFocus}
      className={`pointer-events-auto flex flex-col rounded-3xl border transition-shadow duration-300 overflow-hidden
        ${isDragging ? 'shadow-2xl scale-[1.01]' : 'shadow-2xl'}
        ${themeClass || 'bg-white/10 dark:bg-black/25 border-white/20 dark:border-white/10 backdrop-blur-md'}
        hover:border-white/40 dark:hover:border-white/20
      `}
    >
      {/* Widget Header */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={`flex items-center justify-between px-4 py-2.5 select-none border-b border-white/10 bg-white/5 dark:bg-black/10
          ${locked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
        `}
      >
        <div className="flex items-center gap-2 max-w-[80%]">
          {!locked && <GripHorizontal className="w-4 h-4 text-white/50 shrink-0" />}
          <span className="text-xs font-semibold tracking-wider uppercase text-white/90 truncate font-sans">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget Content Body */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {children}
      </div>

      {/* Resize Handle */}
      {!locked && (
        <div
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          className="absolute bottom-1 right-1 cursor-se-resize p-1 z-20 group"
        >
          <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-white/40 group-hover:border-white/80 transition-colors rounded-br-sm" />
        </div>
      )}
    </motion.div>
  );
}
