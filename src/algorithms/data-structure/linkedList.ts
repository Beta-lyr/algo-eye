// ============================================================
// 链表 — Linked List
// 展示插入、删除、搜索操作
// ============================================================

import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState } from '../../engine/types';

/** 链表节点 */
interface ListNode {
  id: number;
  value: number;
  next: ListNode | null;
}

/** 创建新节点 */
let nodeIdCounter = 0;
function createNode(value: number): ListNode {
  return { id: nodeIdCounter++, value, next: null };
}

/** 深拷贝链表 */
function cloneList(head: ListNode | null): ListNode | null {
  if (!head) return null;
  return {
    id: head.id,
    value: head.value,
    next: cloneList(head.next),
  };
}

/** 创建快照 */
function listSnap(
  head: ListNode | null,
  nodeStates: Record<number, ElementState>,
  arrayData: number[] = [],
): Snapshot {
  return {
    kind: 'linked-list',
    data: arrayData,
    states: {},
    linkedList: cloneList(head),
    nodeStates: { ...nodeStates },
  };
}

export const linkedList: Algorithm = {
  id: 'linked-list',
  name: '链表',
  category: 'data-structure',
  complexity: { time: 'O(n)', space: 'O(n)' },
  dataKind: 'linked-list',
  defaultData: [10, 20, 30, 40, 50],
  codeLines: [
    'class LinkedList {',
    '  insertAtHead(val) {',
    '    let node = new Node(val);',
    '    node.next = head;',
    '    head = node;',
    '  }',
    '  insertAtTail(val) {',
    '    let node = new Node(val);',
    '    if (!head) { head = node; return; }',
    '    let curr = head;',
    '    while (curr.next) curr = curr.next;',
    '    curr.next = node;',
    '  }',
    '  delete(val) {',
    '    if (!head) return;',
    '    if (head.val === val) { head = head.next; return; }',
    '    let curr = head;',
    '    while (curr.next && curr.next.val !== val)',
    '      curr = curr.next;',
    '    if (curr.next) curr.next = curr.next.next;',
    '  }',
    '  search(val) {',
    '    let curr = head, i = 0;',
    '    while (curr) {',
    '      if (curr.val === val) return i;',
    '      curr = curr.next; i++;',
    '    }',
    '    return -1;',
    '  }',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    nodeIdCounter = 0;
    let head: ListNode | null = null;
    const nodeStates: Record<number, ElementState> = {};
    const values: number[] = [];

    yield {
      type: 'mark',
      line: 1,
      message: '初始化空链表',
      snapshot: listSnap(head, nodeStates, values),
    };

    // 头部插入演示
    yield {
      type: 'pointer',
      line: 2,
      message: '演示头部插入',
      snapshot: listSnap(head, nodeStates, values),
    };

    for (let i = 0; i < Math.min(3, data.length); i++) {
      const val = data[i];
      const newNode = createNode(val);
      newNode.next = head;
      head = newNode;
      values.unshift(val);

      nodeStates[newNode.id] = 'compare';
      yield {
        type: 'set',
        line: 4,
        message: `头部插入 ${val}`,
        snapshot: listSnap(head, nodeStates, values),
      };

      nodeStates[newNode.id] = 'sorted';
    }

    // 尾部插入演示
    yield {
      type: 'pointer',
      line: 7,
      message: '演示尾部插入',
      snapshot: listSnap(head, nodeStates, values),
    };

    for (let i = 3; i < data.length; i++) {
      const val = data[i];
      const newNode = createNode(val);

      if (!head) {
        head = newNode;
      } else {
        let curr: ListNode = head;
        nodeStates[curr.id] = 'current';

        yield {
          type: 'pointer',
          line: 10,
          message: `尾部插入 ${val}：从头遍历`,
          snapshot: listSnap(head, nodeStates, values),
        };

        while (curr.next) {
          nodeStates[curr.id] = 'visit';
          curr = curr.next;
          nodeStates[curr.id] = 'current';

          yield {
            type: 'compare',
            line: 11,
            message: `遍历到节点 ${curr.value}`,
            snapshot: listSnap(head, nodeStates, values),
          };
        }

        curr.next = newNode;
        nodeStates[curr.id] = 'sorted';
      }

      values.push(val);
      nodeStates[newNode.id] = 'compare';

      yield {
        type: 'set',
        line: 12,
        message: `尾部插入 ${val} 完成`,
        snapshot: listSnap(head, nodeStates, values),
      };

      nodeStates[newNode.id] = 'sorted';
    }

    // 搜索演示
    const searchTarget = data[Math.floor(Math.random() * data.length)];
    yield {
      type: 'pointer',
      line: 22,
      message: `演示搜索：查找 ${searchTarget}`,
      snapshot: listSnap(head, nodeStates, values),
    };

    let curr: ListNode | null = head;
    let index = 0;
    while (curr) {
      nodeStates[curr.id] = 'current';

      yield {
        type: 'compare',
        line: 24,
        message: `检查节点 ${curr.value} === ${searchTarget}?`,
        snapshot: listSnap(head, nodeStates, values),
      };

      if (curr.value === searchTarget) {
        nodeStates[curr.id] = 'path';

        yield {
          type: 'mark',
          line: 25,
          message: `✓ 找到目标！${searchTarget} 在索引 ${index}`,
          snapshot: listSnap(head, nodeStates, values),
        };
        break;
      }

      nodeStates[curr.id] = 'visit';
      curr = curr.next;
      index++;
    }

    if (!curr) {
      yield {
        type: 'done',
        line: 28,
        message: `未找到目标值 ${searchTarget}`,
        snapshot: listSnap(head, nodeStates, values),
      };
    }

    // 删除演示
    const deleteTarget = data[0]; // 删除头部
    yield {
      type: 'pointer',
      line: 14,
      message: `演示删除：删除 ${deleteTarget}`,
      snapshot: listSnap(head, nodeStates, values),
    };

    if (head && head.value === deleteTarget) {
      nodeStates[head.id] = 'swap';

      yield {
        type: 'compare',
        line: 16,
        message: `头节点 ${head.value} === ${deleteTarget}，删除`,
        snapshot: listSnap(head, nodeStates, values),
      };

      head = head.next;
      values.shift();

      yield {
        type: 'set',
        line: 16,
        message: `删除 ${deleteTarget} 完成`,
        snapshot: listSnap(head, nodeStates, values),
      };
    }

    yield {
      type: 'done',
      line: 30,
      message: '链表操作演示完成',
      snapshot: listSnap(head, nodeStates, values),
    };
  },
};
