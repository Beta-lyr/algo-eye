// ============================================================
// 冒泡排序 — Bubble Sort
// 算法生成器：每轮把最大元素冒泡到末尾
// ============================================================

import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState } from '../../engine/types';

/**
 * 工具函数：从数组 + 状态 map 打包成 Snapshot
 * 继承已有的 sorted 状态（已锁定的不丢）
 */
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

export const bubbleSort: Algorithm = {
  id: 'bubble-sort',
  name: '冒泡排序',
  category: 'sorting',
  complexity: { time: 'O(n²)', space: 'O(1)', stable: true },
  difficulty: 'beginner',
  tags: ['comparison-based', 'in-place', 'stable'],
  relatedAlgorithms: ['selection-sort', 'insertion-sort'],
  dataKind: 'array',
  defaultData: [42, 68, 35, 91, 27, 54, 73, 48, 61, 39, 82, 45, 58, 76, 50, 65],
  codeLines: [
    'function bubbleSort(arr) {',
    '  const n = arr.length;',
    '  for (let i = 0; i < n - 1; i++) {',
    '    for (let j = 0; j < n - i - 1; j++) {',
    '      if (arr[j] > arr[j + 1]) {',
    '        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];',
    '      }',
    '    }',
    '  }',
    '  return arr;',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const arr = [...data];
    const n = arr.length;
    // 追踪已排序的下标，每轮末尾元素锁定为 sorted
    const sortedIndices: Record<number, ElementState> = {};

    // 初始状态
    yield {
      type: 'mark',
      line: 1,
      message: `开始冒泡排序，n = ${n}`,
      snapshot: snap(arr, sortedIndices),
    };

    for (let i = 0; i < n - 1; i++) {
      yield {
        type: 'pointer',
        indices: [i],
        line: 3,
        message: `第 ${i + 1} 轮：外层循环 i = ${i}`,
        snapshot: snap(arr, sortedIndices),
      };

      for (let j = 0; j < n - i - 1; j++) {
        // 比较步骤
        yield {
          type: 'compare',
          indices: [j, j + 1],
          line: 4,
          message: `比较 arr[${j}]=${arr[j]} 与 arr[${j + 1}]=${arr[j + 1]}`,
          snapshot: snap(arr, { ...sortedIndices, [j]: 'compare', [j + 1]: 'compare' }, { [j]: 'j', [j + 1]: 'j+1' }),
        };

        if (arr[j] > arr[j + 1]) {
          // 交换步骤
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          yield {
            type: 'swap',
            indices: [j, j + 1],
            values: [arr[j], arr[j + 1]],
            line: 5,
            message: `交换 arr[${j}]=${arr[j]} ↔ arr[${j + 1}]=${arr[j + 1]}`,
            snapshot: snap(arr, { ...sortedIndices, [j]: 'swap', [j + 1]: 'swap' }),
          };
        }
      }

      // 本轮结束，末尾元素已就位
      sortedIndices[n - 1 - i] = 'sorted';
      yield {
        type: 'mark',
        indices: [n - 1 - i],
        line: 2,
        message: `第 ${i + 1} 轮完成，arr[${n - 1 - i}]=${arr[n - 1 - i]} 已就位`,
        snapshot: snap(arr, sortedIndices),
      };
    }

    // 第一个元素也标记为 sorted
    sortedIndices[0] = 'sorted';
    yield {
      type: 'done',
      line: 10,
      message: '排序完成！所有元素已按升序排列。',
      snapshot: snap(arr, sortedIndices),
    };
  },
};
