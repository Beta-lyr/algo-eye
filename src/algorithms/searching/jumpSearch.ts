// ============================================================
// 跳跃搜索 — Jump Search
// 在已排序数组中，按固定步长跳跃，找到区间后线性搜索
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

export const jumpSearch: Algorithm = {
  id: 'jump-search',
  name: '跳跃搜索',
  category: 'searching',
  complexity: { time: 'O(√n)', space: 'O(1)' },
  difficulty: 'intermediate',
  tags: ['ordered'],
  relatedAlgorithms: ['binary-search', 'exponential-search'],
  dataKind: 'array',
  defaultData: [3, 9, 10, 27, 29, 38, 43, 45, 56, 61, 74, 82],
  codeLines: [
    'function jumpSearch(arr, target) {',
    '  let n = arr.length;',
    '  let step = Math.floor(Math.sqrt(n));',
    '  let prev = 0;',
    '  while (arr[Math.min(step, n) - 1] < target) {',
    '    prev = step;',
    '    step += Math.floor(Math.sqrt(n));',
    '    if (prev >= n) return -1;',
    '  }',
    '  while (arr[prev] < target) {',
    '    prev++;',
    '    if (prev === Math.min(step, n)) return -1;',
    '  }',
    '  if (arr[prev] === target) return prev;',
    '  return -1;',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    // 跳跃搜索需要已排序数据
    const arr = [...data].sort((a, b) => a - b);
    const n = arr.length;
    const targetIdx = Math.floor(Math.random() * n);
    const target = arr[targetIdx];
    const step = Math.floor(Math.sqrt(n));

    yield {
      type: 'mark',
      line: 1,
      message: `开始跳跃搜索（数据已排序），目标值 target = ${target}，步长 = ${step}`,
      snapshot: snap(arr, {}),
    };

    let prev = 0;
    let current = step;

    // 跳跃阶段
    while (arr[Math.min(current, n) - 1] < target) {
      yield {
        type: 'pointer',
        indices: [Math.min(current - 1, n - 1)],
        line: 4,
        message: `跳跃：arr[${Math.min(current - 1, n - 1)}] = ${arr[Math.min(current - 1, n - 1)]} < ${target}，继续跳跃`,
        snapshot: snap(arr, (() => {
          const s: Record<number, ElementState> = {};
          for (let k = prev; k < Math.min(current, n); k++) s[k] = 'visit';
          s[Math.min(current - 1, n - 1)] = 'compare';
          return s;
        })(), { [prev]: 'prev', [Math.min(current - 1, n - 1)]: 'curr' }),
      };

      prev = current;
      current += step;

      if (prev >= n) {
        yield {
          type: 'done',
          line: 7,
          message: `搜索完成，未找到目标值 ${target}`,
          snapshot: snap(arr, {}),
        };
        return;
      }
    }

    yield {
      type: 'pointer',
      indices: [prev, Math.min(current, n) - 1],
      line: 9,
      message: `找到区间 [${prev}..${Math.min(current, n) - 1}]，开始线性搜索`,
      snapshot: snap(arr, (() => {
        const s: Record<number, ElementState> = {};
        for (let k = prev; k < Math.min(current, n); k++) s[k] = 'visit';
        return s;
      })(), { [prev]: 'L', [Math.min(current, n) - 1]: 'R' }),
    };

    // 线性搜索阶段
    while (arr[prev] < target) {
      yield {
        type: 'compare',
        indices: [prev],
        line: 9,
        message: `检查 arr[${prev}] = ${arr[prev]} < ${target}`,
        snapshot: snap(arr, { [prev]: 'compare' }, { [prev]: 'i' }),
      };

      prev++;

      if (prev === Math.min(current, n)) {
        yield {
          type: 'done',
          line: 11,
          message: `搜索完成，未找到目标值 ${target}`,
          snapshot: snap(arr, {}),
        };
        return;
      }
    }

    // 检查是否找到
    if (arr[prev] === target) {
      yield {
        type: 'mark',
        indices: [prev],
        line: 13,
        message: `✓ 找到目标！arr[${prev}] = ${target}`,
        snapshot: snap(arr, { [prev]: 'path' }, { [prev]: 'found' }),
      };

      yield {
        type: 'done',
        indices: [prev],
        line: 13,
        message: `搜索完成，目标 ${target} 位于下标 ${prev}`,
        snapshot: snap(arr, { [prev]: 'path' }),
      };
    } else {
      yield {
        type: 'done',
        line: 14,
        message: `搜索完成，未找到目标值 ${target}`,
        snapshot: snap(arr, {}),
      };
    }
  },
};
