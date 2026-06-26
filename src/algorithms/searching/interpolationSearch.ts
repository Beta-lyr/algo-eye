// ============================================================
// 插值搜索 — Interpolation Search
// 在已排序且均匀分布的数组中，根据值估算位置
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

export const interpolationSearch: Algorithm = {
  id: 'interpolation-search',
  name: '插值搜索',
  category: 'searching',
  complexity: { time: 'O(log log n)', space: 'O(1)' },
  dataKind: 'array',
  defaultData: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  codeLines: [
    'function interpolationSearch(arr, target) {',
    '  let lo = 0, hi = arr.length - 1;',
    '  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {',
    '    let pos = lo + Math.floor(',
    '      ((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo])',
    '    );',
    '    if (arr[pos] === target) return pos;',
    '    if (arr[pos] < target) lo = pos + 1;',
    '    else hi = pos - 1;',
    '  }',
    '  return -1;',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    // 插值搜索需要已排序数据
    const arr = [...data].sort((a, b) => a - b);
    const n = arr.length;
    const targetIdx = Math.floor(Math.random() * n);
    const target = arr[targetIdx];

    let lo = 0;
    let hi = n - 1;

    yield {
      type: 'mark',
      line: 1,
      message: `开始插值搜索（数据已排序且均匀分布），目标值 target = ${target}`,
      snapshot: snap(arr, {}),
    };

    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
      // 计算插值位置
      const pos = lo + Math.floor(
        ((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo])
      );

      // 标记搜索区间
      const rangeStates: Record<number, ElementState> = {};
      for (let k = lo; k <= hi; k++) rangeStates[k] = 'visit';
      rangeStates[pos] = 'compare';

      yield {
        type: 'compare',
        indices: [pos],
        line: 3,
        message: `搜索区间 [${lo}..${hi}]，估算位置 pos = ${pos}，arr[${pos}] = ${arr[pos]}`,
        snapshot: snap(arr, rangeStates, { [lo]: 'L', [hi]: 'H', [pos]: 'pos' }),
      };

      if (arr[pos] === target) {
        // 找到目标
        yield {
          type: 'mark',
          indices: [pos],
          line: 7,
          message: `✓ 找到目标！arr[${pos}] = ${target}`,
          snapshot: snap(arr, { [pos]: 'path' }, { [pos]: 'found' }),
        };

        yield {
          type: 'done',
          indices: [pos],
          line: 7,
          message: `搜索完成，目标 ${target} 位于下标 ${pos}`,
          snapshot: snap(arr, { [pos]: 'path' }),
        };
        return;
      }

      if (arr[pos] < target) {
        yield {
          type: 'pointer',
          indices: [pos],
          line: 8,
          message: `arr[${pos}] = ${arr[pos]} < ${target}，搜索右半部分`,
          snapshot: snap(arr, { ...rangeStates, [pos]: 'sorted' }),
        };
        lo = pos + 1;
      } else {
        yield {
          type: 'pointer',
          indices: [pos],
          line: 9,
          message: `arr[${pos}] = ${arr[pos]} > ${target}，搜索左半部分`,
          snapshot: snap(arr, { ...rangeStates, [pos]: 'sorted' }),
        };
        hi = pos - 1;
      }
    }

    // 未找到
    yield {
      type: 'done',
      line: 11,
      message: `搜索完成，未找到目标值 ${target}`,
      snapshot: snap(arr, {}),
    };
  },
};
