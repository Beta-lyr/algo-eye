// ============================================================
// 快速排序 — Quick Sort
// 分治：选轴点 → 分区 → 递归左右
// ============================================================

import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState } from '../../engine/types';

function snap(
  arr: number[],
  states: Record<number, ElementState>,
  pointers?: Record<number, string>,
): Snapshot {
  return {
    kind: 'array',
    data: [...arr],
    states: { ...states },
    ...(pointers ? { pointers: { ...pointers } } : {}),
  };
}

export const quickSort: Algorithm = {
  id: 'quick-sort',
  name: '快速排序',
  category: 'sorting',
  complexity: { time: 'O(n log n)', space: 'O(log n)', stable: false },
  difficulty: 'intermediate',
  tags: ['comparison-based', 'in-place', 'divide-conquer'],
  relatedAlgorithms: ['merge-sort', 'heap-sort'],
  dataKind: 'array',
  defaultData: [38, 27, 43, 3, 9, 82, 10, 56, 74, 61, 45, 29],
  codeLines: [
    'function quickSort(arr, lo, hi) {',
    '  if (lo >= hi) return;',
    '  let pivot = arr[hi];',
    '  let i = lo;',
    '  for (let j = lo; j < hi; j++) {',
    '    if (arr[j] < pivot) {',
    '      [arr[i], arr[j]] = [arr[j], arr[i]];',
    '      i++;',
    '    }',
    '  }',
    '  [arr[i], arr[hi]] = [arr[hi], arr[i]];',
    '  quickSort(arr, lo, i - 1);',
    '  quickSort(arr, i + 1, hi);',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const arr = [...data];
    const n = arr.length;
    const sortedIndices: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: `开始快速排序，n = ${n}`,
      snapshot: snap(arr, sortedIndices),
    };

    // 用栈模拟递归，避免 Generator 嵌套
    const stack: [number, number][] = [[0, n - 1]];

    while (stack.length > 0) {
      const [lo, hi] = stack.pop()!;

      if (lo >= hi) {
        if (lo === hi) sortedIndices[lo] = 'sorted';
        continue;
      }

      const pivot = arr[hi];
      let i = lo;

      yield {
        type: 'pointer',
        indices: [hi],
        line: 2,
        message: `分区 [${lo}..${hi}]，pivot = arr[${hi}] = ${pivot}`,
        snapshot: snap(arr, { ...sortedIndices, [hi]: 'pivot' }, { [hi]: 'pivot' }),
      };

      for (let j = lo; j < hi; j++) {
        yield {
          type: 'compare',
          indices: [j, hi],
          line: 5,
          message: `比较 arr[${j}]=${arr[j]} < pivot=${pivot}?`,
          snapshot: snap(
            arr,
            { ...sortedIndices, [j]: 'compare', [hi]: 'pivot', [i]: 'current' },
            { [j]: 'j', [hi]: 'pivot', [i]: 'i' },
          ),
        };

        if (arr[j] < pivot) {
          if (i !== j) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            yield {
              type: 'swap',
              indices: [i, j],
              values: [arr[i], arr[j]],
              line: 6,
              message: `交换 arr[${i}] ↔ arr[${j}]`,
              snapshot: snap(arr, { ...sortedIndices, [i]: 'swap', [j]: 'swap', [hi]: 'pivot' }),
            };
          }
          i++;
        }
      }

      // 将轴点放到正确位置
      [arr[i], arr[hi]] = [arr[hi], arr[i]];
      sortedIndices[i] = 'sorted';

      yield {
        type: 'swap',
        indices: [i, hi],
        values: [arr[i], arr[hi]],
        line: 10,
        message: `轴点 arr[${i}]=${arr[i]} 归位`,
        snapshot: snap(arr, { ...sortedIndices, [i]: 'sorted' }),
      };

      // 递归子区间
      if (i > lo + 1) stack.push([lo, i - 1]);
      if (i < hi - 1) stack.push([i + 1, hi]);
      if (i === lo) sortedIndices[lo] = 'sorted';
      if (i === hi) sortedIndices[hi] = 'sorted';
    }

    // 标记所有为 sorted
    for (let k = 0; k < n; k++) sortedIndices[k] = 'sorted';

    yield {
      type: 'done',
      line: 13,
      message: '排序完成！所有元素已按升序排列。',
      snapshot: snap(arr, sortedIndices),
    };
  },
};
