// ============================================================
// 线性搜索 — Linear Search
// 从左到右逐个检查，找到目标即返回
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

export const linearSearch: Algorithm = {
  id: 'linear-search',
  name: '线性搜索',
  category: 'searching',
  complexity: { time: 'O(n)', space: 'O(1)' },
  difficulty: 'beginner',
  tags: ['unordered'],
  dataKind: 'array',
  defaultData: [42, 68, 35, 91, 27, 54, 73, 48, 61, 39, 82, 45],
  codeLines: [
    'function linearSearch(arr, target) {',
    '  for (let i = 0; i < arr.length; i++) {',
    '    if (arr[i] === target) {',
    '      return i; // 找到目标',
    '    }',
    '  }',
    '  return -1; // 未找到',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const arr = [...data];
    const n = arr.length;
    // 搜索目标：数组中某个随机存在的值
    const targetIdx = Math.floor(Math.random() * n);
    const target = arr[targetIdx];

    yield {
      type: 'mark',
      line: 1,
      message: `开始线性搜索，目标值 target = ${target}`,
      snapshot: snap(arr, {}),
    };

    for (let i = 0; i < n; i++) {
      // 比较当前元素与目标
      yield {
        type: 'compare',
        indices: [i],
        line: 2,
        message: `检查 arr[${i}] = ${arr[i]} === ${target}?`,
        snapshot: snap(arr, { [i]: 'compare' }, { [i]: 'i' }),
      };

      if (arr[i] === target) {
        // 找到目标
        yield {
          type: 'mark',
          indices: [i],
          line: 3,
          message: `✓ 找到目标！arr[${i}] = ${target}`,
          snapshot: snap(arr, { [i]: 'path' }, { [i]: 'found' }),
        };

        yield {
          type: 'done',
          indices: [i],
          line: 3,
          message: `搜索完成，目标 ${target} 位于下标 ${i}`,
          snapshot: snap(arr, { [i]: 'path' }),
        };
        return;
      }

      // 标记已访问
      yield {
        type: 'visit',
        indices: [i],
        line: 1,
        message: `arr[${i}] = ${arr[i]} ≠ ${target}，继续`,
        snapshot: snap(arr, { [i]: 'visit' }),
      };
    }

    // 未找到
    yield {
      type: 'done',
      line: 6,
      message: `搜索完成，未找到目标值 ${target}`,
      snapshot: snap(arr, {}),
    };
  },
};
