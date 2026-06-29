import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState, TreeNode } from '../../engine/types';

let nodeIdCounter = 0;
function createNode(value: number): TreeNode {
  return { id: nodeIdCounter++, value, left: null, right: null };
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

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

function height(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(height(node.left), height(node.right));
}

function balanceFactor(node: TreeNode | null): number {
  if (!node) return 0;
  return height(node.left) - height(node.right);
}

function rotateRight(y: TreeNode): TreeNode {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  return x;
}

function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  return y;
}

export const avlTree: Algorithm = {
  id: 'avl-tree',
  name: 'AVL 树',
  category: 'data-structure',
  complexity: { time: 'O(log n)', space: 'O(n)' },
  difficulty: 'intermediate',
  tags: ['tree-based'],
  dataKind: 'tree',
  defaultData: [50, 30, 70, 20, 40, 80, 35],
  codeLines: [
    'function insert(root, val) {',
    '  if (!root) return new Node(val);',
    '  if (val < root.val)',
    '    root.left = insert(root.left, val);',
    '  else',
    '    root.right = insert(root.right, val);',
    '  root.height = 1 + max(height(left), height(right));',
    '  const bf = getBalance(root);',
    '  if (bf > 1 && val < root.left.val) return rightRotate(root);     // LL',
    '  if (bf < -1 && val > root.right.val) return leftRotate(root);    // RR',
    '  if (bf > 1 && val > root.left.val) {                             // LR',
    '    root.left = leftRotate(root.left);',
    '    return rightRotate(root);',
    '  }',
    '  if (bf < -1 && val < root.right.val) {                           // RL',
    '    root.right = rightRotate(root.right);',
    '    return leftRotate(root);',
    '  }',
    '  return root;',
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
      message: '初始化空 AVL 树',
      snapshot: treeSnap(root, nodeStates, insertedValues),
    };

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

      const path: TreeNode[] = [];
      let curr = root;

      yield {
        type: 'pointer',
        line: 3,
        message: `插入 ${val}：从根节点 ${root.value} 开始`,
        snapshot: treeSnap(root, { ...nodeStates, [root.id]: 'current' }, insertedValues),
      };

      while (curr) {
        path.push(curr);

        if (val < curr.value) {
          if (!curr.left) {
            const newNode = createNode(val);
            curr.left = newNode;
            path.push(newNode);
            yield {
              type: 'set',
              line: 4,
              message: `${val} < ${curr.value}，插入为左子节点`,
              snapshot: treeSnap(root, { ...nodeStates, [newNode.id]: 'compare' }, insertedValues),
            };
            break;
          }
          yield {
            type: 'compare',
            line: 3,
            message: `${val} < ${curr.value}，向左移动`,
            snapshot: treeSnap(root, { ...nodeStates, [curr.id]: 'visit' }, insertedValues),
          };
          curr = curr.left;
        } else {
          if (!curr.right) {
            const newNode = createNode(val);
            curr.right = newNode;
            path.push(newNode);
            yield {
              type: 'set',
              line: 6,
              message: `${val} ≥ ${curr.value}，插入为右子节点`,
              snapshot: treeSnap(root, { ...nodeStates, [newNode.id]: 'compare' }, insertedValues),
            };
            break;
          }
          yield {
            type: 'compare',
            line: 5,
            message: `${val} ≥ ${curr.value}，向右移动`,
            snapshot: treeSnap(root, { ...nodeStates, [curr.id]: 'visit' }, insertedValues),
          };
          curr = curr.right;
        }
      }

      for (const id in nodeStates) {
        nodeStates[id] = 'sorted';
      }

      for (let i = path.length - 1; i >= 0; i--) {
        const node = path[i];
        const bf = balanceFactor(node);
        const h = height(node);

        yield {
          type: 'visit',
          line: 7,
          message: `节点 ${node.value}：高度 = ${h}，平衡因子 = ${bf}`,
          snapshot: treeSnap(root, { ...nodeStates, [node.id]: 'visit' }, insertedValues),
        };

        if (Math.abs(bf) > 1) {
          yield {
            type: 'compare',
            line: 8,
            message: `节点 ${node.value} 不平衡（|bf| = ${Math.abs(bf)}）`,
            snapshot: treeSnap(root, { ...nodeStates, [node.id]: 'swap' }, insertedValues),
          };

          if (bf > 1 && val < node.left!.value) {
            yield {
              type: 'swap',
              line: 9,
              message: `LL 型：对 ${node.value} 右旋`,
              snapshot: treeSnap(root, { ...nodeStates, [node.id]: 'swap', [node.left!.id]: 'compare' }, insertedValues),
            };
            const rotated = rotateRight(node);
            if (i > 0) {
              const parent = path[i - 1];
              if (parent.left === node) parent.left = rotated;
              else parent.right = rotated;
            } else {
              root = rotated;
            }
          } else if (bf < -1 && val > node.right!.value) {
            yield {
              type: 'swap',
              line: 10,
              message: `RR 型：对 ${node.value} 左旋`,
              snapshot: treeSnap(root, { ...nodeStates, [node.id]: 'swap', [node.right!.id]: 'compare' }, insertedValues),
            };
            const rotated = rotateLeft(node);
            if (i > 0) {
              const parent = path[i - 1];
              if (parent.left === node) parent.left = rotated;
              else parent.right = rotated;
            } else {
              root = rotated;
            }
          } else if (bf > 1 && val > node.left!.value) {
            yield {
              type: 'swap',
              line: 11,
              message: `LR 型：对 ${node.left!.value} 左旋，再对 ${node.value} 右旋`,
              snapshot: treeSnap(root, { ...nodeStates, [node.left!.id]: 'swap', [node.id]: 'compare' }, insertedValues),
            };
            node.left = rotateLeft(node.left!);
            const rotated = rotateRight(node);
            if (i > 0) {
              const parent = path[i - 1];
              if (parent.left === node) parent.left = rotated;
              else parent.right = rotated;
            } else {
              root = rotated;
            }
          } else if (bf < -1 && val < node.right!.value) {
            yield {
              type: 'swap',
              line: 15,
              message: `RL 型：对 ${node.right!.value} 右旋，再对 ${node.value} 左旋`,
              snapshot: treeSnap(root, { ...nodeStates, [node.right!.id]: 'swap', [node.id]: 'compare' }, insertedValues),
            };
            node.right = rotateRight(node.right!);
            const rotated = rotateLeft(node);
            if (i > 0) {
              const parent = path[i - 1];
              if (parent.left === node) parent.left = rotated;
              else parent.right = rotated;
            } else {
              root = rotated;
            }
          }

          for (const id in nodeStates) {
            nodeStates[id] = 'sorted';
          }
          yield {
            type: 'mark',
            line: 18,
            message: `旋转完成，树已恢复平衡`,
            snapshot: treeSnap(root, nodeStates, insertedValues),
          };
        }
      }

      const markAll = (node: TreeNode | null) => {
        if (!node) return;
        nodeStates[node.id] = 'sorted';
        markAll(node.left);
        markAll(node.right);
      };
      markAll(root);

      yield {
        type: 'mark',
        line: 18,
        message: `插入 ${val} 完成，AVL 树已平衡`,
        snapshot: treeSnap(root, nodeStates, insertedValues),
      };
    }

    yield {
      type: 'done',
      line: 18,
      message: 'AVL 树构建完成',
      snapshot: treeSnap(root, nodeStates, insertedValues),
    };
  },
};
