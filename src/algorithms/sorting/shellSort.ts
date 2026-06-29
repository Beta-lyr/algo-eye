// ============================================================
// 希尔排序 — Shell Sort
// 缩小增量排序，插入排序的改进版
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

export const shellSort: Algorithm = {
  id: 'shell-sort',
  name: '希尔排序',
  category: 'sorting',
  complexity: { time: 'O(n^1.3)', space: 'O(1)', stable: false },
  difficulty: 'intermediate',
  tags: ['comparison-based', 'in-place'],
  relatedAlgorithms: ['insertion-sort'],
  dataKind: 'array',
  defaultData: [42, 68, 35, 91, 27, 54, 73, 48, 61, 39, 82, 45],
  codeLines: [
    'function shellSort(arr) {',
    '  let gap = Math.floor(arr.length / 2);',
    '  while (gap > 0) {',
    '    for (let i = gap; i < arr.length; i++) {',
    '      let temp = arr[i];',
    '      let j = i;',
    '      while (j >= gap && arr[j - gap] > temp) {',
    '        arr[j] = arr[j - gap];',
    '        j -= gap;',
    '      }',
    '      arr[j] = temp;',
    '    }',
    '    gap = Math.floor(gap / 2);',
    '  }',
    '  return arr;',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const arr = [...data];
    const n = arr.length;
    const sortedIndices: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: `开始希尔排序，n = ${n}`,
      snapshot: snap(arr, sortedIndices),
    };

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      yield {
        type: 'pointer',
        line: 2,
        message: `增量 gap = ${gap}`,
        snapshot: snap(arr, (() => {
          const s: Record<number, ElementState> = {};
          for (let k = 0; k < n; k += gap) s[k] = 'visit';
          return s;
        })()),
      };

      for (let i = gap; i < n; i++) {
        const temp = arr[i];
        let j = i;

        yield {
          type: 'pointer',
          indices: [i],
          line: 4,
          message: `取出 arr[${i}] = ${temp}，gap = ${gap}`,
          snapshot: snap(arr, { ...sortedIndices, [i]: 'current' }, { [i]: 'i' }),
        };

        while (j >= gap && arr[j - gap] > temp) {
          yield {
            type: 'compare',
            indices: [j - gap, j],
            line: 6,
            message: `比较 arr[${j - gap}]=${arr[j - gap]} > ${temp}，右移`,
            snapshot: snap(arr, { ...sortedIndices, [j - gap]: 'compare', [j]: 'current' }),
          };

          arr[j] = arr[j - gap];
          yield {
            type: 'set',
            indices: [j],
            values: [arr[j - gap]],
            line: 7,
            message: `arr[${j}] = arr[${j - gap}] = ${arr[j - gap]}`,
            snapshot: snap(arr, { ...sortedIndices, [j]: 'swap' }),
          };

          j -= gap;
        }

        arr[j] = temp;
        yield {
          type: 'set',
          indices: [j],
          values: [temp],
          line: 10,
          message: `插入 arr[${j}] = ${temp}`,
          snapshot: snap(arr, { ...sortedIndices, [j]: 'sorted' }),
        };
      }

      // 标记本轮已处理的元素
      for (let k = 0; k < n; k++) {
        if (!sortedIndices[k]) sortedIndices[k] = 'default';
      }
    }

    // 全部标记为已排序
    for (let k = 0; k < n; k++) sortedIndices[k] = 'sorted';

    yield {
      type: 'done',
      line: 15,
      message: '排序完成！所有元素已按升序排列。',
      snapshot: snap(arr, sortedIndices),
    };
  },
};
