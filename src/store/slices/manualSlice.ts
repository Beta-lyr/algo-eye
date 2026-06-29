import { computeStats } from '../../lib/stats';
import type { VizState } from '../useVizStore';

export function createManualSlice(set: (partial: Partial<VizState>) => void, get: () => VizState): Partial<VizState> {
  return {
    manualMode: false,
    selectedIndices: [],
    hintMessage: '',

    toggleManualMode: () => {
      const { manualMode } = get();
      if (manualMode) {
        set({ manualMode: false, selectedIndices: [], hintMessage: '' });
      } else {
        set({ manualMode: true, selectedIndices: [], hintMessage: '', playing: false });
      }
    },

    selectIndex: (index: number) => {
      const { selectedIndices, steps, stepIndex, currentAlgo } = get();
      if (!currentAlgo || currentAlgo.dataKind !== 'array') return;

      const cur = new Set(selectedIndices);

      if (cur.has(index)) {
        cur.delete(index);
        set({ selectedIndices: [...cur], hintMessage: '' });
        return;
      }

      if (cur.size >= 2) {
        set({ selectedIndices: [index], hintMessage: '' });
        return;
      }

      cur.add(index);
      const sel = [...cur];

      if (sel.length < 2) {
        set({ selectedIndices: sel });
        return;
      }

      const step = steps[stepIndex];
      if (!step || !step.indices || step.indices.length < 2) {
        set({ selectedIndices: [], hintMessage: '@hint.noSelection' });
        return;
      }

      const sortedSel = [...sel].sort((a, b) => a - b);
      const sortedStep = [...step.indices].sort((a, b) => a - b);
      const match = sortedSel.length === sortedStep.length &&
        sortedSel.every((v, i) => v === sortedStep[i]);

      if (match) {
        if (stepIndex < steps.length - 1) {
          const newIndex = stepIndex + 1;
          const { compareCount, swapCount } = computeStats(steps, newIndex);
          set({
            stepIndex: newIndex,
            compareCount,
            swapCount,
            selectedIndices: [],
            hintMessage: newIndex >= steps.length - 1 ? '@hint.allDone' : '@hint.correct',
          });
        } else {
          set({ selectedIndices: [], hintMessage: '@hint.allDone' });
        }
      } else {
        set({
          selectedIndices: [],
          hintMessage: `@hint.wrong|${sortedStep.join(',')}`,
        });
      }
    },

    clearSelection: () => {
      set({ selectedIndices: [], hintMessage: '' });
    },
  };
}
