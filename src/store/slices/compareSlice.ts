import { algorithms, getAlgorithmById } from '../../algorithms';
import { computeStats } from '../../lib/stats';
import { safeGenerate } from './shared';
import type { VizState } from '../useVizStore';

export function createCompareSlice(set: (partial: Partial<VizState>) => void, get: () => VizState): Partial<VizState> {
  return {
    compareMode: false,
    compareAlgo: null,
    compareSteps: [],
    compareStepIndex: 0,
    compareCompareCount: 0,
    compareSwapCount: 0,

    toggleCompareMode: () => {
      const { compareMode, compareAlgo, data } = get();
      if (!compareMode) {
        if (!compareAlgo) {
          const firstAlgo = algorithms.find((a) => a.id !== get().currentAlgo?.id);
          if (firstAlgo) {
            const compareSteps = safeGenerate(set, get, firstAlgo, data);
            set({
              compareMode: true,
              compareAlgo: firstAlgo,
              compareSteps,
              compareStepIndex: 0,
              compareCompareCount: 0,
              compareSwapCount: 0,
            });
            return;
          }
        } else {
          const compareSteps = safeGenerate(set, get, compareAlgo, data);
          set({
            compareMode: true,
            compareSteps,
            compareStepIndex: 0,
            compareCompareCount: 0,
            compareSwapCount: 0,
          });
          return;
        }
      }
      set({ compareMode: !compareMode });
    },

    setCompareAlgo: (id: string) => {
      const algo = getAlgorithmById(id);
      if (!algo) return;
      const { data } = get();
      const compareSteps = safeGenerate(set, get, algo, data);
      set({
        compareAlgo: algo,
        compareSteps,
        compareStepIndex: 0,
        compareCompareCount: 0,
        compareSwapCount: 0,
      });
    },

    syncCompareStep: () => {
      const { compareSteps, compareStepIndex } = get();
      if (compareStepIndex >= compareSteps.length - 1) return;

      const newIndex = compareStepIndex + 1;
      const { compareCount: compareCompareCount, swapCount: compareSwapCount }
        = computeStats(compareSteps, newIndex);
      set({
        compareStepIndex: newIndex,
        compareCompareCount,
        compareSwapCount,
      });
    },
  };
}
