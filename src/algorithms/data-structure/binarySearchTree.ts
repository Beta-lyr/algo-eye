// ============================================================
// 二叉搜索树 — Binary Search Tree
// 展示 BST 的插入和搜索操作
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

export const binarySearchTree: Algorithm = {
  id: 'binary-search-tree',
  name: '二叉搜索树',
  category: 'data-structure',
  complexity: { time: 'O(log n)', space: 'O(n)' },
  dataKind: 'tree',
  defaultData: [50, 30, 70, 20, 40, 60, 80],
  codeLines: [
    'class BST {',
    '  insert(val) {',
    '    if (!this.root) { this.root = new Node(val); return; }',
    '    let curr = this.root;',
    '    while (curr) {',
    '      if (val < curr.val) {',
    '        if (!curr.left) { curr.left = new Node(val); break; }',
    '        curr = curr.left;',
    '      } else {',
    '        if (!curr.right) { curr.right = new Node(val); break; }',
    '        curr = curr.right;',
    '      }',
    '    }',
    '  }',
    '  search(val) {',
    '    let curr = this.root;',
    '    while (curr) {',
    '      if (val === curr.val) return curr;',
    '      curr = val < curr.val ? curr.left : curr.right;',
    '    }',
    '    return null;',
    '  }',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    nodeIdCounter = 0;
    let root: TreeNode | null = null;
    const nodeStates: Record<number, ElementState> = {};
    const insertedValues: number[] = [];

    yield {
      type: 'mark',
      line: 1,
      message: '初始化空二叉搜索树',
      snapshot: treeSnap(root, nodeStates, insertedValues),
    };

    // 插入所有数据
    for (const val of data) {
      insertedValues.push(val);

      if (!root) {
        root = createNode(val);
        nodeStates[root.id] = 'sorted';
        yield {
          type: 'set',
          line: 2,
          message: `插入根节点：${val}`,
          snapshot: treeSnap(root, nodeStates, insertedValues),
        };
        continue;
      }

      let curr = root;
      yield {
        type: 'pointer',
        line: 3,
        message: `插入 ${val}：从根节点 ${root.value} 开始`,
        snapshot: treeSnap(root, { ...nodeStates, [root.id]: 'current' }, insertedValues),
      };

      while (curr) {
        if (val < curr.value) {
          if (!curr.left) {
            const newNode = createNode(val);
            curr.left = newNode;
            nodeStates[newNode.id] = 'sorted';
            yield {
              type: 'set',
              indices: [val],
              line: 6,
              message: `${val} < ${curr.value}，插入为左子节点`,
              snapshot: treeSnap(root, { ...nodeStates, [newNode.id]: 'compare' }, insertedValues),
            };
            break;
          }
          yield {
            type: 'compare',
            line: 5,
            message: `${val} < ${curr.value}，向左移动`,
            snapshot: treeSnap(root, { ...nodeStates, [curr.id]: 'visit' }, insertedValues),
          };
          curr = curr.left;
        } else {
          if (!curr.right) {
            const newNode = createNode(val);
            curr.right = newNode;
            nodeStates[newNode.id] = 'sorted';
            yield {
              type: 'set',
              indices: [val],
              line: 9,
              message: `${val} ≥ ${curr.value}，插入为右子节点`,
              snapshot: treeSnap(root, { ...nodeStates, [newNode.id]: 'compare' }, insertedValues),
            };
            break;
          }
          yield {
            type: 'compare',
            line: 8,
            message: `${val} ≥ ${curr.value}，向右移动`,
            snapshot: treeSnap(root, { ...nodeStates, [curr.id]: 'visit' }, insertedValues),
          };
          curr = curr.right;
        }
      }

      // 重置所有节点状态为默认
      for (const id in nodeStates) {
        nodeStates[id] = 'sorted';
      }
    }

    // 搜索演示
    const searchTarget = data[Math.floor(Math.random() * data.length)];
    yield {
      type: 'pointer',
      line: 14,
      message: `插入完成，开始搜索 target = ${searchTarget}`,
      snapshot: treeSnap(root, nodeStates, insertedValues),
    };

    let curr: TreeNode | null = root;
    while (curr) {
      if (searchTarget === curr.value) {
        yield {
          type: 'mark',
          line: 17,
          message: `✓ 找到目标！节点值 = ${searchTarget}`,
          snapshot: treeSnap(root, { ...nodeStates, [curr.id]: 'path' }, insertedValues),
        };
        break;
      }

      nodeStates[curr.id] = 'compare';
      yield {
        type: 'compare',
        line: 16,
        message: `比较 ${searchTarget} 与节点 ${curr.value}`,
        snapshot: treeSnap(root, nodeStates, insertedValues),
      };

      if (searchTarget < curr.value) {
        nodeStates[curr.id] = 'visit';
        curr = curr.left;
      } else {
        nodeStates[curr.id] = 'visit';
        curr = curr.right;
      }

      if (curr) {
        yield {
          type: 'pointer',
          line: 18,
          message: `移动到 ${searchTarget < curr.value ? '左' : '右'}子节点`,
          snapshot: treeSnap(root, { ...nodeStates, [curr.id]: 'current' }, insertedValues),
        };
      }
    }

    if (!curr) {
      yield {
        type: 'done',
        line: 19,
        message: `未找到目标值 ${searchTarget}`,
        snapshot: treeSnap(root, nodeStates, insertedValues),
      };
    }

    yield {
      type: 'done',
      line: 21,
      message: 'BST 操作完成',
      snapshot: treeSnap(root, nodeStates, insertedValues),
    };
  },
};
