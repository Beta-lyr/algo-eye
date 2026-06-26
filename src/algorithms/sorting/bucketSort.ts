// ============================================================
// 桶排序 — Bucket Sort
// 将元素分配到桶中，每个桶内排序，最后合并
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

export const bucketSort: Algorithm = {
  id: 'bucket-sort',
  name: '桶排序',
  category: 'sorting',
  complexity: { time: 'O(n+k)', space: 'O(n+k)', stable: true },
  dataKind: 'array',
  defaultData: [42, 32, 63, 71, 85, 24, 15, 96, 57, 38],
  codeLines: [
    'function bucketSort(arr) {',
    '  let min = Math.min(...arr);',
    '  let max = Math.max(...arr);',
    '  let bucketCount = Math.floor((max - min) / arr.length) + 1;',
    '  let buckets = Array.from({length: bucketCount}, () => []);',
    '  for (let i = 0; i < arr.length; i++) {',
    '    let idx = Math.floor((arr[i] - min) / arr.length);',
    '    buckets[idx].push(arr[i]);',
    '  }',
    '  let k = 0;',
    '  for (let i = 0; i < buckets.length; i++) {',
    '    buckets[i].sort((a, b) => a - b);',
    '    for (let j = 0; j < buckets[i].length; j++)',
    '      arr[k++] = buckets[i][j];',
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
      message: `开始桶排序，n = ${n}`,
      snapshot: snap(arr, sortedIndices),
    };

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const bucketCount = Math.floor((max - min) / n) + 1;

    yield {
      type: 'pointer',
      line: 2,
      message: `范围：min=${min}，max=${max}，桶数=${bucketCount}`,
      snapshot: snap(arr, (() => {
        const s: Record<number, ElementState> = {};
        for (let k = 0; k < n; k++) s[k] = 'visit';
        return s;
      })()),
    };

    // 分配到桶中
    const buckets: number[][] = Array.from({ length: bucketCount }, () => []);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor((arr[i] - min) / n);
      buckets[idx].push(arr[i]);

      yield {
        type: 'set',
        indices: [i],
        line: 7,
        message: `将 ${arr[i]} 放入桶 ${idx}`,
        snapshot: snap(arr, { ...sortedIndices, [i]: 'compare' }),
      };
    }

    // 每个桶内排序并写回
    let k = 0;
    for (let i = 0; i < bucketCount; i++) {
      if (buckets[i].length === 0) continue;

      // 桶内排序（使用插入排序）
      const bucket = buckets[i];
      for (let j = 1; j < bucket.length; j++) {
        const key = bucket[j];
        let m = j - 1;
        while (m >= 0 && bucket[m] > key) {
          bucket[m + 1] = bucket[m];
          m--;
        }
        bucket[m + 1] = key;
      }

      yield {
        type: 'pointer',
        line: 11,
        message: `桶 ${i} 排序完成：[${bucket.join(', ')}]`,
        snapshot: snap(arr, (() => {
          const s: Record<number, ElementState> = {};
          for (let t = k; t < k + bucket.length; t++) s[t] = 'compare';
          return s;
        })()),
      };

      // 写回原数组
      for (let j = 0; j < bucket.length; j++) {
        arr[k] = bucket[j];
        sortedIndices[k] = 'sorted';

        yield {
          type: 'set',
          indices: [k],
          values: [bucket[j]],
          line: 13,
          message: `写回 arr[${k}] = ${bucket[j]}`,
          snapshot: snap(arr, { ...sortedIndices, [k]: 'swap' }),
        };

        k++;
      }
    }

    // 全部标记为已排序
    for (let t = 0; t < n; t++) sortedIndices[t] = 'sorted';

    yield {
      type: 'done',
      line: 16,
      message: '排序完成！所有元素已按升序排列。',
      snapshot: snap(arr, sortedIndices),
    };
  },
};
