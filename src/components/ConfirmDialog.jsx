import { useState, useRef } from 'react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="confirm-title">{title}</div>
        <div className="confirm-message">{message}</div>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="btn-danger" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export function SwipeableItem({ children, onEdit, onDelete }) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    swiping.current = true;
  };

  const handleTouchMove = (e) => {
    if (!swiping.current) return;
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    const clamped = Math.max(0, Math.min(140, diff));
    setOffset(clamped);
  };

  const handleTouchEnd = () => {
    swiping.current = false;
    if (offset > 70) {
      setOffset(140);
    } else {
      setOffset(0);
    }
  };

  const handleClose = () => setOffset(0);

  return (
    <div className="swipeable-wrapper">
      <div className="swipeable-actions" style={{ width: 140 }}>
        <button className="swipe-action edit" onClick={() => { handleClose(); onEdit?.(); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        </button>
        <button className="swipe-action delete" onClick={() => { handleClose(); onDelete?.(); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
      <div
        className="swipeable-content"
        style={{ transform: `translateX(-${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
