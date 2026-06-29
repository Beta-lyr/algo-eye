import { describe, it, expect } from 'vitest';
import { buildStats, computeStats } from '../stats';
import type { Step } from '../../engine/types';

function makeStep(type: Step['type']): Step {
  return { type, line: 0, snapshot: { kind: 'array', data: [], states: {} } };
}

describe('computeStats', () => {
  it('空 steps 返回零', () => {
    expect(computeStats([], 0)).toEqual({ compareCount: 0, swapCount: 0 });
  });

  it('全 compare', () => {
    const steps = [makeStep('compare'), makeStep('compare')];
    expect(computeStats(steps, 0)).toEqual({ compareCount: 1, swapCount: 0 });
    expect(computeStats(steps, 1)).toEqual({ compareCount: 2, swapCount: 0 });
  });

  it('全 swap', () => {
    const steps = [makeStep('swap'), makeStep('swap')];
    expect(computeStats(steps, 1)).toEqual({ compareCount: 0, swapCount: 2 });
  });

  it('混合', () => {
    const steps = [
      makeStep('compare'),
      makeStep('swap'),
      makeStep('compare'),
      makeStep('mark'),
    ];
    expect(computeStats(steps, 3)).toEqual({ compareCount: 2, swapCount: 1 });
  });
});

describe('buildStats', () => {
  it('前缀和 O(1) 查询与 computeStats 一致', () => {
    const steps = [
      makeStep('compare'),
      makeStep('swap'),
      makeStep('compare'),
      makeStep('mark'),
    ];
    const stats = buildStats(steps);
    for (let i = 0; i < steps.length; i++) {
      const expected = computeStats(steps, i);
      expect(stats.compareUpTo(i)).toBe(expected.compareCount);
      expect(stats.swapUpTo(i)).toBe(expected.swapCount);
    }
    expect(stats.totalCompares).toBe(2);
    expect(stats.totalSwaps).toBe(1);
  });

  it('空 steps', () => {
    const stats = buildStats([]);
    expect(stats.compareUpTo(0)).toBe(0);
    expect(stats.swapUpTo(0)).toBe(0);
    expect(stats.totalCompares).toBe(0);
    expect(stats.totalSwaps).toBe(0);
  });
});
