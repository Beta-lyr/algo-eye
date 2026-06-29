import { useRef, useState, useCallback } from 'react';
import { useVizStore } from '../../store/useVizStore';
import { useT } from '../../i18n';

export function BookmarkBar() {
  const steps = useVizStore((s) => s.steps);
  const stepIndex = useVizStore((s) => s.stepIndex);
  const bookmarks = useVizStore((s) => s.bookmarks);
  const setStepIndex = useVizStore((s) => s.setStepIndex);
  const toggleBookmark = useVizStore((s) => s.toggleBookmark);
  const updateBookmarkComment = useVizStore((s) => s.updateBookmarkComment);
  const exportBookmarksFn = useVizStore((s) => s.exportBookmarks);
  const t = useT();

  const progressRef = useRef<HTMLDivElement>(null);

  const seekStep = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = progressRef.current;
    if (!el || steps.length === 0) return;
    const rect = el.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (steps.length - 1));
    setStepIndex(Math.max(0, Math.min(steps.length - 1, idx)));
  }, [steps.length, setStepIndex]);

  const [editingBookmark, setEditingBookmark] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const handleExportBookmarks = useCallback(() => {
    const json = exportBookmarksFn();
    navigator.clipboard.writeText(json).then(() => {});
  }, [exportBookmarksFn]);

  const bmEntries = Object.entries(bookmarks)
    .map(([s, c]) => ({ step: Number(s), comment: c }))
    .sort((a, b) => a.step - b.step);

  const pct = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0;

  return (
    <>
      {steps.length > 1 && (
        <div className="progress-row">
          <div className="progress-bar" ref={progressRef} onClick={seekStep}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
            {Object.keys(bookmarks).length > 0 && (
              <div className="bookmark-marks">
                {bmEntries.map(({ step }) => (
                  <div
                    key={step}
                    className="bm-dot"
                    style={{ left: `${(step / (steps.length - 1)) * 100}%` }}
                    title={`Step ${step + 1}${bookmarks[step] ? ': ' + bookmarks[step] : ''}`}
                  />
                ))}
              </div>
            )}
          </div>
          <span className="progress-label">{stepIndex + 1}/{steps.length}</span>
          <button
            className="btn bm-btn"
            onClick={() => toggleBookmark(stepIndex)}
            title={bookmarks[stepIndex] !== undefined ? t.controls.bookmarkRemove : t.controls.bookmarkAdd}
            disabled={steps.length === 0}
          >
            {bookmarks[stepIndex] !== undefined ? '🔖' : '🏷️'}
          </button>
        </div>
      )}

      {bmEntries.length > 0 && (
        <div className="bookmark-list">
          {bmEntries.map(({ step, comment }) => (
            <div key={step} className="bm-item">
              <span className="bm-step" onClick={() => setStepIndex(step)}>
                #{step + 1}
              </span>
              {editingBookmark === step ? (
                <input
                  className="bm-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => { updateBookmarkComment(step, editText); setEditingBookmark(null); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { updateBookmarkComment(step, editText); setEditingBookmark(null); }
                    if (e.key === 'Escape') setEditingBookmark(null);
                  }}
                  autoFocus
                />
              ) : (
                <span className="bm-comment" onClick={() => { setEditingBookmark(step); setEditText(comment); }}>
                  {comment || t.controls.bookmarkPlaceholder}
                </span>
              )}
              <button className="btn bm-del" onClick={() => toggleBookmark(step)}>
                ✕
              </button>
            </div>
          ))}
          {bmEntries.length > 0 && (
            <button className="btn bm-export" onClick={handleExportBookmarks}>
              {t.controls.export}
            </button>
          )}
        </div>
      )}
    </>
  );
}
