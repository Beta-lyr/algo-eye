import type { Step } from '../engine/types';

export function buildStats(steps: Step[]) {
  const n = steps.length;
  const compare = new Array(n + 1).fill(0);
  const swap = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    compare[i + 1] = compare[i] + (steps[i].type === 'compare' ? 1 : 0);
    swap[i + 1] = swap[i] + (steps[i].type === 'swap' ? 1 : 0);
  }
  return {
    compareUpTo: (i: number) => (i < n ? compare[i + 1] : 0),
    swapUpTo: (i: number) => (i < n ? swap[i + 1] : 0),
    totalCompares: compare[n],
    totalSwaps: swap[n],
  };
}

export function computeStats(steps: Step[], index: number) {
  let c = 0, s = 0;
  if (steps.length === 0) return { compareCount: c, swapCount: s };
  for (let i = 0; i <= Math.min(index, steps.length - 1); i++) {
    if (steps[i].type === 'compare') c++;
    if (steps[i].type === 'swap') s++;
  }
  return { compareCount: c, swapCount: s };
}
