// ============================================================
// 堆排序 — Heap Sort
// 建大顶堆 → 逐个取出堆顶放到末尾
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

export const heapSort: Algorithm = {
  id: 'heap-sort',
  name: '堆排序',
  category: 'sorting',
  complexity: { time: 'O(n log n)', space: 'O(1)', stable: false },
  dataKind: 'array',
  defaultData: [38, 27, 43, 3, 9, 82, 10, 56, 74, 61, 45, 29],
  codeLines: [
    'function heapSort(arr) {',
    '  const n = arr.length;',
    '  // 建堆：从最后一个非叶节点开始下沉',
    '  for (let i = Math.floor(n/2)-1; i >= 0; i--)',
    '    heapify(arr, n, i);',
    '  // 逐个取出堆顶',
    '  for (let i = n - 1; i > 0; i--) {',
    '    [arr[0], arr[i]] = [arr[i], arr[0]];',
    '    heapify(arr, i, 0);',
    '  }',
    '}',
    'function heapify(n, i) {',
    '  let largest = i;',
    '  let l = 2*i+1, r = 2*i+2;',
    '  if (l < n && arr[l] > arr[largest]) largest = l;',
    '  if (r < n && arr[r] > arr[largest]) largest = r;',
    '  if (largest !== i) {',
    '    [arr[i], arr[largest]] = [arr[largest], arr[i]];',
    '    heapify(n, largest);',
    '  }',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const arr = [...data];
    const n = arr.length;
    const sortedIndices: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: `开始堆排序，n = ${n}`,
      snapshot: snap(arr, sortedIndices),
    };

    // 下沉操作（记录步骤）
    function* heapifyGen(
      heapSize: number,
      i: number,
      sorted: Record<number, ElementState>,
    ): Generator<Step> {
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;

      yield {
        type: 'pointer',
        indices: [i],
        line: 12,
        message: `heapify(size=${heapSize}, i=${i})，检查节点 arr[${i}]=${arr[i]}`,
        snapshot: snap(arr, { ...sorted, [i]: 'current' }, { [i]: 'i' }),
      };

      if (l < heapSize) {
        yield {
          type: 'compare',
          indices: [l, largest],
          line: 14,
          message: `比较左子 arr[${l}]=${arr[l]} 与 arr[${largest}]=${arr[largest]}`,
          snapshot: snap(arr, { ...sorted, [l]: 'compare', [largest]: 'compare' }),
        };
        if (arr[l] > arr[largest]) largest = l;
      }

      if (r < heapSize) {
        yield {
          type: 'compare',
          indices: [r, largest],
          line: 15,
          message: `比较右子 arr[${r}]=${arr[r]} 与 arr[${largest}]=${arr[largest]}`,
          snapshot: snap(arr, { ...sorted, [r]: 'compare', [largest]: 'compare' }),
        };
        if (arr[r] > arr[largest]) largest = r;
      }

      if (largest !== i) {
        yield {
          type: 'swap',
          indices: [i, largest],
          values: [arr[largest], arr[i]],
          line: 17,
          message: `交换 arr[${i}] ↔ arr[${largest}]`,
          snapshot: snap(arr, { ...sorted, [i]: 'swap', [largest]: 'swap' }),
        };

        [arr[i], arr[largest]] = [arr[largest], arr[i]];

        // 递归下沉
        yield* heapifyGen(heapSize, largest, sorted);
      }
    }

    // 阶段一：建堆
    yield {
      type: 'pointer',
      line: 3,
      message: '阶段一：建立大顶堆',
      snapshot: snap(arr, sortedIndices),
    };

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      yield* heapifyGen(n, i, sortedIndices);
    }

    yield {
      type: 'mark',
      line: 5,
      message: '大顶堆建立完成',
      snapshot: snap(arr, (() => {
        const s: Record<number, ElementState> = {};
        s[0] = 'pivot';
        return s;
      })()),
    };

    // 阶段二：逐个取出堆顶
    yield {
      type: 'pointer',
      line: 6,
      message: '阶段二：逐个取出堆顶放到末尾',
      snapshot: snap(arr, sortedIndices),
    };

    for (let i = n - 1; i > 0; i--) {
      yield {
        type: 'swap',
        indices: [0, i],
        values: [arr[i], arr[0]],
        line: 7,
        message: `堆顶 arr[0]=${arr[0]} 与 arr[${i}]=${arr[i]} 交换`,
        snapshot: snap(arr, { ...sortedIndices, [0]: 'swap', [i]: 'swap' }),
      };

      [arr[0], arr[i]] = [arr[i], arr[0]];
      sortedIndices[i] = 'sorted';

      yield* heapifyGen(i, 0, sortedIndices);
    }

    sortedIndices[0] = 'sorted';
    yield {
      type: 'done',
      line: 10,
      message: '排序完成！所有元素已按升序排列。',
      snapshot: snap(arr, sortedIndices),
    };
  },
};
