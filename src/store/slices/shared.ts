import type { Algorithm } from '../../algorithms/types';
import type { Step } from '../../engine/types';
import type { VizState } from '../useVizStore';

export function randomArray(count: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(Math.floor(Math.random() * 99) + 1);
  }
  return arr;
}

export function safeGenerate(
  set: (partial: Partial<VizState>) => void,
  get: () => VizState,
  algo: Algorithm,
  data: number[],
): Step[] {
  try {
    const steps = Array.from(algo.generate(data));
    if (get().error) set({ error: null });
    return steps;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    set({ error: `算法「${algo.name}」执行失败: ${msg}`, steps: [], stepIndex: 0, playing: false });
    return [];
  }
}

export function rebuildSteps(
  set: (partial: Partial<VizState>) => void,
  get: () => VizState,
  algo: Algorithm,
  data: number[],
  extraUpdates?: Partial<VizState>,
) {
  const steps = safeGenerate(set, get, algo, data);
  const state = get();
  const updates: Record<string, any> = {
    data,
    steps,
    stepIndex: 0,
    playing: false,
    compareCount: 0,
    swapCount: 0,
    selectedIndices: [],
    hintMessage: '',
    ...extraUpdates,
  };
  if (state.compareMode && state.compareAlgo) {
    const compareSteps = safeGenerate(set, get, state.compareAlgo, data);
    updates.compareSteps = compareSteps;
    updates.compareStepIndex = 0;
    updates.compareCompareCount = 0;
    updates.compareSwapCount = 0;
  }
  set(updates as Partial<VizState>);
}
