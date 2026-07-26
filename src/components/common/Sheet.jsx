import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from './icons';
import './sheet.css';

export function Sheet({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="sheet-backdrop" onMouseDown={onClose}>
      <div
        className={`sheet sheet--${size}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sheet__grip" />
        {title && (
          <div className="sheet__header">
            <h3 className="sheet__title heading">{title}</h3>
            <button className="sheet__close" onClick={onClose} aria-label="Close">
              <IconClose width={18} height={18} />
            </button>
          </div>
        )}
        <div className="sheet__body">{children}</div>
        {footer && <div className="sheet__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
