// ============================================================
// 插入排序 — Insertion Sort
// 将每个元素插入到已排序区间的正确位置
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

export const insertionSort: Algorithm = {
  id: 'insertion-sort',
  name: '插入排序',
  category: 'sorting',
  complexity: { time: 'O(n²)', space: 'O(1)', stable: true },
  difficulty: 'beginner',
  tags: ['comparison-based', 'in-place', 'stable'],
  dataKind: 'array',
  defaultData: [42, 68, 35, 91, 27, 54, 73, 48, 61, 39, 82, 45],
  codeLines: [
    'function insertionSort(arr) {',
    '  for (let i = 1; i < arr.length; i++) {',
    '    let key = arr[i];',
    '    let j = i - 1;',
    '    while (j >= 0 && arr[j] > key) {',
    '      arr[j + 1] = arr[j];',
    '      j--;',
    '    }',
    '    arr[j + 1] = key;',
    '  }',
    '  return arr;',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const arr = [...data];
    const n = arr.length;
    const sortedIndices: Record<number, ElementState> = {};

    // 第一个元素视为已排序
    sortedIndices[0] = 'sorted';
    yield {
      type: 'mark',
      line: 1,
      message: `开始插入排序，n = ${n}，第一个元素已排序`,
      snapshot: snap(arr, sortedIndices),
    };

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      yield {
        type: 'pointer',
        indices: [i],
        line: 2,
        message: `取出 key = arr[${i}] = ${key}，准备插入`,
        snapshot: snap(arr, { ...sortedIndices, [i]: 'current' }, { [i]: 'i' }),
      };

      // 向左比较并移动
      while (j >= 0 && arr[j] > key) {
        yield {
          type: 'compare',
          indices: [j],
          line: 4,
          message: `比较 arr[${j}]=${arr[j]} > key=${key}，需要右移`,
          snapshot: snap(
            arr,
            { ...sortedIndices, [j]: 'compare', [i]: 'current' },
            { [j]: 'j' },
          ),
        };

        arr[j + 1] = arr[j];
        yield {
          type: 'set',
          indices: [j + 1],
          values: [arr[j]],
          line: 5,
          message: `arr[${j + 1}] = arr[${j}] = ${arr[j]}，右移`,
          snapshot: snap(arr, { ...sortedIndices, [j + 1]: 'swap' }),
        };

        j--;
      }

      if (j >= 0) {
        yield {
          type: 'compare',
          indices: [j],
          line: 4,
          message: `arr[${j}]=${arr[j]} ≤ key=${key}，找到插入位置`,
          snapshot: snap(arr, { ...sortedIndices, [j]: 'compare' }),
        };
      }

      // 插入 key
      arr[j + 1] = key;
      sortedIndices[j + 1] = 'sorted';

      yield {
        type: 'set',
        indices: [j + 1],
        values: [key],
        line: 8,
        message: `插入 arr[${j + 1}] = ${key}`,
        snapshot: snap(arr, sortedIndices),
      };
    }

    yield {
      type: 'done',
      line: 11,
      message: '排序完成！所有元素已按升序排列。',
      snapshot: snap(arr, sortedIndices),
    };
  },
};
