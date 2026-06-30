import { useState, useCallback } from 'react';
import { useT } from '../../i18n';
import { buildShareUrl } from '../../playground/share';
import type { PlaygroundInput } from '../../playground/protocol';

interface Props {
  code: string;
  input: PlaygroundInput;
  onClose: () => void;
}

export function ShareDialog({ code, input, onClose }: Props) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const url = buildShareUrl(code, input);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the input text
      const el = document.getElementById('share-url-input') as HTMLInputElement | null;
      if (el) { el.select(); document.execCommand('copy'); }
    }
  }, [url]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="share-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="share-dialog-hd">
          <span>{t.playground.shareTitle}</span>
          <button className="btn" onClick={onClose}>✕</button>
        </div>
        <div className="share-dialog-body">
          <input id="share-url-input" className="data-input" value={url} readOnly onClick={(e) => (e.target as HTMLInputElement).select()} />
          <button className="btn primary" onClick={handleCopy}>
            {copied ? t.playground.copied : t.playground.copy}
          </button>
        </div>
      </div>
    </div>
  );
}
