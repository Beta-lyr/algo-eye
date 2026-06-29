import { isSorted, buildChallengeResult } from '../../lib/challenge';
import { dispatchAchievement } from '../../lib/achievementEvents';
import { randomArray, safeGenerate } from './shared';
import type { VizState } from '../useVizStore';

export function createChallengeSlice(set: (partial: Partial<VizState>) => void, get: () => VizState): Partial<VizState> {
  return {
    challengeActive: false,
    challengeData: [],
    challengeSwaps: 0,
    challengeStartTime: 0,
    challengeResult: null,

    startChallenge: () => {
      const { currentAlgo } = get();
      if (!currentAlgo || currentAlgo.dataKind !== 'array') return;
      const challengeData = randomArray(16);
      const steps = safeGenerate(set, get, currentAlgo, challengeData);
      const algoSwaps = steps.filter((s) => s.type === 'swap').length;
      const algoCompares = steps.filter((s) => s.type === 'compare').length;

      set({
        challengeActive: true,
        challengeData: [...challengeData],
        challengeSwaps: 0,
        challengeStartTime: performance.now(),
        challengeResult: buildChallengeResult(0, 0, algoSwaps, algoCompares),
        data: challengeData,
        steps: [],
        stepIndex: 0,
        playing: false,
        compareCount: 0,
        swapCount: 0,
        selectedIndices: [],
        hintMessage: '',
      });
    },

    challengeSwap: (i: number, j: number) => {
      const { challengeData, challengeSwaps } = get();
      const next = [...challengeData];
      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
      const newSwaps = challengeSwaps + 1;

      const sorted = isSorted(next);
      const elapsed = performance.now() - get().challengeStartTime;
      const result = buildChallengeResult(newSwaps, elapsed, get().challengeResult?.algoSwaps ?? 0, get().challengeResult?.algoCompares ?? 0);

      set({
        challengeData: next,
        data: next,
        challengeSwaps: newSwaps,
        challengeResult: result,
      });

      if (sorted) {
        set({ challengeActive: false });
        dispatchAchievement('speed-runner');
      }
    },

    endChallenge: () => {
      set({ challengeActive: false });
    },
  };
}
