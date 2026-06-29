// ============================================================
// 选择排序 — Selection Sort
// 每轮找到最小元素，放到已排序区间末尾
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

export const selectionSort: Algorithm = {
  id: 'selection-sort',
  name: '选择排序',
  category: 'sorting',
  complexity: { time: 'O(n²)', space: 'O(1)', stable: false },
  difficulty: 'beginner',
  tags: ['comparison-based', 'in-place'],
  relatedAlgorithms: ['bubble-sort', 'insertion-sort'],
  dataKind: 'array',
  defaultData: [64, 25, 12, 22, 11, 90, 45, 78, 33, 56, 87, 42],
  codeLines: [
    'function selectionSort(arr) {',
    '  const n = arr.length;',
    '  for (let i = 0; i < n - 1; i++) {',
    '    let minIdx = i;',
    '    for (let j = i + 1; j < n; j++) {',
    '      if (arr[j] < arr[minIdx]) {',
    '        minIdx = j;',
    '      }',
    '    }',
    '    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];',
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
      message: `开始选择排序，n = ${n}`,
      snapshot: snap(arr, sortedIndices),
    };

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      yield {
        type: 'pointer',
        indices: [i],
        line: 3,
        message: `第 ${i + 1} 轮：假设 arr[${i}]=${arr[i]} 为最小值`,
        snapshot: snap(arr, { ...sortedIndices, [i]: 'current' }, { [i]: 'i' }),
      };

      for (let j = i + 1; j < n; j++) {
        // 比较
        yield {
          type: 'compare',
          indices: [j, minIdx],
          line: 5,
          message: `比较 arr[${j}]=${arr[j]} 与当前最小 arr[${minIdx}]=${arr[minIdx]}`,
          snapshot: snap(
            arr,
            { ...sortedIndices, [minIdx]: 'compare', [j]: 'compare', [i]: 'current' },
            { [minIdx]: 'min', [j]: 'j' },
          ),
        };

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          yield {
            type: 'pointer',
            indices: [minIdx],
            line: 6,
            message: `更新最小值下标：minIdx = ${minIdx}，arr[${minIdx}]=${arr[minIdx]}`,
            snapshot: snap(
              arr,
              { ...sortedIndices, [minIdx]: 'pivot', [i]: 'current' },
              { [minIdx]: 'min' },
            ),
          };
        }
      }

      // 交换
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        yield {
          type: 'swap',
          indices: [i, minIdx],
          values: [arr[i], arr[minIdx]],
          line: 9,
          message: `交换 arr[${i}] ↔ arr[${minIdx}]，最小值 ${arr[i]} 归位`,
          snapshot: snap(arr, { ...sortedIndices, [i]: 'swap', [minIdx]: 'swap' }),
        };
      }

      sortedIndices[i] = 'sorted';
      yield {
        type: 'mark',
        indices: [i],
        line: 2,
        message: `第 ${i + 1} 轮完成，arr[${i}]=${arr[i]} 已就位`,
        snapshot: snap(arr, sortedIndices),
      };
    }

    sortedIndices[n - 1] = 'sorted';
    yield {
      type: 'done',
      line: 12,
      message: '排序完成！所有元素已按升序排列。',
      snapshot: snap(arr, sortedIndices),
    };
  },
};
