// ============================================================
// 堆 — Heap (Max Heap)
// 展示插入（上浮）和删除（下沉）操作
// ============================================================

import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState, TreeNode } from '../../engine/types';

/** 创建新节点 */
let nodeIdCounter = 0;
function createNode(value: number): TreeNode {
  return { id: nodeIdCounter++, value, left: null, right: null };
}

/** 深拷贝树（用于快照） */
function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

/** 创建树快照 */
function treeSnap(
  tree: TreeNode | null,
  nodeStates: Record<number, ElementState>,
  arrayData: number[] = [],
): Snapshot {
  return {
    kind: 'tree',
    data: arrayData,
    states: {},
    tree: cloneTree(tree) ?? undefined,
    nodeStates: { ...nodeStates },
  };
}

/** 从数组构建完全二叉树 */
function buildHeapTree(heap: number[], index: number): TreeNode | null {
  if (index >= heap.length) return null;
  const node = createNode(heap[index]);
  node.left = buildHeapTree(heap, 2 * index + 1);
  node.right = buildHeapTree(heap, 2 * index + 2);
  return node;
}

/** 获取节点在数组中的父节点索引 */
function parent(i: number): number {
  return Math.floor((i - 1) / 2);
}

export const heap: Algorithm = {
  id: 'heap',
  name: '堆',
  category: 'data-structure',
  complexity: { time: 'O(log n)', space: 'O(n)' },
  difficulty: 'intermediate',
  tags: ['tree-based'],
  dataKind: 'tree',
  defaultData: [40, 30, 20, 15, 10, 25, 18],
  codeLines: [
    'class MaxHeap {',
    '  insert(val) {',
    '    heap.push(val);  // 添加到末尾',
    '    siftUp(heap.length - 1);  // 上浮',
    '  }',
    '  siftUp(i) {',
    '    while (i > 0 && heap[i] > heap[parent(i)]) {',
    '      swap(heap, i, parent(i));  // 交换',
    '      i = parent(i);',
    '    }',
    '  }',
    '  extractMax() {',
    '    let max = heap[0];',
    '    heap[0] = heap.pop();  // 末尾放根',
    '    siftDown(0);  // 下沉',
    '    return max;',
    '  }',
    '  siftDown(i) {',
    '    while (2*i+1 < heap.length) {',
    '      let child = 2*i+1;',
    '      if (child+1 < heap.length && heap[child+1] > heap[child])',
    '        child++;',
    '      if (heap[i] >= heap[child]) break;',
    '      swap(heap, i, child);',
    '      i = child;',
    '    }',
    '  }',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    nodeIdCounter = 0;
    const heap: number[] = [];
    const nodeStates: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: '初始化空堆（最大堆）',
      snapshot: treeSnap(null, nodeStates, heap),
    };

    // 插入元素并演示上浮
    for (const val of data) {
      heap.push(val);
      let i = heap.length - 1;

      // 重建树用于可视化
      nodeIdCounter = 0;
      let tree = buildHeapTree(heap, 0);
      nodeStates[heap.length - 1] = 'compare';

      yield {
        type: 'set',
        line: 2,
        message: `插入 ${val} 到末尾（索引 ${i}）`,
        snapshot: treeSnap(tree, nodeStates, [...heap]),
      };

      // 上浮过程
      while (i > 0 && heap[i] > heap[parent(i)]) {
        const p = parent(i);

        nodeStates[i] = 'swap';
        nodeStates[p] = 'swap';
        nodeIdCounter = 0;
        tree = buildHeapTree(heap, 0);

        yield {
          type: 'compare',
          line: 6,
          message: `上浮：heap[${i}]=${heap[i]} > heap[${p}]=${heap[p]}，交换`,
          snapshot: treeSnap(tree, nodeStates, [...heap]),
        };

        // 交换
        [heap[i], heap[p]] = [heap[p], heap[i]];
        nodeIdCounter = 0;
        tree = buildHeapTree(heap, 0);

        yield {
          type: 'swap',
          indices: [i, p],
          values: [heap[i], heap[p]],
          line: 7,
          message: `交换完成：heap[${i}]=${heap[i]}，heap[${p}]=${heap[p]}`,
          snapshot: treeSnap(tree, { ...nodeStates, [i]: 'sorted', [p]: 'sorted' }, [...heap]),
        };

        i = p;
      }

      // 标记所有节点为已排序
      for (let k = 0; k < heap.length; k++) {
        nodeStates[k] = 'sorted';
      }
      nodeIdCounter = 0;
      tree = buildHeapTree(heap, 0);

      yield {
        type: 'mark',
        line: 3,
        message: `插入 ${val} 完成，堆：[${heap.join(', ')}]`,
        snapshot: treeSnap(tree, nodeStates, [...heap]),
      };
    }

    // 演示删除最大元素（下沉）
    yield {
      type: 'pointer',
      line: 11,
      message: `插入完成，开始演示删除最大元素（下沉）`,
      snapshot: treeSnap(buildHeapTree(heap, 0), nodeStates, [...heap]),
    };

    for (let round = 0; round < 3 && heap.length > 1; round++) {
      const max = heap[0];
      nodeStates[0] = 'pivot';

      nodeIdCounter = 0;
      let tree = buildHeapTree(heap, 0);

      yield {
        type: 'pointer',
        line: 12,
        message: `提取最大值：${max}`,
        snapshot: treeSnap(tree, nodeStates, [...heap]),
      };

      // 将末尾元素放到根节点
      heap[0] = heap[heap.length - 1];
      heap.pop();
      let i = 0;

      nodeIdCounter = 0;
      tree = buildHeapTree(heap, 0);

      yield {
        type: 'set',
        line: 13,
        message: `末尾元素 ${heap[0]} 移到根节点`,
        snapshot: treeSnap(tree, { ...nodeStates, [0]: 'compare' }, [...heap]),
      };

      // 下沉过程
      while (2 * i + 1 < heap.length) {
        let child = 2 * i + 1;

        nodeStates[i] = 'compare';
        nodeStates[child] = 'visit';

        if (child + 1 < heap.length && heap[child + 1] > heap[child]) {
          nodeStates[child + 1] = 'visit';
          child++;
        }

        nodeIdCounter = 0;
        tree = buildHeapTree(heap, 0);

        yield {
          type: 'compare',
          line: 18,
          message: `下沉：比较 heap[${i}]=${heap[i]} 与 heap[${child}]=${heap[child]}`,
          snapshot: treeSnap(tree, nodeStates, [...heap]),
        };

        if (heap[i] >= heap[child]) {
          yield {
            type: 'mark',
            line: 20,
            message: `堆性质满足，停止下沉`,
            snapshot: treeSnap(tree, { ...nodeStates, [i]: 'sorted' }, [...heap]),
          };
          break;
        }

        // 交换
        nodeStates[i] = 'swap';
        nodeStates[child] = 'swap';
        nodeIdCounter = 0;
        tree = buildHeapTree(heap, 0);

        yield {
          type: 'swap',
          indices: [i, child],
          values: [heap[i], heap[child]],
          line: 21,
          message: `交换 heap[${i}] ↔ heap[${child}]`,
          snapshot: treeSnap(tree, nodeStates, [...heap]),
        };

        [heap[i], heap[child]] = [heap[child], heap[i]];
        i = child;

        // 重置状态
        for (let k = 0; k < heap.length; k++) {
          if (nodeStates[k] !== 'pivot') nodeStates[k] = 'default';
        }
      }

      // 标记所有节点为已排序
      for (let k = 0; k < heap.length; k++) {
        nodeStates[k] = 'sorted';
      }
      nodeIdCounter = 0;
      tree = buildHeapTree(heap, 0);

      yield {
        type: 'mark',
        line: 14,
        message: `删除 ${max} 完成，堆：[${heap.join(', ')}]`,
        snapshot: treeSnap(tree, nodeStates, [...heap]),
      };
    }

    yield {
      type: 'done',
      line: 26,
      message: '堆操作演示完成',
      snapshot: treeSnap(buildHeapTree(heap, 0), nodeStates, [...heap]),
    };
  },
};
