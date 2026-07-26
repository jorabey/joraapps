import { useRef, useCallback } from 'react';

const LONG_PRESS_MS = 480;
const MOVE_TOLERANCE = 10;

/**
 * useContextTrigger
 * Fires `onTrigger({ x, y })` on:
 *  - desktop: right-click (contextmenu)
 *  - touch: long-press (~480ms, cancelled if the finger moves too far)
 *  - plain tap/click still fires `onTap` (used to open the app)
 */
export function useContextTrigger({ onTrigger, onTap }) {
  const timerRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      onTrigger?.({ x: e.clientX, y: e.clientY });
    },
    [onTrigger]
  );

  const onPointerDown = useCallback(
    (e) => {
      if (e.pointerType === 'mouse') return; // mouse uses contextmenu
      firedRef.current = false;
      startRef.current = { x: e.clientX, y: e.clientY };
      clear();
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        onTrigger?.({ x: e.clientX, y: e.clientY });
      }, LONG_PRESS_MS);
    },
    [clear, onTrigger]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (e.pointerType === 'mouse') return;
      const dx = Math.abs(e.clientX - startRef.current.x);
      const dy = Math.abs(e.clientY - startRef.current.y);
      if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) clear();
    },
    [clear]
  );

  const onPointerUp = useCallback(
    (e) => {
      if (e.pointerType === 'mouse') return;
      clear();
    },
    [clear]
  );

  const onClick = useCallback(
    (e) => {
      if (firedRef.current) {
        // suppress the tap that follows a long-press trigger
        firedRef.current = false;
        e.preventDefault();
        return;
      }
      onTap?.(e);
    },
    [onTap]
  );

  return {
    onContextMenu,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onClick,
  };
}
