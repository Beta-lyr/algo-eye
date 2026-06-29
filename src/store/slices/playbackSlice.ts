import { algorithms, getAlgorithmById } from '../../algorithms';
import { computeStats } from '../../lib/stats';
import { buildShareUrl, parseShareUrl } from '../../lib/shareUrl';
import { randomArray, rebuildSteps } from './shared';
import type { VizState } from '../useVizStore';

export function createPlaybackSlice(set: (partial: Partial<VizState>) => void, get: () => VizState): Partial<VizState> {
  return {
    algorithms,
    currentAlgo: null,
    data: randomArray(16),
    steps: [],
    stepIndex: 0,
    playing: false,
    speed: 4,
    compareCount: 0,
    swapCount: 0,
    focusMode: false,
    error: null,

    selectAlgorithm: (id: string) => {
      const algo = getAlgorithmById(id);
      if (!algo) return;
      const state = get();
      const data = algo.defaultData ?? state.data;
      rebuildSteps(set, get, algo, data, { currentAlgo: algo });
    },

    setData: (data: number[]) => {
      const { currentAlgo } = get();
      if (!currentAlgo) return;
      rebuildSteps(set, get, currentAlgo, data);
    },

    setStepIndex: (index: number) => {
      const { steps } = get();
      if (index < 0 || index >= steps.length) return;
      const { compareCount, swapCount } = computeStats(steps, index);
      set({ stepIndex: index, compareCount, swapCount });
    },

    setPlaying: (playing: boolean) => set({ playing }),

    setSpeed: (speed: number) => set({ speed: Math.max(1, Math.min(10, speed)) }),

    randomizeData: (count: number) => {
      const n = Math.max(4, Math.min(64, count));
      const { currentAlgo } = get();
      if (!currentAlgo) return;
      rebuildSteps(set, get, currentAlgo, randomArray(n));
    },

    reset: () => {
      const { currentAlgo, data } = get();
      if (!currentAlgo) return;
      rebuildSteps(set, get, currentAlgo, data);
    },

    toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),

    clearError: () => set({ error: null }),

    getShareUrl: () => {
      const { currentAlgo, data, stepIndex } = get();
      if (!currentAlgo) return '';
      return buildShareUrl(window.location.origin, currentAlgo.id, data, stepIndex);
    },

    loadFromUrl: () => {
      const parsed = parseShareUrl(window.location.search, window.location.pathname);
      if (!parsed) return false;

      const algo = getAlgorithmById(parsed.algoId);
      if (!algo) return false;

      const data = parsed.data.length > 0
        ? parsed.data
        : (algo.defaultData ?? []);

      if (data.length < 4 || data.length > 64) return false;

      rebuildSteps(set, get, algo, data);
      const state = get();
      const stepIndex = Math.min(parsed.stepIndex, state.steps.length - 1);
      set({ stepIndex: Math.max(0, stepIndex) });
      return true;
    },
  };
}
