// ============================================================
// 计数排序 — Counting Sort
// 非比较排序，适用于范围较小的整数
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

export const countingSort: Algorithm = {
  id: 'counting-sort',
  name: '计数排序',
  category: 'sorting',
  complexity: { time: 'O(n+k)', space: 'O(k)', stable: true },
  dataKind: 'array',
  defaultData: [4, 2, 2, 8, 3, 3, 1],
  codeLines: [
    'function countingSort(arr) {',
    '  let max = Math.max(...arr);',
    '  let min = Math.min(...arr);',
    '  let range = max - min + 1;',
    '  let count = new Array(range).fill(0);',
    '  let output = new Array(arr.length);',
    '  for (let i = 0; i < arr.length; i++)',
    '    count[arr[i] - min]++;',
    '  for (let i = 1; i < range; i++)',
    '    count[i] += count[i - 1];',
    '  for (let i = arr.length - 1; i >= 0; i--) {',
    '    output[count[arr[i] - min] - 1] = arr[i];',
    '    count[arr[i] - min]--;',
    '  }',
    '  for (let i = 0; i < arr.length; i++)',
    '    arr[i] = output[i];',
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
      message: `开始计数排序，n = ${n}`,
      snapshot: snap(arr, sortedIndices),
    };

    const max = Math.max(...arr);
    const min = Math.min(...arr);
    const range = max - min + 1;

    yield {
      type: 'pointer',
      line: 2,
      message: `范围：min=${min}，max=${max}，range=${range}`,
      snapshot: snap(arr, (() => {
        const s: Record<number, ElementState> = {};
        for (let k = 0; k < n; k++) s[k] = 'visit';
        return s;
      })()),
    };

    // 统计频率
    const count = new Array(range).fill(0);
    for (let i = 0; i < n; i++) {
      count[arr[i] - min]++;
      yield {
        type: 'visit',
        indices: [i],
        line: 7,
        message: `计数：${arr[i]} 出现 ${count[arr[i] - min]} 次`,
        snapshot: snap(arr, { ...sortedIndices, [i]: 'compare' }),
      };
    }

    // 累计计数
    for (let i = 1; i < range; i++) {
      count[i] += count[i - 1];
    }

    yield {
      type: 'mark',
      line: 9,
      message: '累计计数完成',
      snapshot: snap(arr, (() => {
        const s: Record<number, ElementState> = {};
        for (let k = 0; k < n; k++) s[k] = 'visit';
        return s;
      })()),
    };

    // 构建输出数组
    const output = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      const val = arr[i];
      output[count[val - min] - 1] = val;
      count[val - min]--;

      yield {
        type: 'set',
        indices: [count[val - min]],
        values: [val],
        line: 12,
        message: `放置 ${val} 到位置 ${count[val - min]}`,
        snapshot: snap(arr, { ...sortedIndices, [i]: 'current', [count[val - min]]: 'swap' }),
      };
    }

    // 写回原数组
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
    }

    // 全部标记为已排序
    for (let k = 0; k < n; k++) sortedIndices[k] = 'sorted';

    yield {
      type: 'done',
      line: 18,
      message: '排序完成！所有元素已按升序排列。',
      snapshot: snap(arr, sortedIndices),
    };
  },
};
