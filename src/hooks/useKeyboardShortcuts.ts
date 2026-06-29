import { useEffect, useRef } from 'react';

interface ShortcutHandlers {
  togglePlay: () => void;
  stepBack: () => void;
  stepForward: () => void;
  toggleFocusMode: () => void;
  toggleShortcuts?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Space') { e.preventDefault(); ref.current.togglePlay(); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); ref.current.stepBack(); }
      else if (e.code === 'ArrowRight') { e.preventDefault(); ref.current.stepForward(); }
      else if (e.code === 'KeyF') { e.preventDefault(); ref.current.toggleFocusMode(); }
      else if (e.code === 'Slash' && e.shiftKey) { e.preventDefault(); ref.current.toggleShortcuts?.(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
