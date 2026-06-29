// ============================================================
// 指数搜索 — Exponential Search
// 先指数扩展找到范围，再在范围内二分搜索
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

export const exponentialSearch: Algorithm = {
  id: 'exponential-search',
  name: '指数搜索',
  category: 'searching',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  difficulty: 'intermediate',
  tags: ['ordered'],
  relatedAlgorithms: ['binary-search', 'jump-search'],
  dataKind: 'array',
  defaultData: [3, 9, 10, 27, 29, 38, 43, 45, 56, 61, 74, 82],
  codeLines: [
    'function exponentialSearch(arr, target) {',
    '  let n = arr.length;',
    '  if (arr[0] === target) return 0;',
    '  let i = 1;',
    '  while (i < n && arr[i] <= target) {',
    '    i *= 2;',
    '  }',
    '  return binarySearch(arr, target, i / 2, Math.min(i, n - 1));',
    '}',
    'function binarySearch(arr, target, lo, hi) {',
    '  while (lo <= hi) {',
    '    let mid = Math.floor((lo + hi) / 2);',
    '    if (arr[mid] === target) return mid;',
    '    if (arr[mid] < target) lo = mid + 1;',
    '    else hi = mid - 1;',
    '  }',
    '  return -1;',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    // 指数搜索需要已排序数据
    const arr = [...data].sort((a, b) => a - b);
    const n = arr.length;
    const targetIdx = Math.floor(Math.random() * n);
    const target = arr[targetIdx];

    yield {
      type: 'mark',
      line: 1,
      message: `开始指数搜索（数据已排序），目标值 target = ${target}`,
      snapshot: snap(arr, {}),
    };

    // 检查第一个元素
    if (arr[0] === target) {
      yield {
        type: 'mark',
        indices: [0],
        line: 2,
        message: `是 找到目标！arr[0] = ${target}`,
        snapshot: snap(arr, { [0]: 'path' }, { [0]: 'found' }),
      };

      yield {
        type: 'done',
        indices: [0],
        line: 2,
        message: `搜索完成，目标 ${target} 位于下标 0`,
        snapshot: snap(arr, { [0]: 'path' }),
      };
      return;
    }

    // 指数扩展阶段
    let i = 1;
    while (i < n && arr[i] <= target) {
      yield {
        type: 'pointer',
        indices: [i],
        line: 4,
        message: `指数扩展：i = ${i}，arr[${i}] = ${arr[i]} ≤ ${target}`,
        snapshot: snap(arr, { [i]: 'compare' }, { [i]: 'i' }),
      };
      i *= 2;
    }

    const lo = Math.floor(i / 2);
    const hi = Math.min(i, n - 1);

    yield {
      type: 'pointer',
      indices: [lo, hi],
      line: 8,
      message: `找到范围 [${lo}..${hi}]，开始二分搜索`,
      snapshot: snap(arr, (() => {
        const s: Record<number, ElementState> = {};
        for (let k = lo; k <= hi; k++) s[k] = 'visit';
        return s;
      })(), { [lo]: 'L', [hi]: 'R' }),
    };

    // 二分搜索阶段
    let left = lo;
    let right = hi;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      const rangeStates: Record<number, ElementState> = {};
      for (let k = lo; k <= hi; k++) rangeStates[k] = 'visit';
      rangeStates[mid] = 'compare';

      yield {
        type: 'compare',
        indices: [mid],
        line: 12,
        message: `二分搜索：区间 [${left}..${right}]，mid = ${mid}，arr[${mid}] = ${arr[mid]}`,
        snapshot: snap(arr, rangeStates, { [left]: 'L', [right]: 'R', [mid]: 'mid' }),
      };

      if (arr[mid] === target) {
        yield {
          type: 'mark',
          indices: [mid],
          line: 13,
          message: `是 找到目标！arr[${mid}] = ${target}`,
          snapshot: snap(arr, { [mid]: 'path' }, { [mid]: 'found' }),
        };

        yield {
          type: 'done',
          indices: [mid],
          line: 13,
          message: `搜索完成，目标 ${target} 位于下标 ${mid}`,
          snapshot: snap(arr, { [mid]: 'path' }),
        };
        return;
      }

      if (arr[mid] < target) {
        yield {
          type: 'pointer',
          indices: [mid],
          line: 14,
          message: `arr[${mid}] = ${arr[mid]} < ${target}，搜索右半部分`,
          snapshot: snap(arr, { ...rangeStates, [mid]: 'sorted' }),
        };
        left = mid + 1;
      } else {
        yield {
          type: 'pointer',
          indices: [mid],
          line: 15,
          message: `arr[${mid}] = ${arr[mid]} > ${target}，搜索左半部分`,
          snapshot: snap(arr, { ...rangeStates, [mid]: 'sorted' }),
        };
        right = mid - 1;
      }
    }

    // 未找到
    yield {
      type: 'done',
      line: 17,
      message: `搜索完成，未找到目标值 ${target}`,
      snapshot: snap(arr, {}),
    };
  },
};
