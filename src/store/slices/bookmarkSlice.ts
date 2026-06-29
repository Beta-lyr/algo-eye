import type { VizState } from '../useVizStore';

export function createBookmarkSlice(set: (partial: Partial<VizState>) => void, get: () => VizState): Partial<VizState> {
  return {
    bookmarks: {},

    toggleBookmark: (stepIndex: number) => {
      const { bookmarks } = get();
      if (bookmarks[stepIndex] !== undefined) {
        const next = { ...bookmarks };
        delete next[stepIndex];
        set({ bookmarks: next });
      } else {
        set({ bookmarks: { ...bookmarks, [stepIndex]: '' } });
      }
    },

    updateBookmarkComment: (stepIndex: number, comment: string) => {
      const { bookmarks } = get();
      if (bookmarks[stepIndex] === undefined) return;
      set({ bookmarks: { ...bookmarks, [stepIndex]: comment } });
    },

    exportBookmarks: () => {
      const { bookmarks, currentAlgo, data } = get();
      return JSON.stringify({ algorithm: currentAlgo?.id, data, bookmarks }, null, 2);
    },
  };
}
