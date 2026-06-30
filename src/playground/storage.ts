import type { PlaygroundInput } from './protocol';

export interface PlaygroundDraft {
  id: string;
  title: string;
  code: string;
  input: PlaygroundInput;
  updatedAt: number;
  createdAt: number;
}

const AUTOSAVE_KEY = 'algo-eye-pg-autosave';
const DRAFTS_KEY = 'algo-eye-pg-drafts';

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or other write error — silently ignore
  }
}

export function autoSaveDraft(draft: PlaygroundDraft): void {
  safeWrite(AUTOSAVE_KEY, draft);
}

export function loadAutoSaved(): PlaygroundDraft | null {
  return safeRead<PlaygroundDraft | null>(AUTOSAVE_KEY, null);
}

export function isAutoSaved(): boolean {
  try {
    return localStorage.getItem(AUTOSAVE_KEY) !== null;
  } catch {
    return false;
  }
}

export function clearAutoSave(): void {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch {
    // ignore
  }
}

export function saveDraft(draft: PlaygroundDraft): void {
  const drafts = safeRead<PlaygroundDraft[]>(DRAFTS_KEY, []);
  const idx = drafts.findIndex((d) => d.id === draft.id);
  if (idx >= 0) {
    drafts[idx] = draft;
  } else {
    drafts.push(draft);
  }
  safeWrite(DRAFTS_KEY, drafts);
}

export function loadDraft(id: string): PlaygroundDraft | null {
  const drafts = safeRead<PlaygroundDraft[]>(DRAFTS_KEY, []);
  return drafts.find((d) => d.id === id) ?? null;
}

export function listDrafts(): PlaygroundDraft[] {
  return safeRead<PlaygroundDraft[]>(DRAFTS_KEY, []);
}

export function deleteDraft(id: string): void {
  const drafts = safeRead<PlaygroundDraft[]>(DRAFTS_KEY, []);
  const filtered = drafts.filter((d) => d.id !== id);
  safeWrite(DRAFTS_KEY, filtered);
}
