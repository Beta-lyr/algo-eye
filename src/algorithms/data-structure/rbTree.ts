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

function findParent(node: TreeNode, root: TreeNode | null): TreeNode | null {
  if (!root || root === node) return null;
  const q: TreeNode[] = [root];
  while (q.length > 0) {
    const c = q.shift()!;
    if (c.left === node || c.right === node) return c;
    if (c.left) q.push(c.left);
    if (c.right) q.push(c.right);
  }
  return null;
}

const RED: ElementState = 'compare';
const BLACK: ElementState = 'sorted';

export const rbTree: Algorithm = {
  id: 'red-black-tree',
  name: '红黑树',
  category: 'data-structure',
  complexity: { time: 'O(log n)', space: 'O(n)' },
  difficulty: 'advanced',
  tags: ['tree-based'],
  dataKind: 'tree',
  defaultData: [50, 30, 70, 20, 40, 60, 80, 35],
  codeLines: [
    'function insert(root, val) {',
    '  root = bstInsert(root, val);',
    '  fixViolation(root, val);',
    '  root.color = BLACK;',
    '  return root;',
    '}',
    'function fixViolation(root, z) {',
    '  while (z != root && z.parent.color == RED) {',
    '    let uncle = getUncle(z);',
    '    if (uncle && uncle.color == RED) {',
    '      // Case 1: recolor',
    '      recolor(z.parent, uncle, grandparent);',
    '      z = grandparent;',
    '    } else {',
    '      // Case 2+3: rotate',
    '      z = alignTriangle(z);',
    '      rotateGrandparent(z);',
    '      recolor(z.parent, grandparent);',
    '      break;',
    '    }',
    '  }',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    nodeIdCounter = 0;
    let root: TreeNode | null = null;
    const color: Record<number, ElementState> = {};
    const insertedValues: number[] = [];

    function setCol(node: TreeNode, c: ElementState) { color[node.id] = c; }
    function isRed(node: TreeNode | null): boolean { return node !== null && color[node.id] === RED; }

    yield {
      type: 'mark',
      line: 1,
      message: '初始化空红黑树',
      snapshot: treeSnap(root, color, insertedValues),
    };

    for (const val of data) {
      insertedValues.push(val);

      if (!root) {
        root = createNode(val);
        setCol(root, BLACK);
        yield {
          type: 'set',
          line: 1,
          message: `插入根节点：${val}，颜色 = 黑色`,
          snapshot: treeSnap(root, color, insertedValues),
        };
        continue;
      }

      let curr: TreeNode | null = root;
      let newNode: TreeNode | null = null;

      yield {
        type: 'pointer',
        line: 1,
        message: `插入 ${val}：从根节点 ${root.value} 开始`,
        snapshot: treeSnap(root, { ...color, [root.id]: 'current' }, insertedValues),
      };

      while (curr) {
        if (val < curr.value) {
          if (!curr.left) {
            newNode = createNode(val);
            curr.left = newNode;
            setCol(newNode, RED);
            yield {
              type: 'set',
              line: 1,
              message: `${val} < ${curr.value}，插入为左子节点（红色）`,
              snapshot: treeSnap(root, { ...color, [newNode.id]: RED }, insertedValues),
            };
            break;
          }
          yield {
            type: 'compare',
            line: 1,
            message: `${val} < ${curr.value}，向左移动`,
            snapshot: treeSnap(root, { ...color, [curr.id]: 'visit' }, insertedValues),
          };
          curr = curr.left;
        } else {
          if (!curr.right) {
            newNode = createNode(val);
            curr.right = newNode;
            setCol(newNode, RED);
            yield {
              type: 'set',
              line: 1,
              message: `${val} ≥ ${curr.value}，插入为右子节点（红色）`,
              snapshot: treeSnap(root, { ...color, [newNode.id]: RED }, insertedValues),
            };
            break;
          }
          yield {
            type: 'compare',
            line: 1,
            message: `${val} ≥ ${curr.value}，向右移动`,
            snapshot: treeSnap(root, { ...color, [curr.id]: 'visit' }, insertedValues),
          };
          curr = curr.right;
        }
      }

      if (!newNode) continue;

      let z: TreeNode | null = newNode;
      let iter = 0;

      while (z !== root) {
        if (iter++ > 20) break;
        const p = findParent(z, root);
        if (!p || !isRed(p)) break;

        const gp = findParent(p, root);
        if (!gp) {
          setCol(p, BLACK);
          yield {
            type: 'mark',
            line: 4,
            message: '父节点是根，设为黑色',
            snapshot: treeSnap(root, color, insertedValues),
          };
          break;
        }

        const pIsLeft = p === gp.left;
        const u = pIsLeft ? gp.right : gp.left;

        if (isRed(u)) {
          setCol(p, BLACK);
          setCol(u, BLACK);
          setCol(gp, RED);
          yield {
            type: 'swap',
            line: 11,
            message: `叔节点为红色：父 ${p.value} → 黑，叔 ${u.value} → 黑，爷 ${gp.value} → 红`,
            snapshot: treeSnap(root, color, insertedValues),
          };
          z = gp;
          continue;
        }

        // Uncle is black — triangle check
        if (pIsLeft && z === p.right) {
          yield {
            type: 'swap',
            line: 16,
            message: `LR 型：对 ${p.value} 左旋`,
            snapshot: treeSnap(root, { ...color, [p.id]: 'swap', [z.id]: 'compare' }, insertedValues),
          };
          gp.left = rotateLeft(p);
          z = p;
        } else if (!pIsLeft && z === p.left) {
          yield {
            type: 'swap',
            line: 16,
            message: `RL 型：对 ${p.value} 右旋`,
            snapshot: treeSnap(root, { ...color, [p.id]: 'swap', [z.id]: 'compare' }, insertedValues),
          };
          gp.right = rotateRight(p);
          z = p;
        }

        const p2 = findParent(z, root)!;
        const gp2 = findParent(p2, root)!;

        setCol(p2, BLACK);
        setCol(gp2, RED);

        if (p2 === gp2.left) {
          yield {
            type: 'swap',
            line: 17,
            message: `LL 型：对 ${gp2.value} 右旋，变色`,
            snapshot: treeSnap(root, color, insertedValues),
          };
          if (gp2 === root) {
            root = rotateRight(gp2);
          } else {
            const gpp = findParent(gp2, root);
            if (gpp!.left === gp2) gpp!.left = rotateRight(gp2);
            else gpp!.right = rotateRight(gp2);
          }
        } else {
          yield {
            type: 'swap',
            line: 17,
            message: `RR 型：对 ${gp2.value} 左旋，变色`,
            snapshot: treeSnap(root, color, insertedValues),
          };
          if (gp2 === root) {
            root = rotateLeft(gp2);
          } else {
            const gpp = findParent(gp2, root);
            if (gpp!.left === gp2) gpp!.left = rotateLeft(gp2);
            else gpp!.right = rotateLeft(gp2);
          }
        }

        yield {
          type: 'mark',
          line: 18,
          message: '旋转 + 变色完成',
          snapshot: treeSnap(root, color, insertedValues),
        };
        break;
      }

      if (root) setCol(root, BLACK);

      yield {
        type: 'mark',
        line: 4,
        message: `插入 ${val} 完成，根节点为黑色`,
        snapshot: treeSnap(root, color, insertedValues),
      };
    }

    yield {
      type: 'done',
      line: 6,
      message: '红黑树构建完成',
      snapshot: treeSnap(root, color, insertedValues),
    };
  },
};
