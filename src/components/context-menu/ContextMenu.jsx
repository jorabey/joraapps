import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './context-menu.css';

export function ContextMenu({ open, pos, items, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Adjust position so the menu doesn't overflow the viewport
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const menuW = 200;
  const menuH = items.length * 46 + 8;
  let { x, y } = pos;
  if (x + menuW > vw - 8) x = vw - menuW - 8;
  if (y + menuH > vh - 8) y = vh - menuH - 8;
  if (x < 8) x = 8;
  if (y < 8) y = 8;

  return createPortal(
    <div className="ctx-backdrop">
      <div
        ref={ref}
        className="ctx-menu"
        role="menu"
        style={{ top: y, left: x }}
      >
        {items.map((item, i) =>
          item.divider ? (
            <div key={i} className="ctx-divider" />
          ) : (
            <button
              key={i}
              className={`ctx-item ${item.variant ? `ctx-item--${item.variant}` : ''}`}
              role="menuitem"
              onClick={() => {
                onClose();
                item.onClick?.();
              }}
            >
              {item.icon && <span className="ctx-item__icon">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          )
        )}
      </div>
    </div>,
    document.body
  );
}
