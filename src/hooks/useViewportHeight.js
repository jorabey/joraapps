import { useEffect } from 'react';

/**
 * useViewportHeight
 * Mobile browsers don't shrink `100vh` / `position: fixed` layouts when
 * the on-screen keyboard opens — the keyboard just covers the bottom of
 * the fixed-height app, hiding whatever input the user just focused.
 *
 * This hook uses the VisualViewport API (supported on iOS Safari 13+ and
 * all modern Android browsers) to track the *actual* visible height and
 * writes it to `--app-vh` on the root element. Combined with `height:
 * var(--app-vh, 100vh)` on the shell (see tokens.css), the whole app
 * shrinks to fit above the keyboard instead of being covered by it.
 *
 * It also nudges the currently focused input into view, since some
 * Android WebViews resize the viewport but don't auto-scroll.
 */
export function useViewportHeight() {
  useEffect(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;

    const setHeight = () => {
      const h = vv ? vv.height : window.innerHeight;
      root.style.setProperty('--app-vh', `${h}px`);
      // Keyboard "intrusion" amount — useful for components that want to
      // add bottom padding instead of relying purely on shrinking height.
      const keyboardInset = Math.max(0, window.innerHeight - h);
      root.style.setProperty('--keyboard-inset', `${keyboardInset}px`);
    };

    setHeight();

    if (vv) {
      vv.addEventListener('resize', setHeight);
      vv.addEventListener('scroll', setHeight);
    } else {
      window.addEventListener('resize', setHeight);
    }

    // When an input/textarea gains focus, scroll it into view after the
    // keyboard animation settles. Without this, on some Android browsers
    // the focused field can still end up just behind the keyboard edge.
    const onFocusIn = (e) => {
      const el = e.target;
      if (!el) return;
      const tag = el.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !el.isContentEditable) return;

      setTimeout(() => {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 250);
    };

    document.addEventListener('focusin', onFocusIn);

    return () => {
      if (vv) {
        vv.removeEventListener('resize', setHeight);
        vv.removeEventListener('scroll', setHeight);
      } else {
        window.removeEventListener('resize', setHeight);
      }
      document.removeEventListener('focusin', onFocusIn);
    };
  }, []);
}
