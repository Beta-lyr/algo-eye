import { describe, it, expect } from 'vitest';
import { isSorted, buildChallengeResult } from '../challenge';

describe('isSorted', () => {
  it('空数组已序', () => {
    expect(isSorted([])).toBe(true);
  });

  it('单元素已序', () => {
    expect(isSorted([1])).toBe(true);
  });

  it('升序数组已序', () => {
    expect(isSorted([1, 2, 3, 4])).toBe(true);
  });

  it('包含相等值已序', () => {
    expect(isSorted([1, 2, 2, 3])).toBe(true);
  });

  it('降序数组未序', () => {
    expect(isSorted([4, 3, 2, 1])).toBe(false);
  });

  it('乱序未序', () => {
    expect(isSorted([3, 1, 4, 1])).toBe(false);
  });
});

describe('buildChallengeResult', () => {
  it('构造正确', () => {
    const r = buildChallengeResult(5, 1200, 8, 24);
    expect(r).toEqual({ userSwaps: 5, userTimeMs: 1200, algoSwaps: 8, algoCompares: 24 });
  });
});
