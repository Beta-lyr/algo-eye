// ============================================================
// 归并排序 — Merge Sort
// 分治：拆分 → 递归排序 → 合并
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

export const mergeSort: Algorithm = {
  id: 'merge-sort',
  name: '归并排序',
  category: 'sorting',
  complexity: { time: 'O(n log n)', space: 'O(n)', stable: true },
  dataKind: 'array',
  defaultData: [38, 27, 43, 3, 9, 82, 10, 56, 74, 61, 45, 29],
  codeLines: [
    'function mergeSort(arr, l, r) {',
    '  if (l >= r) return;',
    '  let m = Math.floor((l + r) / 2);',
    '  mergeSort(arr, l, m);',
    '  mergeSort(arr, m + 1, r);',
    '  // 合并两个有序子数组',
    '  let i = l, j = m + 1, tmp = [];',
    '  while (i <= m && j <= r) {',
    '    if (arr[i] <= arr[j]) tmp.push(arr[i++]);',
    '    else tmp.push(arr[j++]);',
    '  }',
    '  while (i <= m) tmp.push(arr[i++]);',
    '  while (j <= r) tmp.push(arr[j++]);',
    '  for (let k = 0; k < tmp.length; k++)',
    '    arr[l + k] = tmp[k];',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const arr = [...data];
    const n = arr.length;
    const sortedIndices: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: `开始归并排序，n = ${n}`,
      snapshot: snap(arr, sortedIndices),
    };

    // 自底向上迭代归并（避免递归 Generator 复杂度）
    for (let size = 1; size < n; size *= 2) {
      for (let l = 0; l < n - 1; l += 2 * size) {
        const m = Math.min(l + size - 1, n - 1);
        const r = Math.min(l + 2 * size - 1, n - 1);

        if (m >= r) continue;

        // 标记合并区间
        const mergeStates: Record<number, ElementState> = { ...sortedIndices };
        for (let k = l; k <= m; k++) mergeStates[k] = 'compare';
        for (let k = m + 1; k <= r; k++) mergeStates[k] = 'visit';

        yield {
          type: 'pointer',
          indices: [l, m, r],
          line: 6,
          message: `合并 [${l}..${m}] 与 [${m + 1}..${r}]`,
          snapshot: snap(arr, mergeStates, { [l]: 'L', [m]: 'M', [r]: 'R' }),
        };

        // 合并过程
        let i = l;
        let j = m + 1;
        const tmp: number[] = [];

        while (i <= m && j <= r) {
          yield {
            type: 'compare',
            indices: [i, j],
            line: 8,
            message: `比较 arr[${i}]=${arr[i]} 与 arr[${j}]=${arr[j]}`,
            snapshot: snap(arr, { ...sortedIndices, [i]: 'compare', [j]: 'visit' }),
          };

          if (arr[i] <= arr[j]) {
            tmp.push(arr[i++]);
          } else {
            tmp.push(arr[j++]);
          }
        }
        while (i <= m) tmp.push(arr[i++]);
        while (j <= r) tmp.push(arr[j++]);

        // 写回
        for (let k = 0; k < tmp.length; k++) {
          arr[l + k] = tmp[k];
        }

        yield {
          type: 'set',
          indices: Array.from({ length: r - l + 1 }, (_, k) => l + k),
          line: 14,
          message: `合并完成 [${l}..${r}]`,
          snapshot: snap(arr, (() => {
            const s = { ...sortedIndices };
            for (let k = l; k <= r; k++) s[k] = 'swap';
            return s;
          })()),
        };

        // 标记已排序
        for (let k = l; k <= r; k++) sortedIndices[k] = 'sorted';
      }
    }

    yield {
      type: 'done',
      line: 15,
      message: '排序完成！所有元素已按升序排列。',
      snapshot: snap(arr, sortedIndices),
    };
  },
};
