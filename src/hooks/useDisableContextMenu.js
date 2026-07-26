import { useEffect } from 'react';

/**
 * useDisableContextMenu
 * Suppresses the browser's native context menu (long-press callout on
 * mobile, right-click menu on desktop) everywhere in the app EXCEPT on
 * elements that opt in via [data-allow-context-menu] (used by AppCard's
 * own custom context menu trigger and by text inputs, where the native
 * copy/paste callout is actually wanted).
 *
 * This is what makes "long-press to select / copy this text" or
 * "right-click > Save Image As" disappear, which a real installed app
 * would never show.
 */
export function useDisableContextMenu() {
  useEffect(() => {
    const isExempt = (el) => {
      while (el) {
        if (el.dataset && el.dataset.allowContextMenu !== undefined) return true;
        const tag = el.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable) return true;
        el = el.parentElement;
      }
      return false;
    };

    const onContextMenu = (e) => {
      if (isExempt(e.target)) return;
      e.preventDefault();
    };

    document.addEventListener('contextmenu', onContextMenu);
    return () => document.removeEventListener('contextmenu', onContextMenu);
  }, []);
}
