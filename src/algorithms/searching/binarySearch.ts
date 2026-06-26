// ============================================================
// 二分搜索 — Binary Search
// 在已排序数组中，每次将搜索区间减半
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

export const binarySearch: Algorithm = {
  id: 'binary-search',
  name: '二分搜索',
  category: 'searching',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  dataKind: 'array',
  defaultData: [3, 9, 10, 27, 29, 38, 43, 45, 56, 61, 74, 82],
  codeLines: [
    'function binarySearch(arr, target) {',
    '  let lo = 0, hi = arr.length - 1;',
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
    // 二分搜索需要已排序数据
    const arr = [...data].sort((a, b) => a - b);
    const n = arr.length;
    // 选择一个存在的目标值
    const targetIdx = Math.floor(Math.random() * n);
    const target = arr[targetIdx];

    let lo = 0;
    let hi = n - 1;

    yield {
      type: 'mark',
      line: 1,
      message: `开始二分搜索（数据已排序），目标值 target = ${target}`,
      snapshot: snap(arr, {}),
    };

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);

      // 标记当前搜索区间
      const rangeStates: Record<number, ElementState> = {};
      for (let k = lo; k <= hi; k++) rangeStates[k] = 'visit';
      rangeStates[mid] = 'compare';

      yield {
        type: 'compare',
        indices: [mid],
        line: 3,
        message: `搜索区间 [${lo}..${hi}]，mid = ${mid}，arr[${mid}] = ${arr[mid]}`,
        snapshot: snap(arr, rangeStates, { [lo]: 'L', [hi]: 'H', [mid]: 'mid' }),
      };

      if (arr[mid] === target) {
        // 找到目标
        yield {
          type: 'mark',
          indices: [mid],
          line: 4,
          message: `✓ 找到目标！arr[${mid}] = ${target}`,
          snapshot: snap(arr, { [mid]: 'path' }, { [mid]: 'found' }),
        };

        yield {
          type: 'done',
          indices: [mid],
          line: 4,
          message: `搜索完成，目标 ${target} 位于下标 ${mid}`,
          snapshot: snap(arr, { [mid]: 'path' }),
        };
        return;
      }

      if (arr[mid] < target) {
        yield {
          type: 'pointer',
          indices: [mid],
          line: 5,
          message: `arr[${mid}] = ${arr[mid]} < ${target}，搜索右半部分`,
          snapshot: snap(arr, { ...rangeStates, [mid]: 'sorted' }),
        };
        lo = mid + 1;
      } else {
        yield {
          type: 'pointer',
          indices: [mid],
          line: 6,
          message: `arr[${mid}] = ${arr[mid]} > ${target}，搜索左半部分`,
          snapshot: snap(arr, { ...rangeStates, [mid]: 'sorted' }),
        };
        hi = mid - 1;
      }
    }

    // 未找到
    yield {
      type: 'done',
      line: 8,
      message: `搜索完成，未找到目标值 ${target}`,
      snapshot: snap(arr, {}),
    };
  },
};
