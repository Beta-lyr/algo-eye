// ============================================================
// 基数排序 — Radix Sort
// 按位排序，从最低位到最高位
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

export const radixSort: Algorithm = {
  id: 'radix-sort',
  name: '基数排序',
  category: 'sorting',
  complexity: { time: 'O(nk)', space: 'O(n+k)', stable: true },
  difficulty: 'advanced',
  tags: ['non-comparison', 'stable'],
  dataKind: 'array',
  defaultData: [170, 45, 75, 90, 802, 24, 2, 66],
  codeLines: [
    'function radixSort(arr) {',
    '  let max = Math.max(...arr);',
    '  for (let exp = 1; max / exp > 0; exp *= 10) {',
    '    countingSortByDigit(arr, exp);',
    '  }',
    '  return arr;',
    '}',
    'function countingSortByDigit(arr, exp) {',
    '  let output = new Array(arr.length);',
    '  let count = new Array(10).fill(0);',
    '  for (let i = 0; i < arr.length; i++)',
    '    count[Math.floor(arr[i] / exp) % 10]++;',
    '  for (let i = 1; i < 10; i++)',
    '    count[i] += count[i - 1];',
    '  for (let i = arr.length - 1; i >= 0; i--) {',
    '    let digit = Math.floor(arr[i] / exp) % 10;',
    '    output[count[digit] - 1] = arr[i];',
    '    count[digit]--;',
    '  }',
    '  for (let i = 0; i < arr.length; i++)',
    '    arr[i] = output[i];',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const arr = [...data];
    const n = arr.length;
    const sortedIndices: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: `开始基数排序，n = ${n}`,
      snapshot: snap(arr, sortedIndices),
    };

    const max = Math.max(...arr);

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      const digitName = exp === 1 ? '个位' : exp === 10 ? '十位' : exp === 100 ? '百位' : `${exp}位`;

      yield {
        type: 'pointer',
        line: 2,
        message: `按${digitName}排序，exp = ${exp}`,
        snapshot: snap(arr, (() => {
          const s: Record<number, ElementState> = {};
          for (let k = 0; k < n; k++) {
            const digit = Math.floor(arr[k] / exp) % 10;
            s[k] = digit % 2 === 0 ? 'visit' : 'compare';
          }
          return s;
        })()),
      };

      // 计数排序
      const output = new Array(n).fill(0);
      const count = new Array(10).fill(0);

      // 统计频率
      for (let i = 0; i < n; i++) {
        const digit = Math.floor(arr[i] / exp) % 10;
        count[digit]++;
      }

      // 累计计数
      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
      }

      // 构建输出数组（从后往前保证稳定性）
      for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;

        yield {
          type: 'set',
          indices: [count[digit]],
          values: [arr[i]],
          line: 17,
          message: `${digitName}=${digit}，放置 arr[${i}]=${arr[i]} 到位置 ${count[digit]}`,
          snapshot: snap(arr, { ...sortedIndices, [i]: 'current', [count[digit]]: 'swap' }),
        };
      }

      // 写回原数组
      for (let i = 0; i < n; i++) {
        arr[i] = output[i];
      }

      yield {
        type: 'mark',
        line: 4,
        message: `${digitName}排序完成`,
        snapshot: snap(arr, (() => {
          const s: Record<number, ElementState> = {};
          for (let k = 0; k < n; k++) s[k] = 'sorted';
          return s;
        })()),
      };
    }

    // 全部标记为已排序
    for (let k = 0; k < n; k++) sortedIndices[k] = 'sorted';

    yield {
      type: 'done',
      line: 6,
      message: '排序完成！所有元素已按升序排列。',
      snapshot: snap(arr, sortedIndices),
    };
  },
};
