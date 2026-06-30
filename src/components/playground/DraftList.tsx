import { useState, useEffect, useCallback } from 'react';
import { useT } from '../../i18n';
import { listDrafts, deleteDraft, loadAutoSaved, saveDraft, clearAutoSave } from '../../playground/storage';
import type { PlaygroundDraft } from '../../playground/storage';
import type { PlaygroundInput } from '../../playground/protocol';

interface Props {
  onLoadDraft: (draft: PlaygroundDraft) => void;
  currentCode: string;
  currentInput: PlaygroundInput;
}

export function DraftList({ onLoadDraft, currentCode, currentInput }: Props) {
  const t = useT();
  const [drafts, setDrafts] = useState<PlaygroundDraft[]>([]);
  const [autoSaved, setAutoSaved] = useState<PlaygroundDraft | null>(null);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');

  const refresh = useCallback(() => {
    setDrafts(listDrafts());
    setAutoSaved(loadAutoSaved());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSave = useCallback(() => {
    const title = saveTitle.trim() || `Draft ${new Date().toLocaleDateString()}`;
    const now = Date.now();
    saveDraft({ id: `draft-${now}`, title, code: currentCode, input: currentInput, createdAt: now, updatedAt: now });
    setShowSaveInput(false);
    setSaveTitle('');
    refresh();
  }, [saveTitle, currentCode, currentInput, refresh]);

  const handleDelete = useCallback((id: string) => {
    deleteDraft(id);
    refresh();
  }, [refresh]);

  const handleClearAuto = useCallback(() => {
    clearAutoSave();
    setAutoSaved(null);
  }, []);

  return (
    <div className="draft-list">
      <div className="pane-hd">{t.playground.drafts}</div>

      {autoSaved && (
        <div className="draft-item autosave">
          <div className="draft-info">
            <span className="draft-title">{t.playground.autoSaved}</span>
            <span className="draft-time">{new Date(autoSaved.updatedAt).toLocaleTimeString()}</span>
          </div>
          <div className="draft-actions">
            <button className="btn sm" onClick={() => onLoadDraft(autoSaved)}>{t.playground.restore}</button>
            <button className="btn sm" onClick={handleClearAuto}>✕</button>
          </div>
        </div>
      )}

      {drafts.map((d) => (
        <div key={d.id} className="draft-item">
          <div className="draft-info">
            <span className="draft-title">{d.title}</span>
            <span className="draft-time">{new Date(d.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="draft-actions">
            <button className="btn sm" onClick={() => onLoadDraft(d)}>{t.playground.load}</button>
            <button className="btn sm" onClick={() => handleDelete(d.id)}>✕</button>
          </div>
        </div>
      ))}

      <div className="draft-save-area">
        {showSaveInput ? (
          <div className="draft-save-row">
            <input
              className="data-input"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder={t.playground.draftPlaceholder}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            />
            <button className="btn sm" onClick={handleSave}>{t.playground.save}</button>
            <button className="btn sm" onClick={() => setShowSaveInput(false)}>✕</button>
          </div>
        ) : (
          <button className="btn sm" onClick={() => setShowSaveInput(true)}>+ {t.playground.saveDraft}</button>
        )}
      </div>
    </div>
  );
}
